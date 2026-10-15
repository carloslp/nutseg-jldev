import { NextRequest, NextResponse } from 'next/server';
import { NutritionRepository } from '@/lib/db/repository';
import { NutritionalPlan } from '@/lib/types/clinical';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan } = body;

    if (!plan || !plan.clientId || !plan.targetKcal) {
      return NextResponse.json({ error: 'Datos del plan incompletos' }, { status: 400 });
    }

    const savedPlan = await NutritionRepository.savePlan(plan as NutritionalPlan);

    // Update permalink current_plan_id
    const permalink = await NutritionRepository.getPermalinkByClientId(plan.clientId);
    if (permalink) {
      await NutritionRepository.createOrUpdatePermalink({
        clientId: plan.clientId,
        pin: permalink.passwordHintAdmin,
        slugToken: permalink.slugToken,
        currentPlanId: savedPlan.id,
      });
    }

    return NextResponse.json({ success: true, plan: savedPlan });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error del servidor' }, { status: 500 });
  }
}
