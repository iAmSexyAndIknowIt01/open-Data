import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { hash, compare } from 'bcrypt';
import { pool } from '../../../lib/db';

// 1. Хэрэглэгчийн мэдээллийг авах GET метод
export async function GET() {
  try {
    const cookieStore = cookies();
    const userId = (await cookieStore).get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Нэвтрээгүй байна.' },
        { status: 401 }
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
        u.role,
        c.company_name
      FROM mt_user u
      JOIN mt_company c ON u.company_id = c.company_id
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
    console.error('Profile Fetch Error:', error);
    return NextResponse.json(
      { success: false, error: 'Серверт алдаа гарлаа.' },
      { status: 500 }
    );
  }
}

// 2. Хэрэглэгчийн мэдээлэл болон нууц үг шинэчлэх PUT метод
export async function PUT(request: Request) {
  try {
    const cookieStore = cookies();
    const userId = (await cookieStore).get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Нэвтрээгүй байна.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, address, currentPassword, newPassword } = body;

    // Хэрэв нууц үг солих гэж байгаа бол
    if (newPassword && newPassword.trim() !== '') {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Хуучин нууц үгээ оруулна уу.' },
          { status: 400 }
        );
      }

      const userResult = await pool.query(
        'SELECT password_hash FROM mt_user WHERE user_id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Хэрэглэгч олдсонгүй.' },
          { status: 404 }
        );
      }

      const isValidPassword = await compare(currentPassword, userResult.rows[0].password_hash);

      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, error: 'Оруулсан хуучин нууц үг буруу байна.' },
          { status: 400 }
        );
      }

      const hashedPassword = await hash(newPassword, 10);

      const updateQuery = `
        UPDATE mt_user 
        SET 
          first_name = $1, 
          last_name = $2, 
          email = $3, 
          phone = $4, 
          address = $5, 
          password_hash = $6,
          update_date = CURRENT_TIMESTAMP
        WHERE user_id = $7
      `;

      await pool.query(updateQuery, [firstName, lastName, email, phone, address, hashedPassword, userId]);

    } else {
      // Нууц үг солихгүй үед (параметрийн дараалал зөв байхаар засав)
      const updateQuery = `
        UPDATE mt_user 
        SET 
          first_name = $1, 
          last_name = $2, 
          email = $3, 
          phone = $4, 
          address = $5,
          update_date = CURRENT_TIMESTAMP
        WHERE user_id = $6
      `;

      await pool.query(updateQuery, [firstName, lastName, email, phone, address, userId]);
    }

    return NextResponse.json({
      success: true,
      message: 'Мэдээлэл амжилттай шинэчлэгдлээ.',
    });

  } catch (error) {
    console.error('Profile Update Error:', error);
    return NextResponse.json(
      { success: false, error: 'Серверт алдаа гарлаа.' },
      { status: 500 }
    );
  }
}