import { NextResponse } from 'next/server';
import { requireAuth } from '@/src/lib/session';
import { pool } from '@/src/lib/db';

const SERVICE_COLUMNS = 'service_id, company_id, name, category, price, duration, description, status, created_at';

// service_id нь integer тул зөвхөн тоон ID хүлээн авна
const isValidId = (id: string) => /^\d+$/.test(id);

// GET: Нэг үйлчилгээний дэлгэрэнгүй мэдээлэл
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { session, error: authError } = await requireAuth();
    if (authError) return authError;

    if (!isValidId(id)) {
      return NextResponse.json({ success: false, error: 'Үйлчилгээ олдсонгүй' }, { status: 404 });
    }

    const { rows } = await pool.query(
      `SELECT ${SERVICE_COLUMNS} FROM mt_services WHERE service_id = $1 AND company_id = $2`,
      [id, session.companyId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Үйлчилгээ олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Fetch Service Detail Error:', error);
    return NextResponse.json(
      { success: false, error: 'Үйлчилгээний мэдээлэл авахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

// PUT: Үйлчилгээний мэдээллийг шинэчлэх (зөвхөн админ)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { session, error: authError } = await requireAuth({ admin: true });
    if (authError) return authError;

    if (!isValidId(id)) {
      return NextResponse.json({ success: false, error: 'Үйлчилгээ олдсонгүй' }, { status: 404 });
    }

    const body = await request.json();
    const { name, category, price, duration, description, status } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { success: false, error: 'Үйлчилгээний нэрийг оруулна уу.' },
        { status: 400 }
      );
    }

    const priceNum = price === '' || price === null || price === undefined ? 0 : Number(price);
    const durationNum = duration === '' || duration === null || duration === undefined ? null : Number(duration);

    if (!Number.isFinite(priceNum) || priceNum < 0) {
      return NextResponse.json({ success: false, error: 'Үнэ буруу байна.' }, { status: 400 });
    }
    if (durationNum !== null && (!Number.isInteger(durationNum) || durationNum < 1)) {
      return NextResponse.json({ success: false, error: 'Хугацаа буруу байна.' }, { status: 400 });
    }

    const statusValue = status === 'inactive' ? 'inactive' : 'active';

    const { rows } = await pool.query(
      `UPDATE mt_services
       SET name = $1, category = $2, price = $3, duration = $4, description = $5, status = $6
       WHERE service_id = $7 AND company_id = $8
       RETURNING ${SERVICE_COLUMNS}`,
      [
        String(name).trim(),
        category || null,
        priceNum,
        durationNum,
        description || null,
        statusValue,
        id,
        session.companyId,
      ]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Үйлчилгээ олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Update Service Error:', error);
    return NextResponse.json(
      { success: false, error: 'Үйлчилгээний мэдээллийг шинэчлэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}
