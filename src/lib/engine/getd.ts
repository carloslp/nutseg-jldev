import { BiologicalSex, GoalType } from '../types/clinical';

export interface GetdParams {
  tmbKcal: number;
  activityFactor: number; // 1.2 to 2.2
}

export interface GoalAdjustmentParams {
  getdKcal: number;
  goal: GoalType;
  customAdjustmentPct?: number;
  sex: BiologicalSex;
  allowFloorOverride?: boolean;
}

export interface CaloricPlanResult {
  getdKcal: number;
  targetKcal: number;
  goalAdjustmentPct: number;
  caloricFloorMin: number;
  caloricFloorEnforced: boolean;
  clinicalSafetyWarning?: string;
}

/**
 * Standard percentage adjustment by goal type.
 */
export const GOAL_ADJUSTMENT_MAP: Record<GoalType, number> = {
  deficit_aggressive: -20,
  deficit_moderate: -15,
  maintenance: 0,
  surplus_lean: 10,
  surplus_aggressive: 15,
  custom: 0,
};

/**
 * Minimum clinical caloric safety floors.
 * 1,200 kcal for females, 1,500 kcal for males.
 */
export const CALORIC_FLOOR_BY_SEX: Record<BiologicalSex, number> = {
  female: 1200,
  male: 1500,
};

/**
 * Calculates GETD (Total Daily Energy Expenditure).
 * GETD = TMB * FAF
 */
export function calculateGETD(params: GetdParams): number {
  const getd = params.tmbKcal * params.activityFactor;
  return Math.round(getd);
}

/**
 * Applies goal percentage and enforces clinical caloric floors.
 */
export function calculateTargetCalories(params: GoalAdjustmentParams): CaloricPlanResult {
  const { getdKcal, goal, customAdjustmentPct, sex, allowFloorOverride = false } = params;

  const adjustmentPct =
    goal === 'custom' && typeof customAdjustmentPct === 'number'
      ? customAdjustmentPct
      : GOAL_ADJUSTMENT_MAP[goal] ?? 0;

  const rawTarget = getdKcal * (1 + adjustmentPct / 100);
  const floorMin = CALORIC_FLOOR_BY_SEX[sex];

  let targetKcal = Math.round(rawTarget);
  let caloricFloorEnforced = false;
  let clinicalSafetyWarning: string | undefined;

  if (targetKcal < floorMin) {
    if (!allowFloorOverride) {
      targetKcal = floorMin;
      caloricFloorEnforced = true;
      clinicalSafetyWarning = `Ajuste truncado al suelo calórico clínico mínimo de ${floorMin} kcal/d para preservar la función tiroidea y masa muscular en ${sex === 'female' ? 'mujeres' : 'hombres'}.`;
    } else {
      clinicalSafetyWarning = `ADVERTENCIA: Candado clínico desbloqueado manualmente por el especialista. La prescripción (${targetKcal} kcal) se encuentra por debajo del suelo fisiológico seguro (${floorMin} kcal).`;
    }
  }

  return {
    getdKcal,
    targetKcal,
    goalAdjustmentPct: adjustmentPct,
    caloricFloorMin: floorMin,
    caloricFloorEnforced,
    clinicalSafetyWarning,
  };
}
