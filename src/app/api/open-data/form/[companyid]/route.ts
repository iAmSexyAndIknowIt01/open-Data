import { NextResponse } from 'next/server';
import { pool } from '../../../../../lib/db'; // Замын дагуу тохируулна уу

// 1. Тухайн компанийн ID-аар идэвхтэй анкетын загварыг авах
export async function GET(
  request: Request,
  { params }: { params: Promise<{ companyid: string }> }
) {
  try {
    const resolvedParams = await params;
    const companyid = resolvedParams.companyid;

    const query = `
      SELECT id, company_id, title, description, questions
      FROM mt_templates
      WHERE company_id = $1 AND is_active = true
      LIMIT 1
    `;
    const result = await pool.query(query, [companyid]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Анкет олдсонгүй.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Public Template Fetch Error:', error);
    return NextResponse.json(
      { success: false, error: 'Серверт алдаа гарлаа.' },
      { status: 500 }
    );
  }
}

// 2. Үйлчлүүлэгчийн оруулсан хариуг хадгалах POST метод
export async function POST(
  request: Request,
  { params }: { params: Promise<{ companyid: string }> }
) {
  try {
    const resolvedParams = await params;
    const companyid = resolvedParams.companyid;
    const body = await request.json();
    const { answers } = body; // Үйлчлүүлэгчийн бөглөсөн хариултууд

    // Жишээ нь: Үйлчлүүлэгчийн хариуг хадгалах хүснэгт рүү бичих (mt_client_answers гэх мэт)
    const insertQuery = `
      INSERT INTO mt_client_answers (company_id, answers, created_at)
      VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    await pool.query(insertQuery, [companyid, JSON.stringify(answers)]);

    return NextResponse.json({
      success: true,
      message: 'Анкет амжилттай илгээгдлээ.',
    });
  } catch (error) {
    console.error('Client Answer Save Error:', error);
    return NextResponse.json(
      { success: false, error: 'Хадгалахад алдаа гарлаа.' },
      { status: 500 }
    );
  }
}