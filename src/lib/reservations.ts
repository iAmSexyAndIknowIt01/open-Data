import 'server-only';
import { pool } from './db';

export const RESERVATION_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];
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
  s.name AS service_name,
  s.duration AS service_duration,
  NULLIF(TRIM(CONCAT(COALESCE(u.last_name, ''), ' ', COALESCE(u.first_name, ''))), '') AS employee_name
`;

export const RESERVATION_FROM = `
  FROM mt_reservation r
  LEFT JOIN mt_services s ON r.service_id = s.service_id
  LEFT JOIN mt_user u ON r.assigned_employee = u.user_id
`;

export interface ReservationInput {
  customer_type?: unknown;
  customer_id?: unknown;
  service_id?: unknown;
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

export interface NormalizedReservation {
  customer_type: 'individual' | 'company';
  customer_id: string | null;
  service_id: number | null;
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

// Хүсэлтийн утгуудыг шалгаж, ID-ууд тухайн компанийх эсэхийг баталгаажуулна.
// Дуусах цаг өгөөгүй бол үйлчилгээний үргэлжлэх хугацаагаар (минут) тооцно.
export async function validateReservationInput(
  companyId: string,
  input: ReservationInput,
  options: { requireCustomer: boolean }
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
  const start = String(input.start_time ?? '');
  if (!TIME_RE.test(start)) {
    return { error: 'Эхлэх цагийг зөв оруулна уу.' };
  }
  let end = input.end_time ? String(input.end_time) : null;
  if (end && !TIME_RE.test(end)) {
    return { error: 'Дуусах цагийг зөв оруулна уу.' };
  }

  const status = input.status ? String(input.status) : 'pending';
  if (!RESERVATION_STATUSES.includes(status)) {
    return { error: 'Захиалгын төлөв буруу байна.' };
  }

  let serviceId: number | null = null;
  if (input.service_id) {
    const { rows } = await pool.query(
      'SELECT service_id, duration FROM mt_services WHERE service_id::text = $1 AND company_id = $2',
      [String(input.service_id), companyId]
    );
    if (rows.length === 0) return { error: 'Сонгосон үйлчилгээ олдсонгүй.' };
    serviceId = rows[0].service_id;

    const duration = Number(rows[0].duration);
    if (!end && duration > 0) {
      const endMinutes = toMinutes(start) + duration;
      if (endMinutes < 24 * 60) end = fromMinutes(endMinutes);
    }
  }

  if (end && toMinutes(end) <= toMinutes(start)) {
    return { error: 'Дуусах цаг эхлэх цагаас хойш байх ёстой.' };
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
      service_id: serviceId,
      assigned_employee: employee,
      reservation_date: date,
      start_time: start.slice(0, 5),
      end_time: end ? end.slice(0, 5) : null,
      status,
      note: input.note ? String(input.note).trim() || null : null,
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
