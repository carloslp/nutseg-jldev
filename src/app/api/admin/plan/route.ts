import { NextRequest, NextResponse } from 'next/server';
import { NutritionRepository } from '@/lib/db/repository';
import { NutritionalPlan } from '@/lib/types/clinical';
import { generateReadablePin } from '@/lib/security/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan } = body;

    if (!plan || !plan.clientId || !plan.targetKcal) {
      return NextResponse.json({ error: 'Datos del plan incompletos' }, { status: 400 });
    }

    const savedPlan = await NutritionRepository.savePlan(plan as NutritionalPlan);

    // Update or create permalink current_plan_id
    let permalink = await NutritionRepository.getPermalinkByClientId(plan.clientId);
    if (permalink) {
      permalink = await NutritionRepository.createOrUpdatePermalink({
        clientId: plan.clientId,
        pin: permalink.passwordHintAdmin,
        slugToken: permalink.slugToken,
        currentPlanId: savedPlan.id,
      });
    } else {
      const initialPin = generateReadablePin();
      permalink = await NutritionRepository.createOrUpdatePermalink({
        clientId: plan.clientId,
        pin: initialPin,
        currentPlanId: savedPlan.id,
      });
    }

    return NextResponse.json({
      success: true,
      plan: savedPlan,
      permalinkSlug: permalink.slugToken,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error del servidor' }, { status: 500 });
  }
}
