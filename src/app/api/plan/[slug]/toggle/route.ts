import { NextRequest, NextResponse } from 'next/server';
import { NutritionRepository } from '@/lib/db/repository';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive must be a boolean.' }, { status: 400 });
    }

    const success = await NutritionRepository.togglePermalinkActive(slug, isActive);
    if (!success) {
      return NextResponse.json({ error: 'Permalink not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, isActive });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
