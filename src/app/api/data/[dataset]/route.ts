import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/session';
import { getDataset, toCsv } from '@/src/lib/datasets';

const PREVIEW_LIMIT = 20;

// GET: Нэг өгөгдлийн багцыг авах
//   ?format=csv  → бүх мөрийг CSV файлаар татна
//   (default)    → эхний 20 мөрийг JSON-оор урьдчилан харуулна
export async function GET(
  request: Request,
  { params }: { params: Promise<{ dataset: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Нэвтрээгүй байна. (Auth required)' },
        { status: 401 }
      );
    }

    const { dataset: datasetKey } = await params;
    const dataset = getDataset(datasetKey);
    if (!dataset) {
      return NextResponse.json(
        { success: false, error: 'Өгөгдлийн багц олдсонгүй.' },
        { status: 404 }
      );
    }

    const table = await dataset.load(session.companyId);
    const { searchParams } = new URL(request.url);

    if (searchParams.get('format') === 'csv') {
      const date = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Ulaanbaatar' });
      const filename = `${dataset.key}-${date}.csv`;
      return new NextResponse(toCsv(table), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        key: dataset.key,
        label: dataset.label,
        columns: table.columns.map((c) => c.label),
        rows: table.rows.slice(0, PREVIEW_LIMIT),
        total: table.rows.length,
      },
    });
  } catch (error) {
    console.error('Fetch Dataset Error:', error);
    return NextResponse.json(
      { success: false, error: 'Өгөгдөл авахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}
