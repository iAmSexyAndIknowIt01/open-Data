import 'server-only';
import { NextResponse } from 'next/server';
import { pool } from './db';

// Хүсэлтийн тоог DB дээр (mt_rate_limit) тоолно. Serverless орчинд олон instance
// ажилладаг тул санах ойд тоолох нь хангалтгүй.
// Fixed window: windowSeconds хугацаанд limit-ээс олон хүсэлт ирвэл татгалзана.
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const { rows } = await pool.query(
    `
      INSERT INTO mt_rate_limit (key, window_start, count)
      VALUES ($1, now(), 1)
      ON CONFLICT (key) DO UPDATE SET
        count = CASE WHEN mt_rate_limit.window_start < now() - make_interval(secs => $2)
                     THEN 1 ELSE mt_rate_limit.count + 1 END,
        window_start = CASE WHEN mt_rate_limit.window_start < now() - make_interval(secs => $2)
                            THEN now() ELSE mt_rate_limit.window_start END
      RETURNING count, EXTRACT(EPOCH FROM (window_start + make_interval(secs => $2) - now()))::int AS retry_after
    `,
    [key, windowSeconds]
  );

  // Хуучин бичлэгүүдийг хааяа цэвэрлэнэ (хүсэлтийн ~1%)
  if (Math.random() < 0.01) {
    pool.query(`DELETE FROM mt_rate_limit WHERE window_start < now() - interval '1 day'`).catch(() => {});
  }

  const { count, retry_after: retryAfter } = rows[0];
  return { allowed: count <= limit, retryAfter: Math.max(Number(retryAfter), 1) };
}

// Хэд хэдэн хязгаарын аль нэг нь хэтэрвэл 429 хариу буцаана, эс бөгөөс null
export async function checkRateLimits(
  limits: { key: string; limit: number; windowSeconds: number }[]
): Promise<NextResponse | null> {
  for (const { key, limit, windowSeconds } of limits) {
    const { allowed, retryAfter } = await rateLimit(key, limit, windowSeconds);
    if (!allowed) {
      const minutes = Math.ceil(retryAfter / 60);
      return NextResponse.json(
        { success: false, error: `Хэт олон оролдлого хийлээ. ${minutes} минутын дараа дахин оролдоно уу.` },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }
  }
  return null;
}

// Vercel болон proxy-ийн ард клиентийн IP-г x-forwarded-for-оос авна
export function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
}
