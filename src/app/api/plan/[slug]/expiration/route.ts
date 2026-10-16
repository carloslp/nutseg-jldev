import { NextRequest, NextResponse } from 'next/server';
import { NutritionRepository } from '@/lib/db/repository';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { expiresAt } = body;

    const success = await NutritionRepository.updatePermalinkExpiration(slug, expiresAt || null);
    if (!success) {
      return NextResponse.json({ error: 'Permalink no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, expiresAt });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error del servidor' }, { status: 500 });
  }
}
