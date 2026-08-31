import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '../../../lib/db'; // Төслийн замын дагуу тохируулна уу

// 1. Тухайн компанийн анкетын тохиргоог авах GET метод
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

    // Хэрэглэгчийн харъяалагдах company_id-г mt_user хүснэгтээс олно
    const userQuery = 'SELECT company_id FROM mt_user WHERE user_id = $1';
    const userResult = await pool.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Хэрэглэгч олдсонгүй.' },
        { status: 404 }
      );
    }

    const companyId = userResult.rows[0].company_id;

    // Тухайн компанийн mt_templates дэх анкетын мэдээллийг татах
    const templateQuery = `
      SELECT id, company_id, title, description, questions, is_active, created_at, updated_at
      FROM mt_templates
      WHERE company_id = $1
      LIMIT 1
    `;
    const templateResult = await pool.query(templateQuery, [companyId]);

    // Хэрэв анкет байхгүй бол хоосон өгөгдөл эсвэл default утга буцааж болно
    if (templateResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: templateResult.rows[0],
    });

  } catch (error) {
    console.error('Template Fetch Error:', error);
    return NextResponse.json(
      { success: false, error: 'Серверт алдаа гарлаа.' },
      { status: 500 }
    );
  }
}

// 2. Анкетын тохиргоог үүсгэх эсвэл шинэчлэх POST/PUT метод
export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const userId = (await cookieStore).get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Нэвтрээгүй байна.' },
        { status: 401 }
      );
    }

    // Хэрэглэгчийн company_id-г олох
    const userQuery = 'SELECT company_id FROM mt_user WHERE user_id = $1';
    const userResult = await pool.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Хэрэглэгч олдсонгүй.' },
        { status: 404 }
      );
    }

    const companyId = userResult.rows[0].company_id;

    const body = await request.json();
    const { title, description, questions } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Анкетын гарчиг заавал шаардлагатай.' },
        { status: 400 }
      );
    }

    // Тухайн компани аль хэдийн анкеттай эсэхийг шалгах
    const checkQuery = 'SELECT id FROM mt_templates WHERE company_id = $1';
    const checkResult = await pool.query(checkQuery, [companyId]);

    if (checkResult.rows.length > 0) {
      // Хэрэв байвал UPDATE хийнэ
      const updateQuery = `
        UPDATE mt_templates 
        SET 
          title = $1, 
          description = $2, 
          questions = $3::jsonb, 
          updated_at = CURRENT_TIMESTAMP
        WHERE company_id = $4
      `;
      await pool.query(updateQuery, [title, description, JSON.stringify(questions), companyId]);
    } else {
      // Байхгүй бол шинээр INSERT хийнэ
      const insertQuery = `
        INSERT INTO mt_templates (company_id, title, description, questions, is_active)
        VALUES ($1, $2, $3, $4::jsonb, true)
      `;
      await pool.query(insertQuery, [companyId, title, description, JSON.stringify(questions)]);
    }

    return NextResponse.json({
      success: true,
      message: 'Анкетын тохиргоо амжилттай хадгалагдлаа.',
    });

  } catch (error) {
    console.error('Template Save Error:', error);
    return NextResponse.json(
      { success: false, error: 'Серверт алдаа гарлаа.' },
      { status: 500 }
    );
  }
}