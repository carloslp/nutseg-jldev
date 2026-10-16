import { NextRequest, NextResponse } from 'next/server';
import { NutritionRepository } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const group = searchParams.get('group') || undefined;
    const search = searchParams.get('search') || undefined;

    const foods = await NutritionRepository.getFoodCatalog({ group, search });
    return NextResponse.json({ foods });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      smaeGroup,
      portionQty,
      portionUnit,
      gramsNet,
      kcal,
      proteinG,
      fatG,
      carbsG,
      allergenTags = [],
    } = body;

    if (!name || !smaeGroup || portionQty === undefined || !portionUnit || kcal === undefined) {
      return NextResponse.json(
        { error: 'Nombre, grupo SMAE, porción y calorías son obligatorios.' },
        { status: 400 }
      );
    }

    const food = await NutritionRepository.createFoodItem({
      name: name.trim(),
      smaeGroup,
      portionQty: Number(portionQty),
      portionUnit: portionUnit.trim(),
      gramsNet: Number(gramsNet || 100),
      kcal: Number(kcal),
      proteinG: Number(proteinG || 0),
      fatG: Number(fatG || 0),
      carbsG: Number(carbsG || 0),
      allergenTags,
      isActive: true,
    });

    return NextResponse.json({ success: true, food });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al crear alimento' }, { status: 500 });
  }
}
