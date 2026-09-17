import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/src/lib/db'; // Таны өөрийн db холболтын файл

// GET: Тухайн компанийн харилцагчдыг төрлөөр нь эсвэл бүгдийг нь татах
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
    const type = searchParams.get('type'); // 'company' | 'individual' эсвэл хоосон

    const customers = [];

    // 1. Хувь хүний харилцагчдыг авах (mt_customer)
    if (!type || type === 'individual') {
      const individualQuery = `
        SELECT 
          customer_id, 
          company_id, 
          first_name, 
          last_name, 
          email, 
          phone, 
          address, 
          status, 
          create_date, 
          'individual' as customer_type 
        FROM mt_customer 
        WHERE company_id = $1 
        ORDER BY create_date DESC
      `;
      const { rows: individuals } = await pool.query(individualQuery, [companyId]);
      customers.push(...individuals);
    }

    // 2. Компанийн харилцагчдыг авах (mt_customerCompany)
    if (!type || type === 'company') {
      const companyQuery = `
        SELECT 
          company_customer_id as customer_id, 
          company_id, 
          name, 
          tax_number, 
          email, 
          phone, 
          address, 
          status, 
          create_date, 
          'company' as customer_type 
        FROM mt_customerCompany 
        WHERE company_id = $1 
        ORDER BY create_date DESC
      `;
      const { rows: companies } = await pool.query(companyQuery, [companyId]);
      customers.push(...companies);
    }

    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    console.error('Fetch Customers Error:', error);
    return NextResponse.json(
      { success: false, error: 'Харилцагчийн мэдээлэл авахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

// POST: Харилцагчийн төрлөөс хамааран mt_customer эсвэл mt_customerCompany рүү хадгалах
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
    const { customer_type, name, first_name, last_name, email, phone, address, tax_number } = body;

    if (customer_type === 'individual') {
      // Хувь хүн бол mt_customer хүснэгт рүү хадгална
      if (!first_name) {
        return NextResponse.json(
          { success: false, error: 'Хувь хүний нэрийг оруулна уу.' },
          { status: 400 }
        );
      }

      const insertIndividualQuery = `
        INSERT INTO mt_customer (company_id, first_name, last_name, email, phone, address) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *
      `;
      await pool.query(insertIndividualQuery, [companyId, first_name, last_name, email, phone, address]);

    } else if (customer_type === 'company') {
      // Компани бол mt_customerCompany хүснэгт рүү хадгална
      if (!name || !tax_number) {
        return NextResponse.json(
          { success: false, error: 'Компанийн нэр болон регистр / татварын дугаарыг оруулна уу.' },
          { status: 400 }
        );
      }

      const insertCompanyQuery = `
        INSERT INTO mt_customerCompany (company_id, name, tax_number, email, phone, address) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *
      `;
      await pool.query(insertCompanyQuery, [companyId, name, tax_number, email, phone, address]);

    } else {
      return NextResponse.json(
        { success: false, error: 'Харилцагчийн төрөл буруу байна.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Харилцагч амжилттай хадгалагдлаа' 
    });
  } catch (error) {
    console.error('Create Customer Error:', error);
    return NextResponse.json(
      { success: false, error: 'Харилцагч хадгалахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}