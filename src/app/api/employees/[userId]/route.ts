import { NextResponse } from 'next/server';
import { pool } from '@/src/lib/db';

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

    // mt_user хүснэгтийн бүх баганыг (*) татаж авна (нууц үгээс бусад)
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