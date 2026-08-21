import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { pool } from '../../../../lib/db'; // Таны өөрийн db холболтын файл

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyName, ownerName, email, password } = body;

    // 1. Оролтын өгөгдлийг шалгах (Validation)
    if (!companyName || !ownerName || !email || !password) {
      return NextResponse.json(
        { error: 'Бүх талбарыг бөглөнө үү.' },
        { status: 400 }
      );
    }

    // 2. Имэйл бүртгэлтэй эсэхийг шалгах
    const userExists = await pool.query(
      'SELECT * FROM mt_company WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return NextResponse.json(
        { error: 'Энэ имэйлээр хэрэглэгч аль хэдийн бүртгүүлсэн байна.' },
        { status: 400 }
      );
    }

    // 3. Нууц үгийг хашиж хамгаалах (Hashing)
    // Salt rounds: 10 нь стандарт бөгөөд аюулгүй байдал, хурдны сайн харьцаа юм.
    const passwordHash = await hash(password, 10);

    // 4. Мэдээллийн баазад өгөгдлийг хадгалах (INSERT)
    const result = await pool.query(
      `INSERT INTO mt_company (company_name, owner_name, email, password_hash) 
       VALUES ($1, $2, $3, $4) RETURNING company_id, company_name, email`,
      [companyName, ownerName, email, passwordHash]
    );

    const newCompany = result.rows[0];

    // 5. Амжилттай болсон хариуг буцаах
    // Аюулгүй үүднээс нууц үгийн hash-ыг буцааж илгээж болохгүй.
    return NextResponse.json(
      { 
        message: 'Бүртгэл амжилттай үүслээ.', 
        company: newCompany 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Серверт алдаа гарлаа. Түр хүлээнэ үү.' },
      { status: 500 }
    );
  }
}