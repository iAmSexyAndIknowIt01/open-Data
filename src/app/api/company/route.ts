import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { compare, hash } from 'bcrypt';
import { pool } from '../../../lib/db'; // Таны өөрийн db холболтын файл

// GET: Cookie-гээс company_id авч mt_company хүснэгтээс мэдээлэл татах
export async function GET(request: Request) {
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
      SELECT company_id, company_name, owner_name, email, phone_number, address 
      FROM mt_company 
      WHERE company_id = $1
    `;
    const { rows } = await pool.query(query, [companyId]);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Компанийн мэдээлэл олдсонгүй.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Fetch Company Error:', error);
    return NextResponse.json(
      { success: false, error: 'Мэдээлэл авахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

// PUT: Компанийн мэдээлэл болон нууц үг шинэчлэх
export async function PUT(request: Request) {
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
    const { companyName, ownerName, email, currentPassword, newPassword, phoneNumber, address } = body;

    // Хэрэв нууц үг солих гэж байгаа бол хуучин нууц үгийг шалгах
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Шинэ нууц үг оруулахын тулд хуучин нууц үгээ бичнэ үү.' },
          { status: 400 }
        );
      }

      // Тухайн компанийн одоогийн нууц үгийн хешийг авах
      const companyResult = await pool.query(
        'SELECT password_hash FROM mt_company WHERE company_id = $1',
        [companyId]
      );

      if (companyResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Компани олдсонгүй.' },
          { status: 404 }
        );
      }

      const isValidPassword = await compare(currentPassword, companyResult.rows[0].password_hash);
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, error: 'О оруулсан хуучин нууц үг буруу байна.' },
          { status: 400 }
        );
      }

      // Шинэ нууц үгийг hash хийх
      const newPasswordHash = await hash(newPassword, 10);

      // Нууц үгтэй хамт шинэчлэх query
      const updateWithPasswordQuery = `
        UPDATE mt_company 
        SET company_name = $1, owner_name = $2, email = $3, phone_number = $4, address = $5, password_hash = $6, updated_at = CURRENT_TIMESTAMP
        WHERE company_id = $7
      `;
      await pool.query(updateWithPasswordQuery, [companyName, ownerName, email, phoneNumber, address, newPasswordHash, companyId]);

    } else {
      // Зөвхөн үндсэн мэдээлэл шинэчлэх query
      const updateQuery = `
        UPDATE mt_company 
        SET company_name = $1, owner_name = $2, email = $3, phone_number = $4, address = $5, updated_at = CURRENT_TIMESTAMP
        WHERE company_id = $6
      `;
      await pool.query(updateQuery, [companyName, ownerName, email, phoneNumber, address, companyId]);
    }

    return NextResponse.json({ success: true, message: 'Мэдээлэл амжилттай шинэчлэгдлээ' });
  } catch (error) {
    console.error('Update Company Error:', error);
    return NextResponse.json(
      { success: false, error: 'Хадгалахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}