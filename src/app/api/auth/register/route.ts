import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import crypto from 'crypto';
import { pool } from '../../../../lib/db';
import { validatePassword } from '../../../../lib/password';
import { checkRateLimits, getClientIp } from '../../../../lib/rate-limit';

export async function POST(request: Request) {
  const client = await pool.connect();

  try {
    const body = await request.json();
    const { companyName, lastName, firstName, password } = body;
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    // 1. Оролтын өгөгдлийг шалгах
    if (!companyName || !lastName || !firstName || !email || !password) {
      return NextResponse.json(
        { error: 'Бүх талбарыг бөглөнө үү.' },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Имэйл хаяг буруу байна.' }, { status: 400 });
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    // Олноор бүртгэл үүсгэхээс сэргийлэх: нэг IP-ээс цагт 5
    const limited = await checkRateLimits([
      { key: `register:ip:${getClientIp(request)}`, limit: 5, windowSeconds: 60 * 60 },
    ]);
    if (limited) return limited;

    // 2. Имэйл mt_user хүснэгтэд бүртгэлтэй эсэхийг шалгах
    const userExists = await client.query(
      'SELECT 1 FROM mt_user WHERE LOWER(email) = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return NextResponse.json(
        { error: 'Энэ имэйлээр хэрэглэгч аль хэдийн бүртгүүлсэн байна.' },
        { status: 400 }
      );
    }

    // Transaction эхлүүлэх
    await client.query('BEGIN');

    // 3. Үл давхцах random company_id үүсгэх
    let companyId = crypto.randomUUID();
    let isCompanyUnique = false;
    while (!isCompanyUnique) {
      const checkId = await client.query('SELECT company_id FROM mt_company WHERE company_id = $1', [companyId]);
      if (checkId.rows.length === 0) {
        isCompanyUnique = true;
      } else {
        companyId = crypto.randomUUID();
      }
    }

    // 4. mt_company хүснэгт рүү компанийн мэдээллийг хадгалах
    await client.query(
      `INSERT INTO mt_company (company_id, company_name, email) VALUES ($1, $2, $3)`,
      [companyId, companyName, email]
    );

    // 5. Үл давхцах random user_id үүсгэх
    let userId = crypto.randomUUID();
    let isUserUnique = false;
    while (!isUserUnique) {
      const checkUserId = await client.query('SELECT user_id FROM mt_user WHERE user_id = $1', [userId]);
      if (checkUserId.rows.length === 0) {
        isUserUnique = true;
      } else {
        userId = crypto.randomUUID();
      }
    }

    // 6. Нууц үгийг хашиж хамгаалах
    const passwordHash = await hash(password, 10);

    // 7. mt_user хүснэгт рүү шинэ user_id, company_id-тайгаар оруулах
    const userResult = await client.query(
      `INSERT INTO mt_user (user_id, company_id, email, password_hash, first_name, last_name, role) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING user_id, company_id, email, first_name, last_name, role`,
      [userId, companyId, email, passwordHash, firstName, lastName, 'admin']
    );

    // Transaction-ийг баталгаажуулах
    await client.query('COMMIT');

    const newUser = userResult.rows[0];

    return NextResponse.json(
      { 
        message: 'Бүртгэл амжилттай үүслээ.', 
        user: newUser 
      },
      { status: 201 }
    );

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Серверт алдаа гарлаа. Түр хүлээнэ үү.' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}