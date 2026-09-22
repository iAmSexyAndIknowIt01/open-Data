import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/src/lib/db';

// GET: Тухайн ажлын дэлгэрэнгүй мэдээллийг авах
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = cookies();
    const companyId = (await cookieStore).get('company_id')?.value;

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Нэвтрээгүй байна. (Auth required)' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const query = `
      SELECT 
        w.*,
        CASE 
          WHEN w.customer_type = 'individual' THEN CONCAT(COALESCE(c.last_name, ''), ' ', COALESCE(c.first_name, ''))
          WHEN w.customer_type = 'company' THEN cc.name
          ELSE 'Тодорхойгүй'
        END AS customer_name,
        s.name AS service_name,
        CONCAT(COALESCE(u.last_name, ''), ' ', COALESCE(u.first_name, '')) AS employee_name
      FROM mt_works w
      LEFT JOIN mt_customer c ON w.customer_id = c.customer_id
      LEFT JOIN mt_customercompany cc ON w.company_customer_id = cc.company_customer_id
      LEFT JOIN mt_services s ON w.service_id = s.service_id
      LEFT JOIN mt_user u ON w.assigned_employee::text = u.user_id::text
      WHERE w.work_id = $1 AND w.company_id = $2
    `;

    const { rows } = await pool.query(query, [id, companyId]);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Ажил олдсонгүй' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Fetch Work Detail Error:', error);
    return NextResponse.json(
      { success: false, error: 'Ажлын мэдээллийг авахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

// PUT: Тухайн ажлын мэдээллийг (хариуцсан ажилтан, төлөв гэх мэт) засах
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = cookies();
    const companyId = (await cookieStore).get('company_id')?.value;

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Нэвтрээгүй байна. (Auth required)' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { 
      title, 
      customer_type, 
      customer_id, 
      service_id, 
      assigned_employee, 
      price, 
      status, 
      priority, 
      due_date, 
      description 
    } = body;

    let indCustomerId = null;
    let compCustomerId = null;

    if (customer_type === 'individual') {
      indCustomerId = customer_id || null;
    } else if (customer_type === 'company') {
      compCustomerId = customer_id || null;
    }

    const updateQuery = `
      UPDATE mt_works 
      SET 
        customer_type = $1, 
        customer_id = $2, 
        company_customer_id = $3, 
        service_id = $4, 
        assigned_employee = $5, 
        title = $6, 
        description = $7, 
        price = $8, 
        status = $9, 
        priority = $10, 
        due_date = $11, 
        update_date = CURRENT_TIMESTAMP
      WHERE work_id = $12 AND company_id = $13
      RETURNING *
    `;

    const values = [
      customer_type,
      indCustomerId,
      compCustomerId,
      service_id ? Number(service_id) : null,
      assigned_employee || null,
      title,
      description || null,
      price ? Number(price) : 0,
      status || 'pending',
      priority || 'medium',
      due_date || null,
      id,
      companyId
    ];

    const { rows } = await pool.query(updateQuery, values);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Засварлах ажил олдсонгүй' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: rows[0],
      message: 'Ажил амжилттай шинэчлэгдлээ' 
    });
  } catch (error) {
    console.error('Update Work Error:', error);
    return NextResponse.json(
      { success: false, error: 'Ажил шинэчлэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}