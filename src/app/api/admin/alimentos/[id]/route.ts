import { NextRequest, NextResponse } from 'next/server';
import { NutritionRepository } from '@/lib/db/repository';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await NutritionRepository.updateFoodItem(id, {
      name: body.name,
      smaeGroup: body.smaeGroup,
      portionQty: body.portionQty !== undefined ? Number(body.portionQty) : undefined,
      portionUnit: body.portionUnit,
      gramsNet: body.gramsNet !== undefined ? Number(body.gramsNet) : undefined,
      kcal: body.kcal !== undefined ? Number(body.kcal) : undefined,
      proteinG: body.proteinG !== undefined ? Number(body.proteinG) : undefined,
      fatG: body.fatG !== undefined ? Number(body.fatG) : undefined,
      carbsG: body.carbsG !== undefined ? Number(body.carbsG) : undefined,
      allergenTags: body.allergenTags,
      isActive: body.isActive,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Alimento no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, food: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al actualizar alimento' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await NutritionRepository.deleteFoodItem(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al eliminar alimento' }, { status: 500 });
  }
}
