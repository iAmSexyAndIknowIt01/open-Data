import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/session';
import { getDatasetSummaries } from '@/src/lib/datasets';

// GET: Экспортлох боломжтой өгөгдлийн багц бүрийн мөрийн тоо, сүүлд нэмэгдсэн огноо
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Нэвтрээгүй байна. (Auth required)' },
        { status: 401 }
      );
    }

    const data = await getDatasetSummaries(session.companyId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Fetch Dataset Summaries Error:', error);
    return NextResponse.json(
      { success: false, error: 'Өгөгдлийн мэдээлэл авахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}
