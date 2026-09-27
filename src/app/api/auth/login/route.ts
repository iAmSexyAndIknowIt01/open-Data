import { NextResponse } from 'next/server';
import { compare } from 'bcrypt';
import { pool } from '../../../../lib/db'; // Таны өөрийн db холболтын файл
import { createSession } from '../../../../lib/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Оролтын өгөгдлийг шалгах
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Имэйл болон нууц үгээ оруулна уу.' },
        { status: 400 }
      );
    }

    // 2. mt_user хүснэгтээс хэрэглэгчийг имэйлээр хайх
    const result = await pool.query(
      'SELECT * FROM mt_user WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Имэйл эсвэл нууц үг буруу байна.' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // 3. Нууц үг тохирч байгаа эсэхийг шалгах (mt_user.password_hash)
    const isPasswordValid = await compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Имэйл эсвэл нууц үг буруу байна.' },
        { status: 401 }
      );
    }

    // 4. Идэвхгүй болгосон хэрэглэгчийг нэвтрүүлэхгүй
    if (user.is_active === false) {
      return NextResponse.json(
        { error: 'Таны бүртгэл идэвхгүй болсон байна. Админд хандана уу.' },
        { status: 403 }
      );
    }

    // 5. user_id, company_id, role-ийг гарын үсэгтэй session cookie-д хадгалах
    await createSession({
      userId: String(user.user_id),
      companyId: String(user.company_id),
      role: String(user.role ?? ''),
    });

    // 6. Амжилттай нэвтэрсэн үед хэрэглэгчийн мэдээллийг буцаах
    return NextResponse.json(
      {
        message: 'Амжилттай нэвтэрлээ.',
        user: {
          userId: user.user_id,
          companyId: user.company_id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
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