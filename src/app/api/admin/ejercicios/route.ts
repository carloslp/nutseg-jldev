import { NextRequest, NextResponse } from 'next/server';
import { NutritionRepository } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pattern = searchParams.get('pattern') || undefined;
    const equipment = searchParams.get('equipment') || undefined;
    const search = searchParams.get('search') || undefined;

    const exercises = await NutritionRepository.getExerciseCatalog({
      pattern,
      equipment,
      search,
    });
    return NextResponse.json({ exercises });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      movementPattern,
      primaryMuscle,
      equipmentRequired,
      difficulty,
      jointStressTags = [],
      defaultSets,
      defaultReps,
      defaultRestSec,
      instructions,
      videoUrl,
    } = body;

    if (!name || !movementPattern || !equipmentRequired) {
      return NextResponse.json(
        { error: 'Nombre, patrón de movimiento y equipamiento son requeridos.' },
        { status: 400 }
      );
    }

    const exercise = await NutritionRepository.createExerciseItem({
      name: name.trim(),
      movementPattern,
      primaryMuscle: primaryMuscle?.trim() || 'General',
      equipmentRequired,
      difficulty: difficulty || 'intermediate',
      jointStressTags,
      defaultSets: Number(defaultSets || 3),
      defaultReps: String(defaultReps || '10-12'),
      defaultRestSec: Number(defaultRestSec || 90),
      instructions: instructions?.trim() || undefined,
      videoUrl: videoUrl?.trim() || undefined,
      isActive: true,
    });

    return NextResponse.json({ success: true, exercise });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al crear ejercicio' }, { status: 500 });
  }
}
