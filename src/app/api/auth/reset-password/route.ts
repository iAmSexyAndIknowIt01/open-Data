import { NextResponse } from 'next/server';
import { pool } from '../../../../lib/db';
import bcrypt from 'bcrypt'; // Нууц үгээ hash хийдэг бол (Үгүй бол энэ хэсгийг өөрийнхөөрөө солино уу)

export async function POST(request: Request) {
  const client = await pool.connect();

  try {
    const body = await request.json();
    const { email, token, newPassword } = body;

    // Шаардлагатай утгууд ирсэн эсэхийг шалгах
    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: 'Бүх талбайг гүйцэд бөглөнө үү.' },
        { status: 400 }
      );
    }

    // 1. Имэйлээр компанийг олох
    const companyResult = await client.query(
      'SELECT company_id FROM mt_company WHERE email = $1',
      [email]
    );

    if (companyResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Бүртгэлгүй имэйл байна.' },
        { status: 404 }
      );
    }

    const companyId = companyResult.rows[0].company_id;

    // 2. mt_token хүснэгтээс company_id болон token таарч байгаа эсэх, хугацаа нь дуусаагүй эсэхийг шалгах
    const tokenResult = await client.query(
      'SELECT * FROM mt_token WHERE company_id = $1 AND token = $2 AND expires_at > NOW()',
      [companyId, token]
    );

    if (tokenResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Баталгаажуулах код буруу эсвэл хугацаа нь дууссан байна.' },
        { status: 400 }
      );
    }

    // Транзакци эхлүүлэх
    await client.query('BEGIN');

    // 3. Шинэ нууц үгийг hash хийх (Хэрэв танай систем шууд энгийн текгээр хадгалдаг бол bcrypt ашиглалгүй шууд явуулж болно)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // 4. mt_company хүснэгтийн password_hash-г шинэчлэх
    await client.query(
      'UPDATE mt_company SET password_hash = $1 WHERE company_id = $2',
      [passwordHash, companyId]
    );

    // 5. Ашиглагдсан токенийг устгах
    await client.query('DELETE FROM mt_token WHERE company_id = $1', [companyId]);

    await client.query('COMMIT');

    return NextResponse.json(
      { message: 'Нууц үг амжилттай шинэчлэгдлээ.' },
      { status: 200 }
    );

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Reset Password Error:', error);
    return NextResponse.json(
      { error: 'Серверт алдаа гарлаа.' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}