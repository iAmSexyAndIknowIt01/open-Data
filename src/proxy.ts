import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt, SESSION_COOKIE } from '@/src/lib/session';

// Урьдчилсан шалгалт: session хүчингүй бол dashboard-ыг нээлгүй login руу шилжүүлнэ.
// Жинхэнэ эрхийн шалгалт API route бүр дээр getSession()-оор хийгдэнэ.
export async function proxy(request: NextRequest) {
  const session = await decrypt(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*',
};
