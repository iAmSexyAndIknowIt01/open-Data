import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/session';
import { pool } from '@/src/lib/db';

const TZ = 'Asia/Ulaanbaatar';

// Хугацааны сонголт бүрийн тренд графикийн нэгж болон баганын тоо
const RANGES = {
  '7d': { unit: 'day', buckets: 7 },
  '30d': { unit: 'day', buckets: 30 },
  '90d': { unit: 'week', buckets: 13 },
  '12m': { unit: 'month', buckets: 12 },
} as const;

type RangeKey = keyof typeof RANGES;

const toNumber = (value: unknown) => Number(value ?? 0);

// GET: Аналитик хуудасны үзүүлэлтүүд
//   ?range=7d | 30d | 90d | 12m (default 30d)
//   Үзүүлэлт бүр сонгосон хугацаанд бүртгэгдсэн (create_date) өгөгдлөөр тооцогдоно.
//   Өмнөх ижил урттай хугацаатай харьцуулж өөрчлөлтийн хувийг гаргана.
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Нэвтрээгүй байна. (Auth required)' },
        { status: 401 }
      );
    }
    const companyId = session.companyId;

    const rangeParam = new URL(request.url).searchParams.get('range') ?? '30d';
    const range: RangeKey = rangeParam in RANGES ? (rangeParam as RangeKey) : '30d';
    const { unit, buckets } = RANGES[range];

    // Хугацааны эхлэл: одоогийн нэгжийн эхлэлээс (buckets - 1) нэгжийн өмнө, Улаанбаатарын цагаар
    const boundsResult = await pool.query(
      `
        WITH b AS (
          SELECT date_trunc($1, now() AT TIME ZONE '${TZ}')
                 - ($2::int - 1) * ('1 ' || $1)::interval AS since_local
        )
        SELECT (since_local AT TIME ZONE '${TZ}') AS since,
               ((since_local - $2::int * ('1 ' || $1)::interval) AT TIME ZONE '${TZ}') AS prev_since
        FROM b
      `,
      [unit, buckets]
    );
    const { since, prev_since: prevSince } = boundsResult.rows[0];
    const params = [companyId, since, prevSince];

    const [works, customers, submissions, trend, statuses, customerTypes, services, employees] =
      await Promise.all([
        pool.query(
          `
            SELECT
              COUNT(*) FILTER (WHERE create_date >= $2) AS works,
              COUNT(*) FILTER (WHERE create_date >= $3 AND create_date < $2) AS works_prev,
              COALESCE(SUM(price) FILTER (WHERE status = 'completed' AND create_date >= $2), 0) AS revenue,
              COALESCE(SUM(price) FILTER (WHERE status = 'completed' AND create_date >= $3 AND create_date < $2), 0) AS revenue_prev,
              COUNT(*) FILTER (WHERE status = 'completed' AND create_date >= $2) AS completed,
              COUNT(*) FILTER (WHERE status <> 'cancelled' AND create_date >= $2) AS not_cancelled,
              COUNT(*) FILTER (WHERE status = 'completed' AND create_date >= $3 AND create_date < $2) AS completed_prev,
              COUNT(*) FILTER (WHERE status <> 'cancelled' AND create_date >= $3 AND create_date < $2) AS not_cancelled_prev,
              COUNT(*) FILTER (WHERE due_date < now() AND status NOT IN ('completed', 'cancelled')) AS overdue
            FROM mt_works
            WHERE company_id = $1
          `,
          params
        ),
        pool.query(
          `
            SELECT
              COUNT(*) FILTER (WHERE create_date >= $2) AS current,
              COUNT(*) FILTER (WHERE create_date >= $3 AND create_date < $2) AS previous
            FROM (
              SELECT create_date FROM mt_customer WHERE company_id = $1
              UNION ALL
              SELECT create_date FROM mt_customercompany WHERE company_id = $1
            ) c
          `,
          params
        ),
        pool.query(
          `
            SELECT
              COUNT(*) FILTER (WHERE submitted_at >= $2) AS current,
              COUNT(*) FILTER (WHERE submitted_at >= $3 AND submitted_at < $2) AS previous
            FROM form_submissions
            WHERE company_id = $1
          `,
          params
        ),
        pool.query(
          `
            WITH buckets AS (
              SELECT generate_series(
                date_trunc($3, $2::timestamptz AT TIME ZONE '${TZ}'),
                date_trunc($3, now() AT TIME ZONE '${TZ}'),
                ('1 ' || $3)::interval
              ) AS bucket
            )
            SELECT
              to_char(b.bucket, 'YYYY-MM-DD') AS bucket,
              COUNT(w.work_id) AS works,
              COALESCE(SUM(w.price) FILTER (WHERE w.status = 'completed'), 0) AS revenue
            FROM buckets b
            LEFT JOIN mt_works w
              ON w.company_id = $1
             AND date_trunc($3, w.create_date AT TIME ZONE '${TZ}') = b.bucket
            GROUP BY b.bucket
            ORDER BY b.bucket
          `,
          [companyId, since, unit]
        ),
        pool.query(
          `
            SELECT status, COUNT(*) AS count
            FROM mt_works
            WHERE company_id = $1 AND create_date >= $2
            GROUP BY status
          `,
          [companyId, since]
        ),
        pool.query(
          `
            SELECT LOWER(customer_type) AS customer_type, COUNT(*) AS count
            FROM mt_works
            WHERE company_id = $1 AND create_date >= $2
            GROUP BY LOWER(customer_type)
          `,
          [companyId, since]
        ),
        pool.query(
          `
            SELECT
              s.name,
              COUNT(*) AS works,
              COALESCE(SUM(w.price) FILTER (WHERE w.status = 'completed'), 0) AS revenue
            FROM mt_works w
            JOIN mt_services s ON s.service_id = w.service_id
            WHERE w.company_id = $1 AND w.create_date >= $2
            GROUP BY s.service_id, s.name
            ORDER BY revenue DESC, works DESC
            LIMIT 5
          `,
          [companyId, since]
        ),
        pool.query(
          `
            SELECT
              TRIM(CONCAT(u.last_name, ' ', u.first_name)) AS name,
              COUNT(*) AS assigned,
              COUNT(*) FILTER (WHERE w.status = 'completed') AS completed,
              COALESCE(SUM(w.price) FILTER (WHERE w.status = 'completed'), 0) AS revenue
            FROM mt_works w
            JOIN mt_user u ON u.user_id = w.assigned_employee
            WHERE w.company_id = $1 AND w.create_date >= $2
            GROUP BY u.user_id, u.last_name, u.first_name
            ORDER BY completed DESC, assigned DESC
            LIMIT 5
          `,
          [companyId, since]
        ),
      ]);

    const w = works.rows[0];
    const rate = (done: unknown, total: unknown) =>
      toNumber(total) > 0 ? Math.round((toNumber(done) / toNumber(total)) * 1000) / 10 : null;

    return NextResponse.json({
      success: true,
      data: {
        range,
        unit,
        kpis: {
          works: { current: toNumber(w.works), previous: toNumber(w.works_prev) },
          revenue: { current: toNumber(w.revenue), previous: toNumber(w.revenue_prev) },
          completionRate: {
            current: rate(w.completed, w.not_cancelled),
            previous: rate(w.completed_prev, w.not_cancelled_prev),
          },
          newCustomers: {
            current: toNumber(customers.rows[0].current),
            previous: toNumber(customers.rows[0].previous),
          },
          submissions: {
            current: toNumber(submissions.rows[0].current),
            previous: toNumber(submissions.rows[0].previous),
          },
          overdue: toNumber(w.overdue),
        },
        trend: trend.rows.map((r) => ({
          bucket: r.bucket,
          works: toNumber(r.works),
          revenue: toNumber(r.revenue),
        })),
        statuses: statuses.rows.map((r) => ({ status: r.status, count: toNumber(r.count) })),
        customerTypes: customerTypes.rows.map((r) => ({ type: r.customer_type, count: toNumber(r.count) })),
        topServices: services.rows.map((r) => ({
          name: r.name,
          works: toNumber(r.works),
          revenue: toNumber(r.revenue),
        })),
        topEmployees: employees.rows.map((r) => ({
          name: r.name,
          assigned: toNumber(r.assigned),
          completed: toNumber(r.completed),
          revenue: toNumber(r.revenue),
        })),
      },
    });
  } catch (error) {
    console.error('Fetch Analytics Error:', error);
    return NextResponse.json(
      { success: false, error: 'Аналитик мэдээлэл авахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}
