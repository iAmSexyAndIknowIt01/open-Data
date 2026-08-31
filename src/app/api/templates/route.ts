import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '../../../lib/db'; // Төслийн замын дагуу тохируулна уу

// 1. Тухайн компанийн идэвхтэй (is_active = true) анкетын тохиргоог авах GET метод
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

    // Тухайн компанийн идэвхтэй байгаа mt_templates дэх анкетын мэдээллийг татах
    const templateQuery = `
      SELECT id, company_id, title, description, questions, is_active, created_at, updated_at
      FROM mt_templates
      WHERE company_id = $1 AND is_active = true
      LIMIT 1
    `;
    const templateResult = await pool.query(templateQuery, [companyId]);

    // Хэрэглэгч ямар нэг идэвхтэй анкетгүй бол null буцаана
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

// 2. Анкетын шинэ хувилбар үүсгэх POST метод (Өмнөх хувилбаруудыг is_active = false болгоно)
export async function POST(request: Request) {
  const client = await pool.connect(); // Transaction ашиглах нь илүү найдвартай
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
    const userResult = await client.query(userQuery, [userId]);

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

    // Transaction эхлүүлэх
    await client.query('BEGIN');

    // Өмнө нь идэвхтэй байсан бүх анкетын is_active утгыг false болгож өөрчлөх
    const deactivateQuery = `
      UPDATE mt_templates 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE company_id = $1 AND is_active = true
    `;
    await client.query(deactivateQuery, [companyId]);

    // Шинэ хувилбарыг is_active = true байдлаар шинээр INSERT хийх
    const insertQuery = `
      INSERT INTO mt_templates (company_id, title, description, questions, is_active)
      VALUES ($1, $2, $3, $4::jsonb, true)
    `;
    await client.query(insertQuery, [companyId, title, description, JSON.stringify(questions)]);

    // Transaction амжилттай дуусгах
    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: 'Анкетын шинэ загвар амжилттай хадгалагдлаа.',
    });

  } catch (error) {
    await client.query('ROLLBACK'); // Алдаа гарвал буцаах
    console.error('Template Save Error:', error);
    return NextResponse.json(
      { success: false, error: 'Серверт алдаа гарлаа.' },
      { status: 500 }
    );
  } finally {
    client.release(); // Connection-ийг буцааж чөлөөлөх
  }
}