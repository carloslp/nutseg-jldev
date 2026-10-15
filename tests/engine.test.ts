import { describe, it, expect } from 'vitest';
import { calculateMifflinStJeor, calculateKatchMcArdle, calculateLBM, resolveTMB } from '../src/lib/engine/tmb';
import { calculateGETD, calculateTargetCalories, CALORIC_FLOOR_BY_SEX } from '../src/lib/engine/getd';
import { calculateBMI, analyzeBodyWeightForMacros, calculateMacronutrients } from '../src/lib/engine/macros';
import {
  solveSmaePortions,
  calculateSmaeTotals,
  validateMacroTolerance,
  filterFoodsForPatient,
  DEFAULT_FOOD_CATALOG,
} from '../src/lib/engine/smae';
import {
  determineSplitByDays,
  filterSafeExercises,
  buildWorkoutRoutine,
  EXERCISE_DATABASE,
} from '../src/lib/engine/workout';

describe('Módulo 2: Motor Algorítmico - Fórmulas Metabólicas (TMB & GETD)', () => {
  it('CA-2.1: Calcula Mifflin-St Jeor correctamente para hombre y mujer', () => {
    // Hombre: peso 80kg, talla 180cm, edad 30 años
    // 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780 kcal
    const tmbHombre = calculateMifflinStJeor({
      sex: 'male',
      weightKg: 80,
      heightCm: 180,
      ageYears: 30,
    });
    expect(tmbHombre).toBe(1780);

    // Mujer: peso 60kg, talla 165cm, edad 28 años
    // 10*60 + 6.25*165 - 5*28 - 161 = 600 + 1031.25 - 140 - 161 = 1330.25 -> 1330.3
    const tmbMujer = calculateMifflinStJeor({
      sex: 'female',
      weightKg: 60,
      heightCm: 165,
      ageYears: 28,
    });
    expect(tmbMujer).toBe(1330.3);
  });

  it('CA-2.1: Calcula Katch-McArdle y MLG a partir de % de grasa corporal', () => {
    // Peso: 84.3 kg, Grasa: 18.4%
    // MLG = 84.3 * (1 - 0.184) = 68.7888 -> 68.8 kg
    // TMB = 370 + 21.6 * 68.8 = 370 + 1486.08 = 1856.1 kcal
    const lbm = calculateLBM(84.3, 18.4);
    expect(lbm).toBe(68.8);

    const katch = calculateKatchMcArdle({ weightKg: 84.3, bodyFatPct: 18.4 });
    expect(katch.lbmKg).toBe(68.8);
    expect(katch.tmbKcal).toBe(1856.1);
  });

  it('CA-2.1: Conmuta automáticamente a Katch-McArdle si hay % grasa o a Mifflin si está vacío', () => {
    // Con % grasa
    const conGrasa = resolveTMB({
      sex: 'male',
      weightKg: 84.3,
      heightCm: 179,
      ageYears: 31,
      bodyFatPct: 18.4,
    });
    expect(conGrasa.formulaUsed).toBe('katch_mcardle');
    expect(conGrasa.lbmKg).toBe(68.8);

    // Sin % grasa
    const sinGrasa = resolveTMB({
      sex: 'male',
      weightKg: 84.3,
      heightCm: 179,
      ageYears: 31,
      bodyFatPct: null,
    });
    expect(sinGrasa.formulaUsed).toBe('mifflin_st_jeor');
    expect(sinGrasa.lbmKg).toBeUndefined();
  });

  it('Calcula GETD aplicando Factor de Actividad Física (FAF)', () => {
    const getd = calculateGETD({ tmbKcal: 1845, activityFactor: 1.55 });
    // 1845 * 1.55 = 2859.75 -> 2860 kcal
    expect(getd).toBe(2860);
  });

  it('Enfuerza suelo calórico clínico (1200 kcal mujer, 1500 kcal hombre) si el déficit es agresivo', () => {
    // Mujer con GETD 1350 kcal con déficit del 20% = 1080 kcal -> Debe truncar a 1200 kcal
    const planMujer = calculateTargetCalories({
      getdKcal: 1350,
      goal: 'deficit_aggressive', // -20%
      sex: 'female',
    });
    expect(planMujer.targetKcal).toBe(1200);
    expect(planMujer.caloricFloorEnforced).toBe(true);
    expect(planMujer.clinicalSafetyWarning).toBeDefined();

    // Hombre con GETD 1700 kcal con déficit del 20% = 1360 kcal -> Debe truncar a 1500 kcal
    const planHombre = calculateTargetCalories({
      getdKcal: 1700,
      goal: 'deficit_aggressive',
      sex: 'male',
    });
    expect(planHombre.targetKcal).toBe(1500);
    expect(planHombre.caloricFloorEnforced).toBe(true);

    // Si el especialista desbloquea el candado manual
    const planOverride = calculateTargetCalories({
      getdKcal: 1700,
      goal: 'deficit_aggressive',
      sex: 'male',
      allowFloorOverride: true,
    });
    expect(planOverride.targetKcal).toBe(1360);
    expect(planOverride.caloricFloorEnforced).toBe(false);
  });
});

