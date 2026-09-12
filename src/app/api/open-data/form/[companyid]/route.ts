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

// 2. Үйлчлүүлэгчийн оруулсан хариуг form_submissions болон form_submission_answers рүү хадгалах
export async function POST(
  request: Request,
  { params }: { params: Promise<{ companyid: string }> }
) {
  // Transaction ашиглах тул client-ийг pool-оос дуудна
  const client = await pool.connect();

  try {
    const resolvedParams = await params;
    const companyid = resolvedParams.companyid;
    const body = await request.json();
    const { answers, templateId, questions } = body; 
    // answers: Record<string, string> (жишээ нь: { "1": "Бат", "2": "99112233" })
    // questions: Question[] (асуултын жагсаалт - question_label-г олох зорилгоор)

    if (!templateId) {
      return NextResponse.json(
        { success: false, error: 'Анкетын загварын ID олдсонгүй.' },
        { status: 400 }
      );
    }

    // Transaction эхлүүлэх
    await client.query('BEGIN');

    // Асуултуудыг хялбар хайх зорилгоор Map болгох (question_id -> question_label)
    const questionMap = new Map<string, string>();
    if (Array.isArray(questions)) {
      questions.forEach((q: { id: string; label: string }) => {
        questionMap.set(q.id, q.label);
      });
    }

    // 1. form_submissions хүснэгт рүү insert хийж шинэ submission_id авах
    const submissionQuery = `
      INSERT INTO form_submissions (form_template_id, company_id)
      VALUES ($1, $2)
      RETURNING id
    `;
    const submissionResult = await client.query(submissionQuery, [templateId, companyid]);
    const submissionId = submissionResult.rows[0].id;

    // 2. form_submission_answers хүснэгт рүү хариулт тус бүрээр insert хийх
    if (answers && typeof answers === 'object') {
      for (const [questionId, answerValue] of Object.entries(answers)) {
        const questionLabel = questionMap.get(questionId) || 'Тодорхойгүй асуулт';

        const answerQuery = `
          INSERT INTO form_submission_answers (submission_id, question_id, question_label, answer_value)
          VALUES ($1, $2, $3, $4)
        `;
        await client.query(answerQuery, [
          submissionId,
          questionId,
          questionLabel,
          answerValue !== undefined && answerValue !== null ? String(answerValue) : '',
        ]);
      }
    }

    // Бүх зүйл амжилттай бол commit хийх
    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: 'Анкет амжилттай илгээгдлээ.',
    });
  } catch (error) {
    // Алдаа гарвал бүх үйлдлийг буцаах
    await client.query('ROLLBACK');
    console.error('Client Answer Save Error:', error);
    return NextResponse.json(
      { success: false, error: 'Хадгалахад алдаа гарлаа.' },
      { status: 500 }
    );
  } finally {
    // Client-ийг чөлөөлөх
    client.release();
  }
}