import { ClinicalFlag } from '../types/clinical';

export interface BmiAnalysis {
  bmi: number;
  isObese: boolean;
  pisKg?: number; // Peso Ideal Superior
  adjustedWeightKg?: number; // Peso Ajustado (PA)
  referenceWeightKg: number;
}

export interface MacroDistributionParams {
  weightKg: number;
  heightCm: number;
  targetKcal: number;
  proteinRatioGKg?: number; // default 1.8
  fatRatioGKg?: number; // default 1.0
  clinicalFlags?: ClinicalFlag[];
}

export interface MacroDistributionResult {
  bmi: number;
  isObese: boolean;
  pisKg?: number;
  adjustedWeightKg?: number;
  referenceWeightKg: number;
  proteinG: number;
  proteinKcal: number;
  proteinPct: number;
  proteinRatioGKg: number;
  fatG: number;
  fatKcal: number;
  fatPct: number;
  fatRatioGKg: number;
  carbsG: number;
  carbsKcal: number;
  carbsPct: number;
  clinicalProteinAlert?: string;
}

/**
 * Calculates BMI (Body Mass Index) in kg/m^2.
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

/**
 * Evaluates weight and calculates Adjusted Body Weight (PA) if BMI >= 30.
 * PIS = 25 * (heightM)^2
 * PA = PIS + 0.25 * (weightActual - PIS)
 */
export function analyzeBodyWeightForMacros(weightKg: number, heightCm: number): BmiAnalysis {
  const bmi = calculateBMI(weightKg, heightCm);
  const heightM = heightCm / 100;
  const isObese = bmi >= 30;

  if (isObese) {
    const pisKg = Math.round(25 * heightM * heightM * 10) / 10;
    const pa = pisKg + 0.25 * (weightKg - pisKg);
    const adjustedWeightKg = Math.round(pa * 10) / 10;
    return {
      bmi,
      isObese: true,
      pisKg,
      adjustedWeightKg,
      referenceWeightKg: adjustedWeightKg,
    };
  }

  return {
    bmi,
    isObese: false,
    referenceWeightKg: weightKg,
  };
}

/**
 * Distributes macronutrients based on caloric target, clinical flags, and body weight.
 */
export function calculateMacronutrients(params: MacroDistributionParams): MacroDistributionResult {
  const {
    weightKg,
    heightCm,
    targetKcal,
    clinicalFlags = [],
  } = params;

  const weightAnalysis = analyzeBodyWeightForMacros(weightKg, heightCm);
  const refWeight = weightAnalysis.referenceWeightKg;

  let proteinRatio = params.proteinRatioGKg ?? 1.8;
  let clinicalProteinAlert: string | undefined;

  const hasRenalRisk =
    clinicalFlags.includes('renal_pathology') ||
    clinicalFlags.includes('diabetes_type_2');

  if (hasRenalRisk && proteinRatio > 2.0) {
    clinicalProteinAlert = `Alerta de Seguridad Renal: Se recomienda un aporte proteico ≤ 2.0 g/kg (actual: ${proteinRatio} g/kg) por antecedente metabólico/renal reportado en el expediente.`;
  }

  // Protein calculation
  const proteinG = Math.round(refWeight * proteinRatio * 10) / 10;
  const proteinKcal = Math.round(proteinG * 4);

  // Fat calculation
  const fatRatio = params.fatRatioGKg ?? 1.0;
  const fatG = Math.round(refWeight * fatRatio * 10) / 10;
  const fatKcal = Math.round(fatG * 9);

  // Carbs calculation (remaining energy)
  const remainingKcal = Math.max(0, targetKcal - (proteinKcal + fatKcal));
  const carbsG = Math.round((remainingKcal / 4) * 10) / 10;
  const carbsKcal = Math.round(carbsG * 4);

  // Percentages
  const totalCalculatedKcal = proteinKcal + fatKcal + carbsKcal;
  const proteinPct = Math.round((proteinKcal / totalCalculatedKcal) * 100);
  const fatPct = Math.round((fatKcal / totalCalculatedKcal) * 100);
  const carbsPct = 100 - (proteinPct + fatPct);

  return {
    bmi: weightAnalysis.bmi,
    isObese: weightAnalysis.isObese,
    pisKg: weightAnalysis.pisKg,
    adjustedWeightKg: weightAnalysis.adjustedWeightKg,
    referenceWeightKg: refWeight,
    proteinG,
    proteinKcal,
    proteinPct,
    proteinRatioGKg: proteinRatio,
    fatG,
    fatKcal,
    fatPct,
    fatRatioGKg: fatRatio,
    carbsG,
    carbsKcal,
    carbsPct,
    clinicalProteinAlert,
  };
}
