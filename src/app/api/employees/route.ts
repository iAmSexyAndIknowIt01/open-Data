import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '../../../lib/db';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

// 1. GET метод: Компанийн бүх хэрэглэгчдийг авах
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    const companyId = cookieStore.get('company_id')?.value;

    if (!userId || !companyId) {
      return NextResponse.json(
        { success: false, error: 'Нэвтрээгүй эсвэл cookie мэдээлэл дутуу байна.' },
        { status: 401 }
      );
    }

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

// 2. POST метод: Шинэ хэрэглэгч бүртгэх
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const currentUserId = cookieStore.get('user_id')?.value;
    const companyId = cookieStore.get('company_id')?.value;

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

    const plainPassword = password || '12345678';
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    const newUserId = randomUUID();

    const insertQuery = `
      INSERT INTO mt_user (user_id, company_id, email, password_hash, first_name, last_name, male, phone, address, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
      newUserId,
      companyId, 
      email, 
      passwordHash, 
      first_name, 
      last_name, 
      male ?? true, 
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
      (error as { code?: string }).code === '23505'
    ) {
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