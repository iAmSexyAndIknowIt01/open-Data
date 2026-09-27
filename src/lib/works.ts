import 'server-only';
import { pool } from './db';

const CUSTOMER_TYPES = ['individual', 'company'];
const STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'];
const PRIORITIES = ['low', 'medium', 'high'];

interface WorkInput {
  customer_type?: unknown;
  customer_id?: unknown;
  service_id?: unknown;
  assigned_employee?: unknown;
  status?: unknown;
  priority?: unknown;
}

// Ажил үүсгэх/засах хүсэлтэд ирсэн ID-ууд тухайн компанийх эсэхийг шалгана.
// Клиентээс ирсэн ID-д итгэвэл өөр компанийн харилцагч, ажилтантай холбох боломжтой болно.
// Алдаатай бол монгол тайлбар, зөв бол null буцаана.
export async function validateWorkInput(companyId: string, input: WorkInput): Promise<string | null> {
  if (!CUSTOMER_TYPES.includes(String(input.customer_type))) {
    return 'Харилцагчийн төрөл буруу байна.';
  }
  if (input.status && !STATUSES.includes(String(input.status))) {
    return 'Ажлын төлөв буруу байна.';
  }
  if (input.priority && !PRIORITIES.includes(String(input.priority))) {
    return 'Зэрэглэл буруу байна.';
  }

  const checks: { sql: string; value: unknown; message: string }[] = [];
  if (input.customer_id) {
    checks.push(
      input.customer_type === 'company'
        ? {
            sql: 'SELECT 1 FROM mt_customercompany WHERE company_customer_id::text = $1 AND company_id = $2',
            value: input.customer_id,
            message: 'Сонгосон байгууллага харилцагч олдсонгүй.',
          }
        : {
            sql: 'SELECT 1 FROM mt_customer WHERE customer_id::text = $1 AND company_id = $2',
            value: input.customer_id,
            message: 'Сонгосон харилцагч олдсонгүй.',
          }
    );
  }
  if (input.service_id) {
    checks.push({
      sql: 'SELECT 1 FROM mt_services WHERE service_id::text = $1 AND company_id = $2',
      value: input.service_id,
      message: 'Сонгосон үйлчилгээ олдсонгүй.',
    });
  }
  if (input.assigned_employee) {
    checks.push({
      sql: 'SELECT 1 FROM mt_user WHERE user_id::text = $1 AND company_id = $2 AND is_active IS NOT FALSE',
      value: input.assigned_employee,
      message: 'Сонгосон ажилтан олдсонгүй эсвэл идэвхгүй байна.',
    });
  }

  for (const check of checks) {
    const { rows } = await pool.query(check.sql, [String(check.value), companyId]);
    if (rows.length === 0) return check.message;
  }
  return null;
}
