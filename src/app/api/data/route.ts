import { NextResponse } from 'next/server';
import { requireAuth } from '@/src/lib/session';
import { getDatasetSummaries } from '@/src/lib/datasets';

// GET: Экспортлох боломжтой өгөгдлийн багц бүрийн мөрийн тоо, сүүлд нэмэгдсэн огноо
export async function GET() {
  try {
    // Бүх өгөгдлийг бөөнөөр экспортлох нь зөвхөн админы эрх (харилцагчдын хувийн мэдээлэл агуулдаг)
    const { session, error: authError } = await requireAuth({ admin: true });
    if (authError) return authError;

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
