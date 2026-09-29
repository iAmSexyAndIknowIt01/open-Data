import 'server-only';
import { NextResponse } from 'next/server';
import { pool } from './db';
import { clientIpFromHeaders } from './client-ip';

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

// Клиентийн IP (хуурах боломжгүй аргаар — client-ip.ts-ийг үзнэ үү)
export function getClientIp(request: Request) {
  return clientIpFromHeaders(request.headers);
}

// Тоолуурыг нэмэлгүйгээр хязгаар хэтэрсэн эсэхийг шалгана (зөвхөн амжилтгүй оролдлогыг тоолоход)
export async function isRateLimited(key: string, limit: number, windowSeconds: number) {
  const { rows } = await pool.query(
    `SELECT count, EXTRACT(EPOCH FROM (window_start + make_interval(secs => $2) - now()))::int AS retry_after
     FROM mt_rate_limit WHERE key = $1 AND window_start >= now() - make_interval(secs => $2)`,
    [key, windowSeconds]
  );
  const row = rows[0];
  return row && row.count >= limit ? { limited: true, retryAfter: Math.max(Number(row.retry_after), 1) } : { limited: false, retryAfter: 0 };
}

export function tooManyAttempts(retryAfter: number) {
  const minutes = Math.ceil(retryAfter / 60);
  return NextResponse.json(
    { success: false, error: `Хэт олон оролдлого хийлээ. ${minutes} минутын дараа дахин оролдоно уу.` },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}

export async function clearRateLimit(key: string) {
  await pool.query('DELETE FROM mt_rate_limit WHERE key = $1', [key]);
}
