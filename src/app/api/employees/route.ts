import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '../../../lib/db'; // Төслийн замын дагуу тохируулна уу
import bcrypt from 'bcrypt'; // Нууц үг хашихад ашиглаж болно

// 1. GET метод: Cookie-гээс company_id-г авч mt_user хүснэгтээс тухайн компанид хамаарах бүх хэрэглэгчдийг татах
export async function GET() {
  try {
    const cookieStore = cookies();
    const userId = (await cookieStore).get('user_id')?.value;
    const companyId = (await cookieStore).get('company_id')?.value;

    if (!userId || !companyId) {
      return NextResponse.json(
        { success: false, error: 'Нэвтрээгүй эсвэл cookie мэдээлэл дутуу байна.' },
        { status: 401 }
      );
    }

    // Тухайн компанид хамаарах бүх хэрэглэгчдийг (ажилчдыг) mt_user хүснэгтээс татах
    const usersQuery = `
      SELECT 
        user_id AS id, 
        company_id, 
        first_name, 
        last_name, 
        email, 
        phone, 
        address, 
        male, 
        is_active, 
        role, 
        create_date AS created_at, 
        update_date AS updated_at
      FROM mt_user
      WHERE company_id = $1
      ORDER BY create_date DESC
    `;
    const usersResult = await pool.query(usersQuery, [companyId]);

    return NextResponse.json({
      success: true,
      data: usersResult.rows,
    });

  } catch (error) {
    console.error('Users Fetch Error:', error);
    return NextResponse.json(
      { success: false, error: 'Серверт алдаа гарлаа.' },
      { status: 500 }
    );
  }
}

// 2. POST метод: mt_user хүснэгт рүү шинэ хэрэглэгч (ажилтан) бүртгэх
export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const currentUserId = (await cookieStore).get('user_id')?.value;
    const companyId = (await cookieStore).get('company_id')?.value;

    if (!currentUserId || !companyId) {
      return NextResponse.json(
        { success: false, error: 'Нэвтрээгүй байна.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { first_name, last_name, email, password, phone, address, male, role } = body;

    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { success: false, error: 'Нэр, овог болон имэйл хаяг заавал шаардлагатай.' },
        { status: 400 }
      );
    }

    // Нууц үг байхгүй бол түр зуурын нууц үг үүсгэх эсвэл дамжуулна
    const plainPassword = password || '12345678';
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const insertQuery = `
      INSERT INTO mt_user (company_id, email, password_hash, first_name, last_name, male, phone, address, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING 
        user_id AS id, 
        company_id, 
        first_name, 
        last_name, 
        email, 
        phone, 
        address, 
        male, 
        is_active, 
        role, 
        create_date AS created_at
    `;
    
    const values = [
      companyId, 
      email, 
      passwordHash, 
      first_name, 
      last_name, 
      male ?? null, 
      phone || null, 
      address || null, 
      role || 'Ажилтан'
    ];

    const newUserResult = await pool.query(insertQuery, values);

    return NextResponse.json({
      success: true,
      message: 'Хэрэглэгч амжилттай бүртгэгдлээ.',
      data: newUserResult.rows[0],
    });

  } catch (error: unknown) {
    console.error('User Save Error:', error);
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) { // Unique violation (email давхардсан)
      return NextResponse.json(
        { success: false, error: 'Энэ имэйл хаяг аль хэдийн бүртгэгдсэн байна.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Серверт алдаа гарлаа.' },
      { status: 500 }
    );
  }
}