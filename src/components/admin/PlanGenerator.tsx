'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  PortionAllocation,
  SMAE_GROUP_STANDARDS,
} from '@/lib/engine/smae';
import { buildWorkoutRoutine } from '@/lib/engine/workout';
import { MacroDonutChart } from './MacroDonutChart';
import { SmaeTechnicalMatrix } from './SmaeTechnicalMatrix';
import { StickyPlanDock } from './StickyPlanDock';

interface PlanGeneratorProps {
  client: ClientProfile;
  latestLog: BiometricLog;
  existingPlan?: NutritionalPlan | null;
  pastPlans?: NutritionalPlan[];
  permalinkSlug?: string;
}

export function PlanGenerator({
  client,
  latestLog,
  existingPlan,
  pastPlans = [],
  permalinkSlug,
}: PlanGeneratorProps) {
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
  const [currentSlug, setCurrentSlug] = useState<string | undefined>(permalinkSlug);
  const [showHistory, setShowHistory] = useState(false);

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
  }, [getdKcal, goal, isCustomKcal, customKcal, client.sex, allowFloorOverride]);

  const targetKcal = caloricResult.targetKcal;

  // 4. Macronutrients distribution
  const macroResult = useMemo(() => {
    return calculateMacronutrients({
      targetKcal,
      weightKg,
      heightCm,
      clinicalFlags: client.clinicalFlags,
      proteinRatioGKg: proteinRatio,
      fatRatioGKg: fatRatio,
    });
  }, [targetKcal, weightKg, heightCm, client.clinicalFlags, proteinRatio, fatRatio]);

  // 5. SMAE Solver & Allergen Exclusion
  const safeCatalog = useMemo(() => {
    return filterFoodsForPatient(DEFAULT_FOOD_CATALOG, client.allergies);
  }, [client.allergies]);

  const smaePortions = useMemo(() => {
    return solveSmaePortions({
      targetKcal,
      proteinG: macroResult.proteinG,
      fatG: macroResult.fatG,
      carbsG: macroResult.carbsG,
    });
  }, [targetKcal, macroResult]);

  const [activeSchedule, setActiveSchedule] = useState<MealScheduleItem[]>(() => {
    if (existingPlan?.mealStructure && existingPlan.mealStructure.length > 0) {
      return existingPlan.mealStructure;
    }
    return buildMealSchedule(smaePortions, mealCount, safeCatalog);
  });

  // Re-generate meal schedule when meal count or portions change significantly
  useEffect(() => {
    if (!existingPlan?.mealStructure || existingPlan.mealStructure.length === 0) {
      setActiveSchedule(buildMealSchedule(smaePortions, mealCount, safeCatalog));
    }
  }, [smaePortions, mealCount, safeCatalog]);

  const handlePortionDelta = (
    mealIndex: number,
    group: keyof PortionAllocation,
    delta: number
  ) => {
    setActiveSchedule((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as MealScheduleItem[];
      const meal = copy[mealIndex];
      if (!meal) return prev;

      let portion = meal.portions.find((p) => p.group === group);
      if (!portion && delta > 0) {
        const std = SMAE_GROUP_STANDARDS[group];
        portion = {
          group,
          groupName: std?.name || group,
          portions: 0,
          suggestedFood: std?.name || group,
          portionUnit: 'porción',
          gramsNet: 100,
        };
        meal.portions.push(portion);
      }

      if (portion) {
        portion.portions = Math.max(0, Math.round((portion.portions + delta) * 10) / 10);
        if (portion.portions === 0) {
          meal.portions = meal.portions.filter((p) => p.group !== group);
        }
      }

      // Recalculate meal macros
      const mealPortionAlloc: PortionAllocation = {
        aoa: 0,
        cereals: 0,
        legumes: 0,
        vegetables: 0,
        fruits: 0,
        fats: 0,
        milk: 0,
      };
      meal.portions.forEach((p) => {
        if (mealPortionAlloc[p.group] !== undefined) {
          mealPortionAlloc[p.group] += p.portions;
        }
      });
      const totals = calculateSmaeTotals(mealPortionAlloc);
      meal.totalKcal = totals.kcal;
      meal.proteinG = totals.proteinG;
      meal.fatG = totals.fatG;
      meal.carbsG = totals.carbsG;

      return copy;
    });
  };

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
        id: crypto.randomUUID(),
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
        mealStructure: activeSchedule,
        hydrationMl: Math.round(weightKg * 35),
        workoutSplit: workoutResult.split,
        workoutStructure: workoutResult.routine,
        clinicalAlertNotes: macroResult.clinicalProteinAlert,
        isPublished: true,
        createdAt: new Date().toISOString(),
      };

      const res = await fetch('/api/admin/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planPayload }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar el plan');

      if (data.permalinkSlug) {
        setCurrentSlug(data.permalinkSlug);
      }

      setSaveSuccess(true);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error al guardar el plan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* 1. Header Context */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-display font-bold text-lg shadow-sm">
            {client.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-xl text-on-surface">{client.fullName}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-primary text-xs font-mono font-medium">
                ID: #{client.id.slice(0, 8)}
              </span>
              {pastPlans.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface text-[11px] font-semibold transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">history</span>
                  <span>{pastPlans.length} planes previos</span>
                </button>
              )}
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
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
          <span>{isSaving ? 'Publicando...' : 'Publicar Plan en Permalink'}</span>
        </button>
      </section>

      {/* History Drawer if toggled */}
      {showHistory && pastPlans.length > 0 && (
        <section className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/15">
            <h3 className="font-display font-bold text-sm text-on-surface">Historial de Planes Nutricionales</h3>
            <button
              onClick={() => setShowHistory(false)}
              className="text-on-surface-variant hover:text-on-surface text-xs font-semibold"
            >
              Cerrar
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {pastPlans.map((p, idx) => (
              <div
                key={p.id}
                className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/20 flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-on-surface">
                    Plan #{pastPlans.length - idx}
                  </span>
                  <span className="text-[10px] font-mono text-on-surface-variant">
                    {p.createdAt.split('T')[0]}
                  </span>
                </div>
                <div className="text-xs">
                  <p className="font-mono font-bold text-primary">{p.targetKcal} kcal</p>
                  <p className="text-[11px] text-on-surface-variant capitalize">{p.goal.replace(/_/g, ' ')}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-on-surface-variant pt-1 border-t border-outline-variant/10">
                  <span>{p.proteinG}P</span> / <span>{p.fatG}G</span> / <span>{p.carbsG}C</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
            <span>¡Plan nutricional y rutina publicados exitosamente en el permalink del paciente!</span>
          </div>
          {currentSlug && (
            <button
              onClick={() => router.push(`/admin/pacientes/${client.id}/permalink`)}
              className="text-xs font-bold text-emerald-700 underline"
            >
              Ver Permalink & WhatsApp
            </button>
          )}
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
      <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-xs flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[24px]">developer_board</span>
            <h3 className="font-display font-semibold text-base text-on-surface">Motor de Telemetría Metabólica</h3>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-bold">
              v2.4 Algorítmico
            </span>
          </div>

          {/* Formula Switcher */}
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

      {/* 4. Reparto de Macronutrientes & Donut Chart Split Grid */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-xs flex flex-col gap-5">
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

          {/* Steppers for Specialist Override */}
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

        {/* Macro Bars & Donut Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-teal-900">Proteína ({macroResult.proteinPct}%)</span>
                <span className="text-[11px] font-mono text-teal-700">{proteinRatio} g/kg</span>
              </div>
              <div className="my-2">
                <span className="text-2xl font-bold font-mono text-teal-950">{macroResult.proteinG}g</span>
                <span className="text-xs text-teal-700 ml-1.5 font-mono">({macroResult.proteinKcal} kcal)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-teal-200 overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full" style={{ width: `${macroResult.proteinPct}%` }}></div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-900">Grasas ({macroResult.fatPct}%)</span>
                <span className="text-[11px] font-mono text-amber-700">{fatRatio} g/kg</span>
              </div>
              <div className="my-2">
                <span className="text-2xl font-bold font-mono text-amber-950">{macroResult.fatG}g</span>
                <span className="text-xs text-amber-700 ml-1.5 font-mono">({macroResult.fatKcal} kcal)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-amber-200 overflow-hidden">
                <div className="h-full bg-amber-600 rounded-full" style={{ width: `${macroResult.fatPct}%` }}></div>
              </div>
            </div>

            <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-sky-900">Carbohidratos ({macroResult.carbsPct}%)</span>
                <span className="text-[11px] font-mono text-sky-700">Residual</span>
              </div>
              <div className="my-2">
                <span className="text-2xl font-bold font-mono text-sky-950">{macroResult.carbsG}g</span>
                <span className="text-xs text-sky-700 ml-1.5 font-mono">({macroResult.carbsKcal} kcal)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-sky-200 overflow-hidden">
                <div className="h-full bg-sky-600 rounded-full" style={{ width: `${macroResult.carbsPct}%` }}></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <MacroDonutChart
              targetKcal={targetKcal}
              proteinG={macroResult.proteinG}
              fatG={macroResult.fatG}
              carbsG={macroResult.carbsG}
            />
          </div>
        </div>
      </section>

      {/* 5. Matriz Técnica SMAE */}
      <SmaeTechnicalMatrix
        schedule={activeSchedule}
        targetAllocation={smaePortions}
        onPortionChange={handlePortionDelta}
      />

      {/* 6. Menú y Distribución de Raciones por Tiempo de Comida */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-xs flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
          <div>
            <h3 className="font-display font-semibold text-base text-on-surface">
              Menú Desglosado por Tiempos de Comida
            </h3>
            <p className="text-xs text-on-surface-variant">
              Porciones equivalentes y platillos sugeridos libres de alérgenos
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-on-surface">Tiempos:</span>
            <div className="flex bg-surface-container-low p-1 rounded-xl">
              {[3, 4, 5].map((count) => (
                <button
                  key={count}
                  onClick={() => setMealCount(count)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    mealCount === count
                      ? 'bg-primary text-on-primary font-semibold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {count} comidas
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeSchedule.map((meal) => (
            <div
              key={meal.id}
              className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-on-surface">{meal.name}</h4>
                  <span className="text-xs font-mono font-bold text-primary">
                    {meal.totalKcal} kcal
                  </span>
                </div>

                <div className="space-y-1.5">
                  {meal.portions.map((portion) => (
                    <div
                      key={portion.group}
                      className="flex items-center justify-between text-xs py-1 border-b border-outline-variant/10"
                    >
                      <span className="text-on-surface">
                        <strong className="font-semibold text-primary">{portion.portions}x</strong>{' '}
                        {portion.suggestedFood}
                      </span>
                      <span className="font-mono text-[11px] text-on-surface-variant">
                        {portion.portionUnit} ({portion.gramsNet * portion.portions}g)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant pt-2 border-t border-outline-variant/15">
                <span>P: {meal.proteinG}g</span>
                <span>G: {meal.fatG}g</span>
                <span>C: {meal.carbsG}g</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Bottom Dock */}
      <StickyPlanDock
        clientId={client.id}
        targetKcal={targetKcal}
        proteinG={macroResult.proteinG}
        fatG={macroResult.fatG}
        carbsG={macroResult.carbsG}
        isSaving={isSaving}
        onSave={handlePublishPlan}
        permalinkSlug={currentSlug}
      />
    </div>
  );
}
