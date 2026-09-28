import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { pool } from './db';

export const SESSION_COOKIE = 'session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 хоног

// Хуучин гарын үсэггүй cookie-нууд (нэвтрэх, гарах үед устгана)
const LEGACY_COOKIES = ['user_id', 'company_id', 'role'];

export type Role = 'admin' | 'employee';

export interface SessionPayload {
  userId: string;
  companyId: string;
  role: string;
}

export interface Session {
  userId: string;
  companyId: string;
  role: Role;
}

// DB-д 'admin'-аас бусад бүх утгыг ажилтан гэж үзнэ
export function normalizeRole(role: unknown): Role {
  return typeof role === 'string' && role.trim().toLowerCase() === 'admin' ? 'admin' : 'employee';
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

// API route-уудад нэвтэрсэн хэрэглэгчийн мэдээллийг авах.
// Cookie-ийн гарын үсгээс гадна хэрэглэгч DB-д идэвхтэй эсэхийг шалгаж, role-ыг DB-ээс авна.
// Ингэснээр ажилтныг идэвхгүй болгох эсвэл эрхийг нь өөрчлөхөд session даруй үйлчилнэ.
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const payload = await decrypt(cookieStore.get(SESSION_COOKIE)?.value);
  if (!payload) return null;

  const { rows } = await pool.query(
    `SELECT role, is_active FROM mt_user WHERE user_id = $1 AND company_id = $2`,
    [payload.userId, payload.companyId]
  );
  const user = rows[0];
  if (!user || user.is_active === false) return null;

  return { userId: payload.userId, companyId: payload.companyId, role: normalizeRole(user.role) };
}

type AuthResult = { session: Session; error?: never } | { session?: never; error: NextResponse };

// Route handler-ийн эхэнд: const { session, error } = await requireAuth({ admin: true }); if (error) return error;
export async function requireAuth(options: { admin?: boolean } = {}): Promise<AuthResult> {
  const session = await getSession();
  if (!session) {
    return {
      error: NextResponse.json({ success: false, error: 'Нэвтрээгүй байна. Дахин нэвтэрнэ үү.' }, { status: 401 }),
    };
  }
  if (options.admin && session.role !== 'admin') {
    return {
      error: NextResponse.json({ success: false, error: 'Энэ үйлдлийг зөвхөн админ хийх эрхтэй.' }, { status: 403 }),
    };
  }
  return { session };
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  LEGACY_COOKIES.forEach((name) => cookieStore.delete(name));
}
