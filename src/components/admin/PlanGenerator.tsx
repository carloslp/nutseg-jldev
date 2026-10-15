'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClientProfile,
  BiometricLog,
  NutritionalPlan,
  GoalType,
  MealScheduleItem,
} from '@/lib/types/clinical';
import { calculateMifflinStJeor, calculateKatchMcArdle, calculateLBM } from '@/lib/engine/tmb';
import { calculateGETD, calculateTargetCalories, GOAL_ADJUSTMENT_MAP, CALORIC_FLOOR_BY_SEX } from '@/lib/engine/getd';
import { calculateBMI, analyzeBodyWeightForMacros, calculateMacronutrients } from '@/lib/engine/macros';
import {
  solveSmaePortions,
  calculateSmaeTotals,
  validateMacroTolerance,
  filterFoodsForPatient,
  buildMealSchedule,
  DEFAULT_FOOD_CATALOG,
} from '@/lib/engine/smae';
import { buildWorkoutRoutine } from '@/lib/engine/workout';

interface PlanGeneratorProps {
  client: ClientProfile;
  latestLog: BiometricLog;
  existingPlan?: NutritionalPlan | null;
}

export function PlanGenerator({ client, latestLog, existingPlan }: PlanGeneratorProps) {
  const router = useRouter();

  // State: Formula selection
  const hasBodyFat = Boolean(latestLog.bodyFatPct && latestLog.bodyFatPct > 0);
  const [selectedFormula, setSelectedFormula] = useState<'mifflin_st_jeor' | 'katch_mcardle'>(
    existingPlan?.formulaUsed || (hasBodyFat ? 'katch_mcardle' : 'mifflin_st_jeor')
  );

  // State: Goal and adjustments
  const [goal, setGoal] = useState<GoalType>(existingPlan?.goal || 'deficit_moderate');
  const [customKcal, setCustomKcal] = useState<number>(existingPlan?.targetKcal || 2431);
  const [isCustomKcal, setIsCustomKcal] = useState<boolean>(existingPlan?.goal === 'custom');
  const [allowFloorOverride, setAllowFloorOverride] = useState<boolean>(existingPlan?.caloricFloorOverride || false);

  // State: Macronutrient ratios
  const [proteinRatio, setProteinRatio] = useState<number>(existingPlan?.proteinRatioGKg || 1.95);
  const [fatRatio, setFatRatio] = useState<number>(existingPlan?.fatRatioGKg || 0.85);

  // State: Meal schedule
  const [mealCount, setMealCount] = useState<number>(existingPlan?.mealCount || 4);

  // State: Saving
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Derived: Weight and Age
  const birthYear = new Date(client.birthDate).getFullYear();
  const ageYears = new Date().getFullYear() - birthYear;
  const weightKg = latestLog.weightKg;
  const heightCm = client.heightCm;
  const bodyFatPct = latestLog.bodyFatPct || 18.0;
  const faf = latestLog.activityFactor || 1.55;

  // 1. TMB calculation
  const lbmKg = useMemo(() => calculateLBM(weightKg, bodyFatPct), [weightKg, bodyFatPct]);
  const tmbMifflin = useMemo(
    () => calculateMifflinStJeor({ sex: client.sex, weightKg, heightCm, ageYears }),
    [client.sex, weightKg, heightCm, ageYears]
  );
  const tmbKatch = useMemo(
    () => calculateKatchMcArdle({ weightKg, bodyFatPct }),
    [weightKg, bodyFatPct]
  );

  const tmbKcal = selectedFormula === 'katch_mcardle' ? tmbKatch.tmbKcal : tmbMifflin;

  // 2. GETD calculation
  const getdKcal = useMemo(() => calculateGETD({ tmbKcal, activityFactor: faf }), [tmbKcal, faf]);

  // 3. Caloric Target & Safety Floor
  const caloricResult = useMemo(() => {
    if (isCustomKcal) {
      const floorMin = CALORIC_FLOOR_BY_SEX[client.sex];
      return {
        getdKcal,
        targetKcal: customKcal,
        goalAdjustmentPct: Math.round(((customKcal - getdKcal) / getdKcal) * 100),
        caloricFloorMin: floorMin,
        caloricFloorEnforced: !allowFloorOverride && customKcal < floorMin,
        clinicalSafetyWarning:
          customKcal < floorMin
            ? allowFloorOverride
              ? 'Suelo calórico desbloqueado manualmente por el especialista.'
              : `Ajuste truncado al suelo calórico mínimo de ${floorMin} kcal.`
            : undefined,
      };
    }
    return calculateTargetCalories({
      getdKcal,
      goal,
      sex: client.sex,
      allowFloorOverride,
    });
  }, [getdKcal, isCustomKcal, customKcal, goal, client.sex, allowFloorOverride]);

  const targetKcal = caloricResult.targetKcal;

  // 4. Macronutrients (with Obesity PIS/PA logic and clinical flags)
  const macroResult = useMemo(() => {
    return calculateMacronutrients({
      weightKg,
      heightCm,
      targetKcal,
      proteinRatioGKg: proteinRatio,
      fatRatioGKg: fatRatio,
      clinicalFlags: client.clinicalFlags,
    });
  }, [weightKg, heightCm, targetKcal, proteinRatio, fatRatio, client.clinicalFlags]);

  // 5. SMAE Portions and Meal Schedule
  const safeCatalog = useMemo(
    () => filterFoodsForPatient(DEFAULT_FOOD_CATALOG, client.allergies),
    [client.allergies]
  );

  const smaePortions = useMemo(() => {
    return solveSmaePortions({
      targetKcal,
      proteinG: macroResult.proteinG,
      fatG: macroResult.fatG,
      carbsG: macroResult.carbsG,
    });
  }, [targetKcal, macroResult]);

  const smaeTotals = useMemo(() => calculateSmaeTotals(smaePortions), [smaePortions]);
  const tolerance = useMemo(
    () =>
      validateMacroTolerance(
        {
          targetKcal,
          proteinG: macroResult.proteinG,
          fatG: macroResult.fatG,
          carbsG: macroResult.carbsG,
        },
        smaeTotals
      ),
    [targetKcal, macroResult, smaeTotals]
  );

  const mealSchedule: MealScheduleItem[] = useMemo(() => {
    return buildMealSchedule(smaePortions, mealCount, safeCatalog);
  }, [smaePortions, mealCount, safeCatalog]);

  // 6. Workout Routine based on Days, Equipment & Joint Injuries
  const workoutResult = useMemo(() => {
    return buildWorkoutRoutine({
      trainingDays: latestLog.trainingDays || 4,
      equipment: latestLog.equipmentAvailable || ['gym'],
      clinicalFlags: client.clinicalFlags,
    });
  }, [latestLog.trainingDays, latestLog.equipmentAvailable, client.clinicalFlags]);

  // Handle Save / Publish Plan
  const handlePublishPlan = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const planPayload: NutritionalPlan = {
        id: existingPlan?.id || crypto.randomUUID(),
        clientId: client.id,
        biometricLogId: latestLog.id,
        formulaUsed: selectedFormula,
        lbmKg: selectedFormula === 'katch_mcardle' ? lbmKg : null,
        tmbKcal,
        getdKcal,
        goal,
        goalAdjustmentPct: caloricResult.goalAdjustmentPct,
        targetKcal,
        caloricFloorMin: caloricResult.caloricFloorMin,
        caloricFloorOverride: allowFloorOverride,
        bmi: macroResult.bmi,
        isObese: macroResult.isObese,
        adjustedWeightKg: macroResult.adjustedWeightKg,
        proteinG: macroResult.proteinG,
        proteinRatioGKg: proteinRatio,
        fatG: macroResult.fatG,
        fatRatioGKg: fatRatio,
        carbsG: macroResult.carbsG,
        mealCount,
        hydrationMl: Math.round(targetKcal * 1.3),
        workoutSplit: workoutResult.split,
        workoutStructure: workoutResult.routine,
        mealStructure: mealSchedule,
        clinicalAlertNotes: macroResult.clinicalProteinAlert || caloricResult.clinicalSafetyWarning || null,
        isPublished: true,
        createdAt: new Date().toISOString(),
      };

      const res = await fetch('/api/admin/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planPayload }),
      });

      if (!res.ok) throw new Error('Error al guardar el plan');

      setSaveSuccess(true);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error al guardar el plan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Context */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-display font-bold text-lg shadow-sm">
            {client.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-xl text-on-surface">{client.fullName}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-primary text-xs font-mono font-medium">
                #BIO-9942
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-on-surface-variant mt-1">
              <span>Peso: <strong className="text-on-surface">{weightKg} kg</strong></span>
              <span>Talla: <strong className="text-on-surface">{heightCm} cm</strong></span>
              <span>IMC: <strong className="text-on-surface">{macroResult.bmi}</strong></span>
              {hasBodyFat && <span>% Grasa: <strong className="text-on-surface">{bodyFatPct}%</strong></span>}
              <span>MLG: <strong className="text-on-surface">{lbmKg} kg</strong></span>
            </div>
          </div>
        </div>

        <button
          onClick={handlePublishPlan}
          disabled={isSaving}
          className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-medium text-xs transition-all shadow-sm flex items-center gap-2 active:scale-[0.98] disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
          <span>{isSaving ? 'Publicando en permalink...' : 'Publicar Plan en Permalink'}</span>
        </button>
      </section>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
            <span>¡Plan nutricional y rutina publicados exitosamente en el permalink del paciente!</span>
          </div>
          <button
            onClick={() => router.push(`/admin/pacientes/${client.id}/permalink`)}
            className="text-xs font-bold text-emerald-700 underline"
          >
            Ver Permalink
          </button>
        </div>
      )}

      {/* 2. Clinical Medical Warning Banner */}
      {macroResult.clinicalProteinAlert && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-700 text-[22px] shrink-0">shield_with_heart</span>
          <div className="text-xs text-amber-900">
            <strong className="font-bold block uppercase tracking-wider text-amber-950">
              Restricción Clínica Activa
            </strong>
            <p className="mt-0.5">{macroResult.clinicalProteinAlert}</p>
          </div>
        </div>
      )}

      {/* 3. Telemetría Metabólica & Fórmulas (TMB / GETD / Suelo) */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[24px]">developer_board</span>
            <h3 className="font-display font-semibold text-base text-on-surface">Motor de Telemetría Metabólica</h3>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-bold">
              v2.4 Algorítmico
            </span>
          </div>

          {/* Formula Switcher (CA-2.1) */}
          <div className="flex items-center bg-surface-container-low p-1 rounded-xl">
            <button
              onClick={() => setSelectedFormula('katch_mcardle')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedFormula === 'katch_mcardle'
                  ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${selectedFormula === 'katch_mcardle' ? 'bg-primary' : 'bg-outline-variant'}`}></span>
              <span>Katch-McArdle (MLG: {lbmKg} kg)</span>
            </button>
            <button
              onClick={() => setSelectedFormula('mifflin_st_jeor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedFormula === 'mifflin_st_jeor'
                  ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${selectedFormula === 'mifflin_st_jeor' ? 'bg-primary' : 'bg-outline-variant'}`}></span>
              <span>Mifflin-St Jeor</span>
            </button>
          </div>
        </div>

        {/* Telemetry Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-surface-container-low rounded-xl flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
              TMB Base Calculada
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-bold font-mono text-on-surface">{tmbKcal}</span>
              <span className="text-xs text-on-surface-variant">kcal/d</span>
            </div>
            <span className="text-[10px] text-outline font-mono">
              {selectedFormula === 'katch_mcardle' ? `370 + (21.6 × ${lbmKg}kg MLG)` : 'Fórmula Mifflin por Sexo/Talla'}
            </span>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
              Factor FAF Aplicado
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-bold font-mono text-primary">{faf}</span>
              <span className="text-xs text-primary font-medium">Activo</span>
            </div>
            <span className="text-[10px] text-outline">
              {latestLog.trainingDays || 4} días fuerza + NEAT moderado
            </span>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
              GETD Teórico (TDEE)
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-bold font-mono text-on-surface">{getdKcal}</span>
              <span className="text-xs text-on-surface-variant">kcal/d</span>
            </div>
            <span className="text-[10px] text-outline font-mono">Gasto Energético Diario Total</span>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
              Suelo Calórico Clínico
            </span>
            <div className="flex items-center gap-1.5 my-1">
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">verified_user</span>
                <span>Mín {caloricResult.caloricFloorMin} kcal</span>
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 font-medium">
              Margen seguro: +{Math.max(0, targetKcal - caloricResult.caloricFloorMin)} kcal
            </span>
          </div>
        </div>

        {/* Goal Selector Controls */}
        <div className="p-4 bg-surface-container-low rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-on-surface block">Objetivo Calórico Parametrizable:</span>
            <span className="text-[11px] text-on-surface-variant">Selecciona el ajuste o ingresa una meta manual</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => {
                setGoal('deficit_moderate');
                setIsCustomKcal(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                goal === 'deficit_moderate' && !isCustomKcal
                  ? 'bg-rose-700 text-white shadow-sm font-semibold'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Déficit -15%
            </button>
            <button
              onClick={() => {
                setGoal('deficit_aggressive');
                setIsCustomKcal(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                goal === 'deficit_aggressive' && !isCustomKcal
                  ? 'bg-rose-800 text-white shadow-sm font-semibold'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Déficit -20%
            </button>
            <button
              onClick={() => {
                setGoal('maintenance');
                setIsCustomKcal(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                goal === 'maintenance' && !isCustomKcal
                  ? 'bg-primary text-on-primary shadow-sm font-semibold'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Mantenimiento 0%
            </button>
            <button
              onClick={() => {
                setGoal('surplus_lean');
                setIsCustomKcal(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                goal === 'surplus_lean' && !isCustomKcal
                  ? 'bg-secondary text-on-secondary shadow-sm font-semibold'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Superávit +10%
            </button>
          </div>
        </div>
      </section>

      {/* 4. Reparto de Macronutrientes (Proteína, Grasas, Carbohidratos) */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
          <div>
            <h3 className="font-display font-semibold text-base text-on-surface">Distribución de Macronutrientes</h3>
            <p className="text-xs text-on-surface-variant">
              Meta energética objetivo:{' '}
              <strong className="text-primary font-mono text-sm">{targetKcal} kcal/día</strong>
              {macroResult.isObese && (
                <span className="ml-2 text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px] font-medium">
                  Proteína calculada sobre Peso Ajustado ({macroResult.adjustedWeightKg} kg)
                </span>
              )}
            </p>
          </div>

          {/* Steppers for Specialist Override (CA-2.3) */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-on-surface">Proteína:</label>
              <div className="flex items-center bg-surface-container-low rounded-lg p-0.5 border border-outline-variant/30">
                <button
                  onClick={() => setProteinRatio((p) => Math.max(1.2, Math.round((p - 0.05) * 100) / 100))}
                  className="w-6 h-6 flex items-center justify-center text-xs font-bold text-on-surface hover:bg-surface-container rounded"
                >
                  -
                </button>
                <span className="px-2 text-xs font-mono font-semibold">{proteinRatio} g/kg</span>
                <button
                  onClick={() => setProteinRatio((p) => Math.min(2.5, Math.round((p + 0.05) * 100) / 100))}
                  className="w-6 h-6 flex items-center justify-center text-xs font-bold text-on-surface hover:bg-surface-container rounded"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-on-surface">Grasas:</label>
              <div className="flex items-center bg-surface-container-low rounded-lg p-0.5 border border-outline-variant/30">
                <button
                  onClick={() => setFatRatio((f) => Math.max(0.6, Math.round((f - 0.05) * 100) / 100))}
                  className="w-6 h-6 flex items-center justify-center text-xs font-bold text-on-surface hover:bg-surface-container rounded"
                >
                  -
                </button>
                <span className="px-2 text-xs font-mono font-semibold">{fatRatio} g/kg</span>
                <button
                  onClick={() => setFatRatio((f) => Math.min(1.5, Math.round((f + 0.05) * 100) / 100))}
                  className="w-6 h-6 flex items-center justify-center text-xs font-bold text-on-surface hover:bg-surface-container rounded"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Macro Bars and Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-blue-900">Proteína ({macroResult.proteinPct}%)</span>
              <span className="text-[11px] font-mono text-blue-700">{proteinRatio} g/kg</span>
            </div>
            <div className="my-2">
              <span className="text-2xl font-bold font-mono text-blue-950">{macroResult.proteinG}g</span>
              <span className="text-xs text-blue-700 ml-1.5 font-mono">({macroResult.proteinKcal} kcal)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-blue-200 overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${macroResult.proteinPct}%` }}></div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-900">Grasas Lipídicas ({macroResult.fatPct}%)</span>
              <span className="text-[11px] font-mono text-emerald-700">{fatRatio} g/kg</span>
            </div>
            <div className="my-2">
              <span className="text-2xl font-bold font-mono text-emerald-950">{macroResult.fatG}g</span>
              <span className="text-xs text-emerald-700 ml-1.5 font-mono">({macroResult.fatKcal} kcal)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-emerald-200 overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${macroResult.fatPct}%` }}></div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-900">Carbohidratos ({macroResult.carbsPct}%)</span>
              <span className="text-[11px] font-mono text-amber-700">Residual</span>
            </div>
            <div className="my-2">
              <span className="text-2xl font-bold font-mono text-amber-950">{macroResult.carbsG}g</span>
              <span className="text-xs text-amber-700 ml-1.5 font-mono">({macroResult.carbsKcal} kcal)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-amber-200 overflow-hidden">
              <div className="h-full bg-amber-600 rounded-full" style={{ width: `${macroResult.carbsPct}%` }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Tabla de Equivalentes SMAE & Tiempos de Comida (CA-2.2) */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-semibold text-base text-on-surface">
                Menú y Distribución de Raciones SMAE
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold flex items-center gap-1 ${
                  tolerance.isValid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {tolerance.isValid ? 'check_circle' : 'warning'}
                </span>
                <span>
                  Cuadre SMAE: {tolerance.deltaKcal > 0 ? `+${tolerance.deltaKcal}` : tolerance.deltaKcal} kcal (
                  {tolerance.isValid ? 'Dentro de tolerancia ±35 kcal' : 'Revisar porciones'})
                </span>
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              {client.allergies.length > 0 ? `Excluyendo alérgenos: ${client.allergies.join(', ')}` : 'Catálogo 100% seguro sin alérgenos reportados'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-on-surface">Tiempos de Comida:</label>
            <select
              value={mealCount}
              onChange={(e) => setMealCount(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 bg-surface-container-low border border-outline-variant/30 rounded-lg text-xs font-medium text-on-surface"
            >
              <option value="3">3 Tiempos (Desayuno, Comida, Cena)</option>
              <option value="4">4 Tiempos (+ 1 Colación)</option>
              <option value="5">5 Tiempos (+ 2 Colaciones)</option>
            </select>
          </div>
        </div>

        {/* Meal Times Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mealSchedule.map((meal) => (
            <div
              key={meal.id}
              className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-primary text-on-primary text-xs font-bold flex items-center justify-center">
                      {meal.mealNumber}
                    </span>
                    <h4 className="font-semibold text-sm text-on-surface">{meal.name}</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-primary">{meal.totalKcal} kcal</span>
                </div>

                <div className="mt-3 space-y-2">
                  {meal.portions.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-outline-variant/10">
                      <div>
                        <strong className="text-on-surface block font-medium">{p.suggestedFood}</strong>
                        <span className="text-[11px] text-on-surface-variant">
                          {p.groupName} • {p.portions} porc. ({p.gramsNet}g)
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-[11px] font-mono text-on-surface-variant">
                        {p.portionUnit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-outline-variant/20 flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
                <span>P: <strong className="text-blue-900">{meal.proteinG}g</strong></span>
                <span>G: <strong className="text-emerald-900">{meal.fatG}g</strong></span>
                <span>C: <strong className="text-amber-900">{meal.carbsG}g</strong></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Árbol de Decisión de Entrenamiento */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[24px]">fitness_center</span>
              <h3 className="font-display font-semibold text-base text-on-surface">
                Rutina & Periodización Adaptada
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-semibold uppercase">
                Split: {workoutResult.split.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Frecuencia: {latestLog.trainingDays || 4} días/semana • Articulaciones protegidas:{' '}
              {client.clinicalFlags.filter((f) => f.includes('injury')).join(', ') || 'Ninguna contraindicación'}
            </p>
          </div>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workoutResult.routine.map((day, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-3">
              <div className="border-b border-outline-variant/20 pb-2">
                <span className="font-semibold text-sm text-on-surface block">{day.dayName}</span>
                <span className="text-[11px] text-on-surface-variant">{day.focus}</span>
              </div>

              <div className="space-y-2">
                {day.exercises.map((ex) => (
                  <div key={ex.id} className="p-2.5 rounded-xl bg-surface-container-lowest text-xs flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-on-surface font-semibold">{ex.name}</strong>
                      <span className="text-[11px] font-mono font-medium text-secondary">
                        {ex.sets} series × {ex.reps}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant">{ex.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
