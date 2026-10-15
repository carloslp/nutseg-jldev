import { NextRequest, NextResponse } from 'next/server';
import { NutritionRepository } from '@/lib/db/repository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clientId,
      recordedAt,
      weightKg,
      bodyFatPct,
      muscleMassKg,
      waistCm,
      hipCm,
      abdomenCm,
      armRelaxedCm,
      armContractedCm,
      thighCm,
      activityFactor,
      trainingDays,
      equipmentAvailable,
      notes,
    } = body;

    if (!clientId || typeof weightKg !== 'number') {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const created = await NutritionRepository.addBiometricLog({
      clientId,
      recordedAt: recordedAt || new Date().toISOString().split('T')[0],
      weightKg,
      bodyFatPct: bodyFatPct ?? null,
      muscleMassKg: muscleMassKg ?? null,
      waistCm: waistCm ?? null,
      hipCm: hipCm ?? null,
      abdomenCm: abdomenCm ?? null,
      armRelaxedCm: armRelaxedCm ?? null,
      armContractedCm: armContractedCm ?? null,
      thighCm: thighCm ?? null,
      activityFactor: activityFactor || 1.4,
      trainingDays: trainingDays || 3,
      equipmentAvailable: equipmentAvailable || ['gym'],
      notes,
    });

    return NextResponse.json({ success: true, log: created });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error del servidor' }, { status: 500 });
  }
}
