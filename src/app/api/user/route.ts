import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/src/lib/db'; // Төслийн файлын бүтцээс хамаарч замыг шалгана уу

export async function GET() {
  try {
    const cookieStore = cookies();
    const userId = (await cookieStore).get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Хэрэглэгчийн ID cookie олдсонгүй.' },
        { status: 401 }
      );
    }

    const query = `
      SELECT email, first_name, last_name 
      FROM mt_user 
      WHERE user_id = $1
      LIMIT 1
    `;
    
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Хэрэглэгчийн мэдээлэл олдсонгүй.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('User Fetch Error:', error);
    return NextResponse.json(
      { success: false, error: 'Серверт алдаа гарлаа.' },
      { status: 500 }
    );
  }
}