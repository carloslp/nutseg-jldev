import { BiologicalSex } from '../types/clinical';

export interface MifflinParams {
  sex: BiologicalSex;
  weightKg: number;
  heightCm: number;
  ageYears: number;
}

export interface KatchMcArdleParams {
  weightKg: number;
  bodyFatPct: number;
}

export interface TmbResult {
  formulaUsed: 'mifflin_st_jeor' | 'katch_mcardle';
  tmbKcal: number;
  lbmKg?: number;
  formulaDescription: string;
}

/**
 * Calculates Basal Metabolic Rate using Mifflin-St Jeor equation.
 * Male: (10 * weight) + (6.25 * height) - (5 * age) + 5
 * Female: (10 * weight) + (6.25 * height) - (5 * age) - 161
 */
export function calculateMifflinStJeor(params: MifflinParams): number {
  const { sex, weightKg, heightCm, ageYears } = params;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  const tmb = sex === 'male' ? base + 5 : base - 161;
  return Math.round(tmb * 10) / 10;
}

/**
 * Calculates Lean Body Mass (LBM / MLG) in kg.
 * MLG = weightKg * (1 - bodyFatPct / 100)
 */
export function calculateLBM(weightKg: number, bodyFatPct: number): number {
  const lbm = weightKg * (1 - bodyFatPct / 100);
  return Math.round(lbm * 10) / 10;
}

/**
 * Calculates Basal Metabolic Rate using Katch-McArdle equation based on LBM.
 * TMB = 370 + (21.6 * MLG)
 */
export function calculateKatchMcArdle(params: KatchMcArdleParams): { tmbKcal: number; lbmKg: number } {
  const lbmKg = calculateLBM(params.weightKg, params.bodyFatPct);
  const tmb = 370 + 21.6 * lbmKg;
  return {
    tmbKcal: Math.round(tmb * 10) / 10,
    lbmKg,
  };
}

/**
 * Automatically chooses Katch-McArdle if bodyFatPct is provided and valid,
 * otherwise falls back to Mifflin-St Jeor.
 */
export function resolveTMB(params: {
  sex: BiologicalSex;
  weightKg: number;
  heightCm: number;
  ageYears: number;
  bodyFatPct?: number | null;
}): TmbResult {
  const { sex, weightKg, heightCm, ageYears, bodyFatPct } = params;

  if (bodyFatPct != null && bodyFatPct > 0 && bodyFatPct < 70) {
    const katch = calculateKatchMcArdle({ weightKg, bodyFatPct });
    return {
      formulaUsed: 'katch_mcardle',
      tmbKcal: katch.tmbKcal,
      lbmKg: katch.lbmKg,
      formulaDescription: `Katch-McArdle [MLG: ${katch.lbmKg} kg] (370 + 21.6 × MLG)`,
    };
  }

  const mifflinTmb = calculateMifflinStJeor({ sex, weightKg, heightCm, ageYears });
  return {
    formulaUsed: 'mifflin_st_jeor',
    tmbKcal: mifflinTmb,
    formulaDescription: `Mifflin-St Jeor [${sex === 'male' ? 'Hombre +5' : 'Mujer -161'}]`,
  };
}
