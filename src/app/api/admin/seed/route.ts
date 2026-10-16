import { NextResponse } from 'next/server';
import { NutritionRepository } from '@/lib/db/repository';

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true';

    const result = await NutritionRepository.seedCatalogsIfNeeded(force);
    return NextResponse.json({
      success: true,
      message: 'Catálogos SMAE y ejercicios sincronizados correctamente.',
      ...result,
    });
  } catch (error: any) {
    console.error('Seed endpoint error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al ejecutar seed' },
      { status: 500 }
    );
  }
}
