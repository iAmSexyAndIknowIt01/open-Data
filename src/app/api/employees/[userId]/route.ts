import { NextResponse } from 'next/server';
import { pool } from '@/src/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Хэрэв userId нь "undefined" эсвэл хоосон байвал шууд алдаа буцаана
    if (!userId || userId === 'undefined') {
      return NextResponse.json(
        { success: false, error: 'Хэрэглэгчийн ID буруу байна.' },
        { status: 400 }
      );
    }

    // Анхаарах: mt_user хүснэгтэд ямар баганууд байгаагаар энд бичнэ. 
    // u.created_at байхгүй бол үүнийг хасах эсвэл c.created_at болгоно.
    const query = `
      SELECT 
        u.user_id,
        u.company_id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.address,
        u.role,
        u.is_active,
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