describe('Módulo 2: Motor Algorítmico - Peso Corregido por IMC & Macronutrientes', () => {
  it('Calcula IMC correctamente', () => {
    // 84.3 kg / (1.79m)^2 = 84.3 / 3.2041 = 26.3 kg/m^2
    const bmi = calculateBMI(84.3, 179);
    expect(bmi).toBe(26.3);
  });

  it('Si IMC >= 30, calcula PIS y Peso Ajustado (PA) para evitar sobreestimar proteína', () => {
    // Paciente de 115 kg y 175 cm -> IMC = 115 / (1.75^2) = 37.55 (Obesidad)
    // PIS = 25 * (1.75^2) = 25 * 3.0625 = 76.56 -> 76.6 kg
    // PA = 76.6 + 0.25 * (115 - 76.6) = 76.6 + 0.25 * 38.4 = 76.6 + 9.6 = 86.2 kg
    const analysis = analyzeBodyWeightForMacros(115, 175);
    expect(analysis.isObese).toBe(true);
    expect(analysis.bmi).toBe(37.6);
    expect(analysis.pisKg).toBe(76.6);
    expect(analysis.adjustedWeightKg).toBe(86.2);
    expect(analysis.referenceWeightKg).toBe(86.2);

    // Cálculo de proteína sobre 86.2 kg (en lugar de 115 kg): 86.2 * 1.8 = 155.16 -> 155.2g
    const macros = calculateMacronutrients({
      weightKg: 115,
      heightCm: 175,
      targetKcal: 2200,
      proteinRatioGKg: 1.8,
    });
    expect(macros.proteinG).toBe(155.2);
  });

  it('Alerta clínica si paciente con patología renal excede 2.0 g/kg de proteína', () => {
    const macros = calculateMacronutrients({
      weightKg: 80,
      heightCm: 180,
      targetKcal: 2500,
      proteinRatioGKg: 2.4,
      clinicalFlags: ['renal_pathology'],
    });
    expect(macros.clinicalProteinAlert).toBeDefined();
    expect(macros.clinicalProteinAlert).toContain('Alerta de Seguridad Renal');
  });
});

describe('Módulo 2: Motor Algorítmico - SMAE, Raciones y Filtro de Alérgenos', () => {
  it('CA-2.2: Excluye al 100% alimentos con alérgenos marcados', () => {
    // Paciente alérgico a gluten y lactosa
    const safeFoods = filterFoodsForPatient(DEFAULT_FOOD_CATALOG, ['gluten', 'lactose']);

    const hasGluten = safeFoods.some((f) => f.allergens.includes('gluten'));
    const hasLactose = safeFoods.some((f) => f.allergens.includes('lactose'));

    expect(hasGluten).toBe(false);
    expect(hasLactose).toBe(false);

    // Debe conservar alimentos seguros como pollo, arroz, frijoles, verduras
    const hasChicken = safeFoods.some((f) => f.id === 'f_aoa_1');
    const hasRice = safeFoods.some((f) => f.id === 'f_cer_2');
    expect(hasChicken).toBe(true);
    expect(hasRice).toBe(true);
  });

  it('CA-2.2: Cuadre calórico y de equivalentes dentro de la tolerancia (+-35 kcal y +-5g)', () => {
    const target = {
      targetKcal: 2430,
      proteinG: 165,
      fatG: 70,
      carbsG: 285,
    };

    const portions = solveSmaePortions(target);
    const totals = calculateSmaeTotals(portions);
    const tolerance = validateMacroTolerance(target, totals);

    // Tolerancia estricta del criterio de aceptación
    expect(Math.abs(tolerance.deltaKcal)).toBeLessThanOrEqual(35);
    expect(Math.abs(tolerance.deltaProt)).toBeLessThanOrEqual(5.5);
    expect(Math.abs(tolerance.deltaFat)).toBeLessThanOrEqual(5.5);
    expect(Math.abs(tolerance.deltaCarbs)).toBeLessThanOrEqual(6.0);
  });
});

describe('Módulo 2: Motor Algorítmico - Árbol de Decisión de Entrenamiento', () => {
  it('Asigna Split según días de entrenamiento (2-3: Full Body, 4: Torso/Pierna, 5-6: PPL)', () => {
    expect(determineSplitByDays(2)).toBe('full_body');
    expect(determineSplitByDays(3)).toBe('full_body');
    expect(determineSplitByDays(4)).toBe('upper_lower');
    expect(determineSplitByDays(5)).toBe('push_pull_legs');
    expect(determineSplitByDays(6)).toBe('push_pull_legs');
  });

  it('Descarta ejercicios que comprometan articulaciones lesionadas reportadas', () => {
    // Atleta con lesión de rodilla
    const safeKnee = filterSafeExercises(EXERCISE_DATABASE, ['gym'], ['knee_injury']);
    const hasKneeStress = safeKnee.some((e) => e.jointStressTags.includes('knee'));
    expect(hasKneeStress).toBe(false);

    // Debe contener el ejercicio seguro isométrico de cuádriceps
    const hasSafeExt = safeKnee.some((e) => e.id === 'ex_sq_safe');
    expect(hasSafeExt).toBe(true);
  });

  it('Genera rutina estructurada respetando equipo y banderas clínicas', () => {
    const { split, routine } = buildWorkoutRoutine({
      trainingDays: 4,
      equipment: ['dumbbells'],
      clinicalFlags: ['shoulder_injury'],
    });

    expect(split).toBe('upper_lower');
    expect(routine.length).toBe(4);

    // Comprobar que ningún ejercicio en los días de rutina tenga estrés en hombro
    for (const day of routine) {
      for (const ex of day.exercises) {
        expect(ex.jointStressTags).not.toContain('shoulder');
      }
    }
  });
});
