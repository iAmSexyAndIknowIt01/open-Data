import 'server-only';
import { createHmac, randomInt, timingSafeEqual } from 'crypto';

export const RESET_CODE_TTL_MINUTES = 15;
export const RESET_MAX_ATTEMPTS = 5;

// 6 оронтой код
export function generateResetCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

// Кодыг DB-д шууд биш, SESSION_SECRET-ээр HMAC хийж хадгална
export function hashResetCode(userId: string, code: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET орчны хувьсагч тохируулагдаагүй байна.');
  return createHmac('sha256', secret).update(`${userId}:${code}`).digest('hex');
}

export function resetCodeMatches(userId: string, code: string, storedHash: string) {
  const a = Buffer.from(hashResetCode(userId, code), 'hex');
  const b = Buffer.from(storedHash, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}
