import { NextResponse } from 'next/server';
import { pool } from '@/src/lib/db';

// Мэдээлэл авах (GET)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId || userId === 'undefined') {
      return NextResponse.json(
        { success: false, error: 'Хэрэглэгчийн ID буруу байна.' },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        u.user_id,
        u.company_id,
        u.email,
        u.first_name,
        u.last_name,
        u.male,
        u.phone,
        u.address,
        u.is_active,
        u.create_date,
        u.update_date,
        u.role,
        u.position,
        c.company_name
      FROM mt_user u
      LEFT JOIN mt_company c ON u.company_id = c.company_id
      WHERE u.user_id = $1
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Хэрэглэгч олдсонгүй.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });

  } catch (error) {
    console.error('Fetch User Detail Error:', error);
    return NextResponse.json(
      { success: false, error: 'Серверт алдаа гарлаа.' },
      { status: 500 }
    );
  }
}

// Мэдээлэл шинэчилж хадгалах (POST)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();

    if (!userId || userId === 'undefined') {
      return NextResponse.json(
        { success: false, error: 'Хэрэглэгчийн ID буруу байна.' },
        { status: 400 }
      );
    }

    const {
      email,
      first_name,
      last_name,
      male,
      phone,
      address,
      is_active,
      role,
      position
    } = body;

    const updateQuery = `
      UPDATE mt_user 
      SET 
        email = $1,
        first_name = $2,
        last_name = $3,
        male = $4,
        phone = $5,
        address = $6,
        is_active = $7,
        role = $8,
        position = $9,
        update_date = CURRENT_TIMESTAMP
      WHERE user_id = $10
      RETURNING *;
    `;

    const values = [
      email,
      first_name,
      last_name,
      male,
      phone,
      address,
      is_active,
      role,
      position,
      userId
    ];

    const updateResult = await pool.query(updateQuery, values);

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Шинэчлэх хэрэглэгч олдсонгүй.' },
        { status: 404 }
      );
    }

    // Компанийн нэрийг хамт буцаахын тулд дахин company join хийж авна
    const detailQuery = `
      SELECT 
        u.*,
        c.company_name
      FROM mt_user u
      LEFT JOIN mt_company c ON u.company_id = c.company_id
      WHERE u.user_id = $1
    `;
    const finalResult = await pool.query(detailQuery, [userId]);

    return NextResponse.json({
      success: true,
      data: finalResult.rows[0],
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Update User Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Серверт алдаа гарлаа.' },
      { status: 500 }
    );
  }
}