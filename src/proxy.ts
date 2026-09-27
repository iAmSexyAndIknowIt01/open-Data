import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt, SESSION_COOKIE } from '@/src/lib/session';
import { pool } from '@/src/lib/db';

// Урьдчилсан шалгалт: session хүчингүй эсвэл хэрэглэгч идэвхгүй бол dashboard-ыг нээлгүй login руу шилжүүлнэ.
// Жинхэнэ эрхийн шалгалт API route бүр дээр getSession()/requireAuth()-оор хийгдэнэ.
export async function proxy(request: NextRequest) {
  const session = await decrypt(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { rows } = await pool.query(
      'SELECT is_active FROM mt_user WHERE user_id = $1 AND company_id = $2',
      [session.userId, session.companyId]
    );
    if (!rows[0] || rows[0].is_active === false) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete(SESSION_COOKIE);
      return response;
    }
  } catch (error) {
    // DB түр алдаатай үед хуудсыг хаахгүй; API route-ууд өөрсдөө шалгана
    console.error('Proxy session check failed:', error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*',
};
