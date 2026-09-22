import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/src/lib/db';

// GET: Тухайн компанийн ажлуудын жагсаалт болон холбогдох сонголтын датаг татах
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

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Сонголтын датанууд (Хувь хүн, Компани, Үйлчилгээ, Ажилчид)
    if (action === 'options') {
      const individualsRes = await pool.query(
        `SELECT customer_id as id, first_name, last_name, phone FROM mt_customer WHERE company_id = $1 ORDER BY create_date DESC`,
        [companyId]
      );
      const companiesRes = await pool.query(
        `SELECT company_customer_id as id, name, tax_number, phone FROM mt_customerCompany WHERE company_id = $1 ORDER BY create_date DESC`,
        [companyId]
      );
      const servicesRes = await pool.query(
        `SELECT service_id, name, price, duration FROM mt_services WHERE company_id = $1 ORDER BY created_at DESC`,
        [companyId]
      );
      // mt_user хүснэгтээс ажилчдын мэдээллийг татах
      const employeesRes = await pool.query(
        `SELECT user_id, first_name, last_name, email FROM mt_user WHERE company_id = $1 ORDER BY create_date DESC`,
        [companyId]
      );

      return NextResponse.json({
        success: true,
        data: {
          individuals: individualsRes.rows,
          companies: companiesRes.rows,
          services: servicesRes.rows,
          employees: employeesRes.rows,
        }
      });
    }

    // Үндсэн ажлын жагсаалт татах query (mt_user-ийг assigned_employee-р холбох)
    const worksQuery = `
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
      WHERE w.company_id = $1
      ORDER BY w.create_date DESC
    `;

    const { rows } = await pool.query(worksQuery, [companyId]);

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('Fetch Works Error:', error);
    return NextResponse.json(
      { success: false, error: 'Ажлын мэдээлэл авахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

// POST: Шинэ ажил бүртгэх
export async function POST(request: Request) {
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

    if (!title || !customer_type) {
      return NextResponse.json(
        { success: false, error: 'Ажлын гарчиг болон харилцагчийн төрлийг оруулна уу.' },
        { status: 400 }
      );
    }

    let indCustomerId = null;
    let compCustomerId = null;

    if (customer_type === 'individual') {
      indCustomerId = customer_id || null;
    } else if (customer_type === 'company') {
      compCustomerId = customer_id || null;
    }

    const insertQuery = `
      INSERT INTO mt_works (
        company_id, customer_type, customer_id, company_customer_id, 
        service_id, assigned_employee, title, description, price, status, priority, due_date
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
      RETURNING *
    `;

    const values = [
      companyId,
      customer_type,
      indCustomerId,
      compCustomerId,
      service_id ? Number(service_id) : null,
      assigned_employee || null, // mt_user.user_id (UUID)
      title,
      description || null,
      price ? Number(price) : 0,
      status || 'pending',
      priority || 'medium', // Зэрэглэл утга
      due_date || null
    ];

    const { rows } = await pool.query(insertQuery, values);

    return NextResponse.json({ 
      success: true, 
      data: rows[0],
      message: 'Ажил амжилттай бүртгэгдлээ' 
    });
  } catch (error) {
    console.error('Create Work Error:', error);
    return NextResponse.json(
      { success: false, error: 'Ажил хадгалахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}