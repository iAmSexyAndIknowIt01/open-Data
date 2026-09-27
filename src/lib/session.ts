import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 хоног

// Хуучин гарын үсэггүй cookie-нууд (нэвтрэх, гарах үед устгана)
const LEGACY_COOKIES = ['user_id', 'company_id', 'role'];

export interface SessionPayload {
  userId: string;
  companyId: string;
  role: string;
}

function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET орчны хувьсагч тохируулагдаагүй байна.');
  }
  return new TextEncoder().encode(secret);
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getKey());
}

// Гарын үсэг болон хугацааг шалгаад payload буцаана, буруу бол null
export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ['HS256'] });
    if (typeof payload.userId !== 'string' || typeof payload.companyId !== 'string') {
      return null;
    }
    return {
      userId: payload.userId,
      companyId: payload.companyId,
      role: typeof payload.role === 'string' ? payload.role : '',
    };
  } catch {
    return null;
  }
}

export async function createSession(payload: SessionPayload) {
  const token = await encrypt(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });

  LEGACY_COOKIES.forEach((name) => cookieStore.delete(name));
}

// API route-уудад нэвтэрсэн хэрэглэгчийн мэдээллийг авах
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return decrypt(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  LEGACY_COOKIES.forEach((name) => cookieStore.delete(name));
}
