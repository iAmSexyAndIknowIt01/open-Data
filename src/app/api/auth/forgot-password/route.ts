import { NextResponse } from 'next/server';
import { pool } from '../../../../lib/db';
import crypto from 'crypto'; // Санамсаргүй ID эсвэл uuid үүсгэхэд ашиглана

export async function POST(request: Request) {
  const client = await pool.connect();

  try {
    const body = await request.json();
    const { email } = body;

    // Зөвхөн email ирсэн эсэхийг шалгах
    if (!email) {
      return NextResponse.json(
        { error: 'Имэйл хаягаа оруулна уу.' },
        { status: 400 }
      );
    }

    // 1. Компанийг имэйлээр олох
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

    // 2. Санамсаргүй token_id болон 6 оронтой баталгаажуулах код үүсгэх
    // token_id-г crypto ашиглан UUID эсвэл санамсаргүй тэмдэгт болгож болно. (Хэрэв тоон ID байвал Math.random ашиглаж болно)
    const tokenId = crypto.randomUUID(); // эсвэл Math.floor(Math.random() * 1000000000)
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 минутын дараа дуусна

    await client.query('BEGIN');

    // Хуучин токен байвал устгах
    await client.query('DELETE FROM mt_token WHERE company_id = $1', [companyId]);

    // token_id-г хамт оруулах
    await client.query(
      'INSERT INTO mt_token (token_id, company_id, token, expires_at) VALUES ($1, $2, $3, $4)',
      [tokenId, companyId, token, expiresAt]
    );

    await client.query('COMMIT');

    // Энд имэйл илгээх код байршина
    console.log(`Verification code for ${email}: ${token} (Token ID: ${tokenId})`);

    return NextResponse.json(
      { message: 'Баталгаажуулах код амжилттай илгээгдлээ.' },
      { status: 200 }
    );

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Forgot Password Error:', error);
    return NextResponse.json(
      { error: 'Серверт алдаа гарлаа.' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}