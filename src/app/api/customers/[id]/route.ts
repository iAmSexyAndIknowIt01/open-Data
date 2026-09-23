import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/src/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const customerId = resolvedParams.id;
    const cookieStore = cookies();
    const companyId = (await cookieStore).get('company_id')?.value;

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Нэвтрээгүй байна.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'company') {
      const query = `
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
          update_date,
          'company' as customer_type 
        FROM mt_customercompany 
        WHERE company_customer_id = $1 AND company_id = $2
      `;
      const { rows } = await pool.query(query, [customerId, companyId]);
      
      if (rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Компанийн харилцагч олдсонгүй' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: rows[0] });

    } else {
      const query = `
        SELECT 
          customer_id, 
          company_id, 
          first_name, 
          last_name, 
          email, 
          phone, 
          male,
          address, 
          status, 
          create_date, 
          update_date,
          'individual' as customer_type 
        FROM mt_customer 
        WHERE customer_id = $1 AND company_id = $2
      `;
      const { rows } = await pool.query(query, [customerId, companyId]);
      
      if (rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Хувь хүний харилцагч олдсонгүй' }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, data: rows[0] });
    }

  } catch (error) {
    console.error('Fetch Customer Detail Error:', error);
    return NextResponse.json(
      { success: false, error: 'Харилцагчийн мэдээлэл авахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const customerId = resolvedParams.id;
    const cookieStore = cookies();
    const companyId = (await cookieStore).get('company_id')?.value;

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Нэвтрээгүй байна.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const body = await request.json();

    if (type === 'company') {
      const { name, tax_number, email, phone, address } = body;
      
      const updateQuery = `
        UPDATE mt_customercompany 
        SET name = $1, tax_number = $2, email = $3, phone = $4, address = $5, update_date = CURRENT_TIMESTAMP
        WHERE company_customer_id = $6 AND company_id = $7
        RETURNING company_customer_id as customer_id, company_id, name, tax_number, email, phone, address, status, create_date, update_date, 'company' as customer_type
      `;
      
      const { rows } = await pool.query(updateQuery, [
        name, tax_number, email, phone, address, customerId, companyId
      ]);

      if (rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Компанийн мэдээлэл олдсонгүй' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: rows[0] });

    } else {
      const { first_name, last_name, email, phone, male, address } = body;

      const updateQuery = `
        UPDATE mt_customer 
        SET first_name = $1, last_name = $2, email = $3, phone = $4, male = $5, address = $6, update_date = CURRENT_TIMESTAMP
        WHERE customer_id = $7 AND company_id = $8
        RETURNING customer_id, company_id, first_name, last_name, email, phone, male, address, status, create_date, update_date, 'individual' as customer_type
      `;

      const { rows } = await pool.query(updateQuery, [
        first_name, last_name, email, phone, male, address, customerId, companyId
      ]);

      if (rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Хувь хүний мэдээлэл олдсонгүй' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: rows[0] });
    }

  } catch (error) {
    console.error('Update Customer Error:', error);
    return NextResponse.json(
      { success: false, error: 'Харилцагчийн мэдээллийг шинэчлэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}