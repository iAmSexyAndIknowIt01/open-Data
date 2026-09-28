import 'server-only';
import type { PoolClient } from 'pg';
import { pool } from './db';

export const RESERVATION_STATUSES = ['pending', 'confirmed', 'in_service', 'completed', 'cancelled', 'no_show'];
// Гараар сонгож болох төлөвүүд. 'in_service' (Ажилд шилжсэн) нь зөвхөн "Ажил эхлүүлэх"-ээр тавигдана.
export const MANUAL_RESERVATION_STATUSES = RESERVATION_STATUSES.filter((s) => s !== 'in_service');
export const LINKED_TO_WORK_ERROR = 'Энэ захиалга ажилд шилжсэн тул өөрчлөлтийг ажил дээрээс хийнэ үү.';
const CUSTOMER_TYPES = ['individual', 'company'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
// Дуусах цаггүй захиалгыг давхцал шалгахдаа ийм урттай гэж үзнэ
const DEFAULT_SLOT = '30 minutes';

// pg `date` төрлийг JS Date болгож timezone-оос болж өдөр шилжүүлдэг тул текстээр авна
export const RESERVATION_SELECT = `
  r.reservation_id,
  r.company_id,
  r.customer_type,
  r.customer_id,
  r.company_customer_id,
  r.customer_name,
  r.customer_phone,
  r.customer_email,
  r.customer_address,
  r.customer_register,
  r.service_id,
  r.assigned_employee,
  to_char(r.reservation_date, 'YYYY-MM-DD') AS reservation_date,
  to_char(r.start_time, 'HH24:MI') AS start_time,
  to_char(r.end_time, 'HH24:MI') AS end_time,
  r.status,
  r.note,
  r.create_date,
  r.update_date,
  COALESCE((
    SELECT json_agg(json_build_object(
      'service_id', rs.service_id,
      'service_name', rs.service_name,
      'price', rs.price,
      'duration', rs.duration
    ) ORDER BY rs.sort_order)
    FROM mt_reservation_services rs WHERE rs.reservation_id = r.reservation_id
  ), '[]'::json) AS services,
  (SELECT string_agg(rs.service_name, ', ' ORDER BY rs.sort_order)
   FROM mt_reservation_services rs WHERE rs.reservation_id = r.reservation_id) AS service_name,
  NULLIF(TRIM(CONCAT(COALESCE(u.last_name, ''), ' ', COALESCE(u.first_name, ''))), '') AS employee_name,
  wk.work_id,
  wk.status AS work_status
`;

export const RESERVATION_FROM = `
  FROM mt_reservation r
  LEFT JOIN mt_user u ON r.assigned_employee = u.user_id
  LEFT JOIN mt_works wk ON wk.reservation_id = r.reservation_id
`;

export interface ReservationInput {
  customer_type?: unknown;
  customer_id?: unknown;
  services?: unknown;
  service_id?: unknown; // хуучин клиент: ганц үйлчилгээ
  assigned_employee?: unknown;
  reservation_date?: unknown;
  start_time?: unknown;
  end_time?: unknown;
  status?: unknown;
  note?: unknown;
}

export interface CustomerSnapshot {
  customer_id: string | null;
  company_customer_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  customer_address: string | null;
  customer_register: string | null;
}

// Захиалгын нэг үйлчилгээ. Нэр, үнэ, хугацааг захиалах үеийнхээр нь хуулж хадгална.
export interface ReservationServiceLine {
  service_id: number | null;
  service_name: string;
  price: number;
  duration: number | null;
}

export interface NormalizedReservation {
  customer_type: 'individual' | 'company';
  customer_id: string | null;
  services: ReservationServiceLine[];
  assigned_employee: string | null;
  reservation_date: string;
  start_time: string;
  end_time: string | null;
  status: string;
  note: string | null;
}

type Result<T> = { data: T; error?: never } | { data?: never; error: string };

function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function fromMinutes(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const MAX_SERVICE_LINES = 20;

// services: [{ service_id }] массивыг шалгаж, нэр/үнэ/хугацааг каталогоос нөхнө.
// service_id-гүй мөр нь каталогоос устсан үйлчилгээний хадгалсан мөр (засах үед хэвээр үлдээхэд).
async function normalizeServices(companyId: string, input: ReservationInput): Promise<Result<ReservationServiceLine[]>> {
  const raw: unknown[] = Array.isArray(input.services)
    ? input.services
    : input.service_id
      ? [{ service_id: input.service_id }]
      : [];
  if (raw.length > MAX_SERVICE_LINES) {
    return { error: `Нэг захиалгад хамгийн ихдээ ${MAX_SERVICE_LINES} үйлчилгээ нэмэх боломжтой.` };
  }

  const ids = raw
    .map((item) => (item as { service_id?: unknown })?.service_id)
    .filter((id) => id !== null && id !== undefined && id !== '')
    .map(String);
  if (new Set(ids).size !== ids.length) return { error: 'Нэг үйлчилгээг давхар нэмсэн байна.' };

  const catalog = new Map<string, { service_id: number; name: string; price: string | null; duration: number | null }>();
  if (ids.length > 0) {
    const { rows } = await pool.query(
      'SELECT service_id, name, price, duration FROM mt_services WHERE company_id = $1 AND service_id::text = ANY($2::text[])',
      [companyId, ids]
    );
    for (const row of rows) catalog.set(String(row.service_id), row);
    if (catalog.size !== ids.length) return { error: 'Сонгосон үйлчилгээ олдсонгүй.' };
  }

  const lines: ReservationServiceLine[] = [];
  for (const item of raw) {
    const line = (item ?? {}) as { service_id?: unknown; service_name?: unknown; price?: unknown; duration?: unknown };
    const service = line.service_id ? catalog.get(String(line.service_id)) : undefined;
    if (service) {
      const duration = Number(service.duration);
      lines.push({
        service_id: service.service_id,
        service_name: service.name,
        price: Number(service.price) || 0,
        duration: duration > 0 ? duration : null,
      });
    } else {
      const name = typeof line.service_name === 'string' ? line.service_name.trim().slice(0, 255) : '';
      if (!name) return { error: 'Үйлчилгээгээ сонгоно уу.' };
      const price = Number(line.price);
      const duration = Number(line.duration);
      lines.push({
        service_id: null,
        service_name: name,
        price: Number.isFinite(price) && price >= 0 ? price : 0,
        duration: Number.isInteger(duration) && duration > 0 ? duration : null,
      });
    }
  }
  return { data: lines };
}

// Хүсэлтийн утгуудыг шалгаж, ID-ууд тухайн компанийх эсэхийг баталгаажуулна.
// Дуусах цаг өгөөгүй бол бүх үйлчилгээний үргэлжлэх хугацааны нийлбэрээр (минут) тооцно.
export async function validateReservationInput(
  companyId: string,
  input: ReservationInput,
  options: { requireCustomer: boolean; isNew?: boolean }
): Promise<Result<NormalizedReservation>> {
  const customerType = String(input.customer_type ?? '').toLowerCase();
  if (!CUSTOMER_TYPES.includes(customerType)) {
    return { error: 'Харилцагчийн төрөл буруу байна.' };
  }
  const customerId = input.customer_id ? String(input.customer_id) : null;
  if (options.requireCustomer && !customerId) {
    return { error: 'Харилцагчаа сонгоно уу.' };
  }

  const date = String(input.reservation_date ?? '');
  if (!DATE_RE.test(date) || Number.isNaN(Date.parse(date))) {
    return { error: 'Захиалгын огноог зөв оруулна уу.' };
  }
  // Шинэ захиалгыг өнгөрсөн өдөрт бүртгэхгүй (Улаанбаатарын цагаар)
  const todayUb = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ulaanbaatar' }).format(new Date());
  if (options.isNew && date < todayUb) {
    return { error: 'Өнгөрсөн өдөрт захиалга бүртгэх боломжгүй.' };
  }
  const start = String(input.start_time ?? '');
  if (!TIME_RE.test(start)) {
    return { error: 'Эхлэх цагийг зөв оруулна уу.' };
  }
  let end = input.end_time ? String(input.end_time) : null;
  if (end && !TIME_RE.test(end)) {
    return { error: 'Дуусах цагийг зөв оруулна уу.' };
  }

  const status = input.status ? String(input.status) : 'pending';
  if (!MANUAL_RESERVATION_STATUSES.includes(status)) {
    return { error: 'Захиалгын төлөв буруу байна.' };
  }

  const services = await normalizeServices(companyId, input);
  if (services.error !== undefined) return { error: services.error };
  if (services.data.length === 0) return { error: 'Дор хаяж нэг үйлчилгээ сонгоно уу.' };

  const totalDuration = services.data.reduce((sum, l) => sum + (l.duration ?? 0), 0);
  if (!end && totalDuration > 0) {
    const endMinutes = toMinutes(start) + totalDuration;
    if (endMinutes < 24 * 60) end = fromMinutes(endMinutes);
  }

  if (end && toMinutes(end) <= toMinutes(start)) {
    return { error: 'Дуусах цаг эхлэх цагаас хойш байх ёстой.' };
  }

  if (!input.assigned_employee) {
    return { error: 'Хариуцах ажилтнаа сонгоно уу.' };
  }
  let employee: string | null = null;
  if (input.assigned_employee) {
    const { rows } = await pool.query(
      'SELECT user_id FROM mt_user WHERE user_id::text = $1 AND company_id = $2 AND is_active IS NOT FALSE',
      [String(input.assigned_employee), companyId]
    );
    if (rows.length === 0) return { error: 'Сонгосон ажилтан олдсонгүй эсвэл идэвхгүй байна.' };
    employee = rows[0].user_id;
  }

  return {
    data: {
      customer_type: customerType as 'individual' | 'company',
      customer_id: customerId,
      services: services.data,
      assigned_employee: employee,
      reservation_date: date,
      start_time: start.slice(0, 5),
      end_time: end ? end.slice(0, 5) : null,
      status,
      note: input.note ? String(input.note).trim().slice(0, 1000) || null : null,
    },
  };
}

// Хувь хүн бол mt_customer, байгууллага бол mt_customercompany-оос мэдээллийг хуулж авна
export async function getCustomerSnapshot(
  companyId: string,
  customerType: 'individual' | 'company',
  customerId: string
): Promise<Result<CustomerSnapshot>> {
  if (customerType === 'company') {
    const { rows } = await pool.query(
      `SELECT company_customer_id, name, tax_number, phone, email, address
       FROM mt_customercompany WHERE company_customer_id::text = $1 AND company_id = $2`,
      [customerId, companyId]
    );
    const c = rows[0];
    if (!c) return { error: 'Сонгосон байгууллага харилцагч олдсонгүй.' };
    return {
      data: {
        customer_id: null,
        company_customer_id: c.company_customer_id,
        customer_name: c.name,
        customer_phone: c.phone,
        customer_email: c.email,
        customer_address: c.address,
        customer_register: c.tax_number,
      },
    };
  }

  const { rows } = await pool.query(
    `SELECT customer_id, first_name, last_name, phone, email, address
     FROM mt_customer WHERE customer_id::text = $1 AND company_id = $2`,
    [customerId, companyId]
  );
  const c = rows[0];
  if (!c) return { error: 'Сонгосон харилцагч олдсонгүй.' };
  return {
    data: {
      customer_id: c.customer_id,
      company_customer_id: null,
      customer_name: `${c.last_name ?? ''} ${c.first_name ?? ''}`.trim(),
      customer_phone: c.phone,
      customer_email: c.email,
      customer_address: c.address,
      customer_register: null,
    },
  };
}

// Нэг ажилтан нэг цагт давхар захиалга авахаас сэргийлнэ (цуцлагдсан, ирээгүйг тооцохгүй)
export async function findEmployeeConflict(
  companyId: string,
  input: NormalizedReservation,
  excludeReservationId?: string
): Promise<string | null> {
  if (!input.assigned_employee || ['cancelled', 'no_show'].includes(input.status)) return null;

  const { rows } = await pool.query(
    `
      SELECT to_char(r.start_time, 'HH24:MI') AS start_time, to_char(r.end_time, 'HH24:MI') AS end_time, r.customer_name
      FROM mt_reservation r
      WHERE r.company_id = $1
        AND r.assigned_employee = $2
        AND r.reservation_date = $3::date
        AND r.status NOT IN ('cancelled', 'no_show')
        AND ($6::uuid IS NULL OR r.reservation_id <> $6::uuid)
        AND (r.reservation_date + r.start_time)
            < ($3::date + $4::time) + COALESCE($5::time - $4::time, interval '${DEFAULT_SLOT}')
        AND (r.reservation_date + r.start_time) + COALESCE(r.end_time - r.start_time, interval '${DEFAULT_SLOT}')
            > ($3::date + $4::time)
      ORDER BY r.start_time
      LIMIT 1
    `,
    [
      companyId,
      input.assigned_employee,
      input.reservation_date,
      input.start_time,
      input.end_time,
      excludeReservationId ?? null,
    ]
  );
  const c = rows[0];
  if (!c) return null;
  const range = c.end_time ? `${c.start_time}-${c.end_time}` : c.start_time;
  return `Сонгосон ажилтан энэ цагт өөр захиалгатай байна (${range}, ${c.customer_name}).`;
}

// Захиалгын үйлчилгээнүүдийг бүхэлд нь солино. Transaction доторх client-ээр дуудна.
export async function replaceReservationServices(client: PoolClient, reservationId: string, lines: ReservationServiceLine[]) {
  await client.query('DELETE FROM mt_reservation_services WHERE reservation_id = $1', [reservationId]);
  if (lines.length === 0) return;

  const values: unknown[] = [];
  const placeholders = lines.map((line, i) => {
    values.push(reservationId, line.service_id, line.service_name, line.price, line.duration, i);
    const b = i * 6;
    return `($${b + 1}, $${b + 2}, $${b + 3}, $${b + 4}, $${b + 5}, $${b + 6})`;
  });
  await client.query(
    `INSERT INTO mt_reservation_services (reservation_id, service_id, service_name, price, duration, sort_order)
     VALUES ${placeholders.join(', ')}`,
    values
  );
}

// Ажил, үйлчилгээг хамт хадгалах transaction
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
