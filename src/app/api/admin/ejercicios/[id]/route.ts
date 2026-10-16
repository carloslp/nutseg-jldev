import { NextRequest, NextResponse } from 'next/server';
import { NutritionRepository } from '@/lib/db/repository';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await NutritionRepository.updateExerciseItem(id, {
      name: body.name,
      movementPattern: body.movementPattern,
      primaryMuscle: body.primaryMuscle,
      equipmentRequired: body.equipmentRequired,
      difficulty: body.difficulty,
      jointStressTags: body.jointStressTags,
      defaultSets: body.defaultSets !== undefined ? Number(body.defaultSets) : undefined,
      defaultReps: body.defaultReps !== undefined ? String(body.defaultReps) : undefined,
      defaultRestSec: body.defaultRestSec !== undefined ? Number(body.defaultRestSec) : undefined,
      instructions: body.instructions,
      videoUrl: body.videoUrl,
      isActive: body.isActive,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Ejercicio no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, exercise: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al actualizar ejercicio' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await NutritionRepository.deleteExerciseItem(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al eliminar ejercicio' }, { status: 500 });
  }
}
