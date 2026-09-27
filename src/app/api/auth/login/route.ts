import { NextResponse } from 'next/server';
import { compare, hashSync } from 'bcrypt';
import { pool } from '../../../../lib/db'; // Таны өөрийн db холболтын файл
import { createSession, normalizeRole } from '../../../../lib/session';
import { checkRateLimits, getClientIp } from '../../../../lib/rate-limit';

// Бүртгэлгүй имэйлээр оролдоход ч bcrypt шалгалт хийж, хариу өгөх хугацаагаар
// имэйл бүртгэлтэй эсэхийг таах боломжийг хаана
const DUMMY_HASH = hashSync('timing-safe-dummy-password', 10);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Оролтын өгөгдлийг шалгах
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return NextResponse.json(
        { error: 'Имэйл болон нууц үгээ оруулна уу.' },
        { status: 400 }
      );
    }
    const normalizedEmail = email.trim().toLowerCase();

    // 2. Нууц үг таах оролдлогыг хязгаарлах: IP-ээр 15 минутад 20, имэйлээр 15 минутад 10
    const limited = await checkRateLimits([
      { key: `login:ip:${getClientIp(request)}`, limit: 20, windowSeconds: 15 * 60 },
      { key: `login:email:${normalizedEmail}`, limit: 10, windowSeconds: 15 * 60 },
    ]);
    if (limited) return limited;

    // 3. mt_user хүснэгтээс хэрэглэгчийг имэйлээр хайх
    const result = await pool.query(
      'SELECT * FROM mt_user WHERE LOWER(email) = $1',
      [normalizedEmail]
    );
    const user = result.rows[0];

    // 4. Нууц үг тохирч байгаа эсэхийг шалгах (mt_user.password_hash)
    const isPasswordValid = await compare(password, user?.password_hash ?? DUMMY_HASH);

    if (!user || !isPasswordValid) {
      return NextResponse.json(
        { error: 'Имэйл эсвэл нууц үг буруу байна.' },
        { status: 401 }
      );
    }

    // 5. Идэвхгүй болгосон хэрэглэгчийг нэвтрүүлэхгүй
    if (user.is_active === false) {
      return NextResponse.json(
        { error: 'Таны бүртгэл идэвхгүй болсон байна. Админд хандана уу.' },
        { status: 403 }
      );
    }

    // 6. user_id, company_id, role-ийг гарын үсэгтэй session cookie-д хадгалах
    await createSession({
      userId: String(user.user_id),
      companyId: String(user.company_id),
      role: normalizeRole(user.role),
    });

    // 7. Амжилттай нэвтэрсэн үед хэрэглэгчийн мэдээллийг буцаах
    return NextResponse.json(
      {
        message: 'Амжилттай нэвтэрлээ.',
        user: {
          userId: user.user_id,
          companyId: user.company_id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: normalizeRole(user.role),
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { error: 'Серверт алдаа гарлаа. Түр хүлээнэ үү.' },
      { status: 500 }
    );
  }
}