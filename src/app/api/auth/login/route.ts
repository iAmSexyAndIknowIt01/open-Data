import { NextResponse } from 'next/server';
import { compare } from 'bcrypt';
import { cookies } from 'next/headers';
import { pool } from '../../../../lib/db'; // Таны өөрийн db холболтын файл

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

    // 4. user_id, company_id болон role-ийг тус тус Cookie-д хадгалах
    const cookieStore = cookies();
    
    (await cookieStore).set({
      name: 'user_id',
      value: String(user.user_id),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 хоног
      sameSite: 'strict',
    });

    (await cookieStore).set({
      name: 'company_id',
      value: String(user.company_id),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 хоног
      sameSite: 'strict',
    });

    (await cookieStore).set({
      name: 'role',
      value: String(user.role),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 хоног
      sameSite: 'strict',
    });

    // 5. Амжилттай нэвтэрсэн үед хэрэглэгчийн мэдээллийг буцаах
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