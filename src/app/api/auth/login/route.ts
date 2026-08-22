import { NextResponse } from 'next/server';
import { compare } from 'bcrypt';
import { cookies } from 'next/headers'; // <-- cookies-г импортлох
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

    // 2. Хэрэглэгч бүртгэлтэй эсэхийг шалгах
    const result = await pool.query(
      'SELECT * FROM mt_company WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Имэйл эсвэл нууц үг буруу байна.' },
        { status: 401 }
      );
    }

    const company = result.rows[0];

    // 3. Нууц үг тохирч байгаа эсэхийг шалгах
    const isPasswordValid = await compare(password, company.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Имэйл эсвэл нууц үг буруу байна.' },
        { status: 401 }
      );
    }

    // 4. company_id-г Cookie-д хадгалах
    const cookieStore = cookies();
    (await cookieStore).set({
      name: 'company_id',
      value: String(company.company_id),
      httpOnly: true, // Хакердах оролдлогоос (XSS) хамгаална
      secure: process.env.NODE_ENV === 'production', // Production дээр HTTPS шаардах
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 хоног хадгалагдана
      sameSite: 'strict',
    });   

    // 5. Амжилттай нэвтэрсэн үед мэдээллийг буцаах
    return NextResponse.json(
      {
        message: 'Амжилттай нэвтэрлээ.',
        company: {
          id: company.company_id,
          name: company.company_name,
          email: company.email,
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