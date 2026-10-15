import { NextRequest, NextResponse } from 'next/server';
import { NutritionRepository } from '@/lib/db/repository';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const body = await request.json();
    const { newPin } = body;

    if (!newPin || typeof newPin !== 'string' || newPin.trim().length < 4) {
      return NextResponse.json({ error: 'El PIN debe tener al menos 4 caracteres.' }, { status: 400 });
    }

    const permalink = await NutritionRepository.getPermalinkBySlug(slug);
    if (!permalink) {
      return NextResponse.json({ error: 'Permalink no encontrado.' }, { status: 404 });
    }

    const updated = await NutritionRepository.createOrUpdatePermalink({
      clientId: permalink.clientId,
      pin: newPin.trim(),
      slugToken: slug,
      currentPlanId: permalink.currentPlanId || undefined,
    });

    return NextResponse.json({
      success: true,
      pin: updated.passwordHintAdmin,
      message: 'PIN actualizado. Las sesiones activas han sido invalidadas de inmediato.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error del servidor' }, { status: 500 });
  }
}
