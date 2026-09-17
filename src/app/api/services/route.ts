import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/src/lib/db';

// GET: Тухайн компанийн үйлчилгээний жагсаалтыг татах
export async function GET() {
  try {
    const cookieStore = cookies();
    const companyId = (await cookieStore).get('company_id')?.value;

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Нэвтрээгүй байна. (Auth required)' },
        { status: 401 }
      );
    }

    const query = `
      SELECT 
        service_id,
        company_id,
        name,
        category,
        price,
        duration,
        description,
        status,
        created_at
      FROM mt_services 
      WHERE company_id = $1 
      ORDER BY created_at DESC
    `;
    
    const { rows } = await pool.query(query, [companyId]);

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('Fetch Services Error:', error);
    return NextResponse.json(
      { success: false, error: 'Үйлчилгээний мэдээлэл авахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

// POST: Шинэ үйлчилгээ бүртгэх
export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const companyId = (await cookieStore).get('company_id')?.value;

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Нэвтрээгүй байна. (Auth required)' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, category, price, duration, description } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Үйлчилгээний нэрийг оруулна уу.' },
        { status: 400 }
      );
    }

    const insertQuery = `
      INSERT INTO mt_services (company_id, name, category, price, duration, description) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `;
    
    const values = [
      companyId, 
      name, 
      category || null, 
      price ? Number(price) : 0, 
      duration ? Number(duration) : null, 
      description || null
    ];

    const { rows } = await pool.query(insertQuery, values);

    return NextResponse.json({ 
      success: true, 
      data: rows[0],
      message: 'Үйлчилгээ амжилттай хадгалагдлаа' 
    });
  } catch (error) {
    console.error('Create Service Error:', error);
    return NextResponse.json(
      { success: false, error: 'Үйлчилгээ хадгалахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}