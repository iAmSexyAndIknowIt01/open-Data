import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/src/lib/db'; // Замын дагуу тохируулна уу

export async function GET() {
  try {
    const cookieStore = cookies();
    const companyId = (await cookieStore).get('company_id')?.value;

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Компанийн ID cookie олдсонгүй.' },
        { status: 401 }
      );
    }

    const query = `
      SELECT company_id, company_name 
      FROM mt_company 
      WHERE company_id = $1
      LIMIT 1
    `;
    
    const result = await pool.query(query, [companyId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Компанийн мэдээлэл олдсонгүй.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Dashboard Company Fetch Error:', error);
    return NextResponse.json(
      { success: false, error: 'Серверт алдаа гарлаа.' },
      { status: 500 }
    );
  }
}