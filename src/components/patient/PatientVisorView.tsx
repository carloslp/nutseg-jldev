'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClientProfile,
  NutritionalPlan,
  PermalinkRecord,
  BiometricLog,
  FoodCatalogItem,
  SmaeMealPortion,
} from '@/lib/types/clinical';

interface PatientVisorViewProps {
  client: ClientProfile;
  plan: NutritionalPlan;
  permalink: PermalinkRecord;
  biometricLogs?: BiometricLog[];
  foodCatalog?: FoodCatalogItem[];
}

export function PatientVisorView({
  client,
  plan,
  permalink,
  biometricLogs = [],
  foodCatalog = [],
}: PatientVisorViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'nutrition' | 'workout' | 'progress'>('nutrition');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedEquivalentPortion, setSelectedEquivalentPortion] = useState<SmaeMealPortion | null>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch(`/api/plan/${permalink.slugToken}/logout`, { method: 'POST' });
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  };

  const firstName = client.fullName.split(' ')[0];

  // Latest and initial biometric logs for progress calculation
  const latestLog = biometricLogs[0];
  const initialLog = biometricLogs[biometricLogs.length - 1];

  const currentWeight = latestLog ? latestLog.weightKg : (plan.proteinRatioGKg ? Math.round(plan.proteinG / plan.proteinRatioGKg) : 70);
  const weightDelta = (latestLog && initialLog && biometricLogs.length > 1)
    ? Number((latestLog.weightKg - initialLog.weightKg).toFixed(1))
    : null;
  const waistDelta = (latestLog?.waistCm && initialLog?.waistCm && biometricLogs.length > 1)
    ? Number((latestLog.waistCm - initialLog.waistCm).toFixed(1))
    : null;

  // Hydration target: 35 ml/kg weight
  const recommendedHydrationMl = plan.hydrationMl || Math.round(currentWeight * 35);

  // Group alternatives for selected equivalent portion
  const equivalentAlternatives = selectedEquivalentPortion
    ? foodCatalog.filter((f) => {
        const matchesGroup =
          selectedEquivalentPortion.groupName.toLowerCase().includes(f.smaeGroup.toLowerCase()) ||
          f.smaeGroup.toLowerCase().includes(selectedEquivalentPortion.groupName.toLowerCase()) ||
          f.smaeGroup.toLowerCase().includes(selectedEquivalentPortion.group.toLowerCase());
        return matchesGroup && f.isActive;
      })
    : [];

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans text-on-surface">
      {/* 1. Mobile Top Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 px-4 h-14 flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container text-primary text-[11px] font-semibold">
            <span className="material-symbols-outlined text-[13px]">lock</span>
            <span>Acceso Seguro</span>
          </div>
          <div className="h-3.5 w-px bg-outline-variant/40"></div>
          <span className="text-xs font-semibold text-on-surface truncate max-w-[140px]">
            {client.fullName}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all"
            title="Descargar o imprimir PDF"
          >
            <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
            <span>Imprimir / PDF</span>
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            title="Cerrar sesión"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </header>

      {/* Print-only Clinical Header */}
      <div className="hidden print:block p-6 border-b-2 border-primary mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-gray-900">BioMetrix Pro • Plan Nutricional & Deportivo</h1>
            <p className="text-xs text-gray-600 mt-1">
              Paciente: <strong className="text-black">{client.fullName}</strong> | Fecha: {new Date(plan.createdAt).toLocaleDateString('es-MX')}
            </p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <span>Objetivo: {plan.goal.replace(/_/g, ' ')}</span>
            <div className="font-mono text-primary font-bold text-sm mt-0.5">{plan.targetKcal} kcal/día</div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 flex flex-col gap-5 pb-24 print:max-w-none print:p-0 print:pb-0">
        {/* 2. Saludo Personalizado & Status (oculto en print secundario si se prefiere) */}
        <section className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm flex items-start justify-between gap-3 no-print">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
              Plan Clínico Personalizado
            </span>
            <h2 className="font-display text-2xl font-bold text-on-surface mt-0.5">
              ¡Hola, {firstName}! 👋
            </h2>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Tu plan <strong className="text-on-surface font-semibold">{plan.name || 'Personalizado'}</strong> está activo y supervisado por tu especialista.
            </p>
            {client.allergies && client.allergies.length > 0 && (
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                <span>Filtro de alérgenos activo: {client.allergies.join(', ')}</span>
              </div>
            )}
          </div>

          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary font-bold text-base flex items-center justify-center shrink-0 border border-primary/20">
            {firstName[0]}
          </div>
        </section>

        {/* 3. Navigation Tab Switcher (3 Tabs: Dieta, Rutina, Progreso) */}
        <div className="flex bg-surface-container-low p-1 rounded-xl no-print">
          <button
            onClick={() => setActiveTab('nutrition')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'nutrition'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">restaurant</span>
            <span>Mi Dieta</span>
          </button>
          <button
            onClick={() => setActiveTab('workout')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'workout'
                ? 'bg-surface-container-lowest text-secondary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">fitness_center</span>
            <span>Mi Rutina</span>
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'progress'
                ? 'bg-surface-container-lowest text-emerald-700 shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>Mi Progreso</span>
          </button>
        </div>

        {/* --- TAB 1: NUTRICIÓN --- */}
        {(activeTab === 'nutrition' || typeof window === 'undefined') && (
          <div className="flex flex-col gap-5 print:flex">
            {/* Target Card with Radial / Macro Highlight */}
            <section className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">nutrition</span>
                  <h3 className="font-display font-semibold text-base text-on-surface">Metas Nutricionales Diarias</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold uppercase">
                  {plan.goal.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Radial Highlight Banner */}
              <div className="p-4 rounded-xl bg-surface-container-low flex items-center gap-4">
                <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
                  <svg className="w-18 h-18 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-surface-container-high"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.2"
                    ></path>
                    <path
                      className="text-primary"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="85, 100"
                      strokeLinecap="round"
                      strokeWidth="3.2"
                    ></path>
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="material-symbols-outlined text-primary text-[18px]">local_fire_department</span>
                    <span className="text-[9px] text-outline font-bold leading-none">META</span>
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold font-mono text-on-surface tracking-tight">
                      {plan.targetKcal}
                    </span>
                    <span className="text-xs font-semibold text-on-surface-variant">kcal / día</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium mt-0.5">
                    Gasto estimado: {plan.getdKcal || plan.tdeeKcal} kcal | Suelo mín: {plan.caloricFloorMin} kcal
                  </span>
                </div>
              </div>

              {/* Macros Segmented Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-blue-900 font-semibold">Proteína: {plan.proteinG}g</span>
                  <span className="text-emerald-900 font-semibold">Grasas: {plan.fatG}g</span>
                  <span className="text-amber-900 font-semibold">Carbs: {plan.carbsG}g</span>
                </div>

                <div className="w-full h-3 rounded-full bg-surface-container-high overflow-hidden flex">
                  <div
                    style={{ width: `${Math.round(((plan.proteinG * 4) / plan.targetKcal) * 100)}%` }}
                    className="h-full bg-blue-600"
                    title="Proteína"
                  ></div>
                  <div
                    style={{ width: `${Math.round(((plan.fatG * 9) / plan.targetKcal) * 100)}%` }}
                    className="h-full bg-emerald-600"
                    title="Grasas"
                  ></div>
                  <div
                    style={{ width: `${Math.round(((plan.carbsG * 4) / plan.targetKcal) * 100)}%` }}
                    className="h-full bg-amber-600"
                    title="Carbohidratos"
                  ></div>
                </div>

                <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
                  <span>{plan.proteinRatioGKg} g/kg ({Math.round(((plan.proteinG * 4) / plan.targetKcal) * 100)}%)</span>
                  <span>{plan.fatRatioGKg} g/kg ({Math.round(((plan.fatG * 9) / plan.targetKcal) * 100)}%)</span>
                  <span>{Math.round(((plan.carbsG * 4) / plan.targetKcal) * 100)}% energía</span>
                </div>
              </div>
            </section>

            {/* Hydration Card (35 ml / kg) */}
            <section className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">water_drop</span>
                </div>
                <div>
                  <span className="font-semibold text-xs text-blue-950 block">Recomendación de Hidratación</span>
                  <span className="text-[11px] text-blue-800">
                    Meta diaria: <strong>{recommendedHydrationMl} ml</strong> (35 ml/kg sobre peso de {currentWeight} kg)
                  </span>
                </div>
              </div>
              <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-900 text-xs font-mono font-bold shrink-0">
                {(recommendedHydrationMl / 1000).toFixed(1)} L / día
              </span>
            </section>

            {/* Meal Times & Equivalent Food Portions with Interactive Switcher */}
            <section className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">restaurant_menu</span>
                  <div>
                    <h3 className="font-display font-semibold text-base text-on-surface">
                      Menú y Raciones por Comida
                    </h3>
                    <p className="text-[11px] text-on-surface-variant no-print">
                      💡 Toca cualquier porción para ver intercambios equivalentes permitidos
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-on-surface-variant">
                  {plan.mealStructure.length} tiempos
                </span>
              </div>

              <div className="space-y-4">
                {plan.mealStructure.map((meal) => (
                  <div
                    key={meal.id}
                    className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-primary text-on-primary text-[11px] font-bold flex items-center justify-center">
                          {meal.mealNumber}
                        </span>
                        <h4 className="font-semibold text-xs text-on-surface">{meal.name}</h4>
                        {meal.targetTime && (
                          <span className="text-[10px] text-on-surface-variant font-mono">
                            ({meal.targetTime})
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-primary">{meal.totalKcal} kcal</span>
                    </div>

                    <div className="space-y-2">
                      {meal.portions.map((p, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedEquivalentPortion(p)}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-surface-container-lowest transition-colors cursor-pointer border border-transparent hover:border-outline-variant/30 group"
                          title="Toca para ver intercambios equivalentes"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                                {p.suggestedFood}
                              </span>
                              <span className="material-symbols-outlined text-[13px] text-primary opacity-0 group-hover:opacity-100 transition-opacity no-print">
                                swap_horiz
                              </span>
                            </div>
                            <span className="text-[10px] text-on-surface-variant">
                              {p.groupName} • {p.portions} porción ({p.gramsNet}g aprox)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-surface-container text-[10px] font-mono font-medium">
                              {p.portionUnit}
                            </span>
                            <span className="text-[10px] text-primary font-medium underline underline-offset-2 no-print">
                              Ver opciones
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {meal.notes && (
                      <p className="text-[10px] text-primary bg-primary/5 p-2 rounded-lg italic">
                        💡 {meal.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* --- TAB 2: RUTINA --- */}
        {(activeTab === 'workout' || typeof window === 'undefined') && (
          <div className="flex flex-col gap-5 print:flex">
            <section className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">fitness_center</span>
                  <div>
                    <h3 className="font-display font-semibold text-base text-on-surface">Rutina Semanal de Fuerza</h3>
                    <p className="text-[11px] text-on-surface-variant">Adaptada a tus días disponibles y equipamiento</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-[11px] font-semibold uppercase">
                  {plan.workoutSplit.replace(/_/g, ' ')}
                </span>
              </div>

              {client.clinicalFlags && client.clinicalFlags.some((f) => f.includes('injury') || f.includes('articular')) && (
                <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 text-xs rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-amber-700">healing</span>
                  <span>Ejercicios con protección articular activa según tu expediente de lesiones.</span>
                </div>
              )}

              <div className="space-y-4">
                {plan.workoutStructure.map((day, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-2.5"
                  >
                    <div className="border-b border-outline-variant/20 pb-2 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-xs text-on-surface">{day.dayName}</h4>
                        <span className="text-[10px] text-on-surface-variant font-medium">{day.focus}</span>
                      </div>
                      <span className="text-[10px] font-mono text-outline font-semibold">
                        {day.exercises.length} Ejercicios
                      </span>
                    </div>

                    <div className="space-y-2">
                      {day.exercises.map((ex) => (
                        <div key={ex.id} className="p-3 rounded-lg bg-surface-container-lowest text-xs flex flex-col gap-1.5 border border-outline-variant/10">
                          <div className="flex items-center justify-between">
                            <strong className="text-on-surface font-semibold text-xs">{ex.name}</strong>
                            <span className="text-[11px] font-mono font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded">
                              {ex.sets} series × {ex.reps}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
                            <span>Descanso: {ex.restSec || 90}s entre series</span>
                            {ex.videoUrl && (
                              <a
                                href={ex.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline font-medium no-print"
                              >
                                <span className="material-symbols-outlined text-[13px]">play_circle</span>
                                <span>Ver técnica</span>
                              </a>
                            )}
                          </div>

                          {ex.notes && (
                            <p className="text-[10px] text-on-surface-variant leading-relaxed bg-surface-container-low p-1.5 rounded">
                              📌 {ex.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* --- TAB 3: PROGRESO HISTÓRICO --- */}
        {(activeTab === 'progress' || typeof window === 'undefined') && (
          <div className="flex flex-col gap-5 print:flex">
            {/* Summary Cards */}
            <section className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-700 text-[20px]">trending_up</span>
                  <h3 className="font-display font-semibold text-base text-on-surface">Evolución y Resumen Antropométrico</h3>
                </div>
                <span className="text-xs font-mono text-on-surface-variant">
                  {biometricLogs.length} consulta(s)
                </span>
              </div>

              {/* Progress Stat Widgets */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                  <span className="text-[10px] text-on-surface-variant font-medium uppercase block">Peso Actual</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold font-mono text-on-surface">{currentWeight}</span>
                    <span className="text-[10px] text-on-surface-variant">kg</span>
                  </div>
                  {weightDelta !== null && (
                    <span className={`text-[10px] font-bold mt-1 inline-block ${
                      weightDelta < 0 ? 'text-emerald-700' : weightDelta > 0 ? 'text-amber-700' : 'text-on-surface-variant'
                    }`}>
                      {weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg total
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                  <span className="text-[10px] text-on-surface-variant font-medium uppercase block">Cintura</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold font-mono text-on-surface">
                      {latestLog?.waistCm ? `${latestLog.waistCm}` : '—'}
                    </span>
                    <span className="text-[10px] text-on-surface-variant">cm</span>
                  </div>
                  {waistDelta !== null && (
                    <span className={`text-[10px] font-bold mt-1 inline-block ${
                      waistDelta < 0 ? 'text-emerald-700' : waistDelta > 0 ? 'text-rose-700' : 'text-on-surface-variant'
                    }`}>
                      {waistDelta > 0 ? `+${waistDelta}` : waistDelta} cm total
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-on-surface-variant font-medium uppercase block">% Grasa Corporal</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold font-mono text-on-surface">
                      {latestLog?.bodyFatPct ? `${latestLog.bodyFatPct}%` : '—'}
                    </span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant mt-1 inline-block">
                    {latestLog?.muscleMassKg ? `Músculo: ${latestLog.muscleMassKg} kg` : 'Seguimiento activo'}
                  </span>
                </div>
              </div>

              {/* Consultation History List */}
              <div className="mt-2 space-y-3">
                <h4 className="text-xs font-semibold text-on-surface uppercase tracking-wide">
                  Histórico de Consultas
                </h4>
                {biometricLogs.length === 0 ? (
                  <p className="text-xs text-on-surface-variant p-3 bg-surface-container-low rounded-xl text-center">
                    Aún no hay consultas antropométricas registradas.
                  </p>
                ) : (
                  biometricLogs.map((log, index) => {
                    const prevLog = biometricLogs[index + 1];
                    const dWeight = prevLog ? Number((log.weightKg - prevLog.weightKg).toFixed(1)) : null;
                    const dWaist = (log.waistCm && prevLog?.waistCm) ? Number((log.waistCm - prevLog.waistCm).toFixed(1)) : null;

                    return (
                      <div
                        key={log.id}
                        className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between border-b border-outline-variant/10 pb-1.5">
                          <span className="text-xs font-bold text-on-surface">
                            {new Date(log.recordedAt).toLocaleDateString('es-MX', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="text-xs font-mono font-bold text-primary">
                            {log.weightKg} kg
                            {dWeight !== null && (
                              <span className={`ml-1.5 text-[10px] ${
                                dWeight < 0 ? 'text-emerald-700' : dWeight > 0 ? 'text-amber-700' : 'text-on-surface-variant'
                              }`}>
                                ({dWeight > 0 ? `+${dWeight}` : dWeight} kg)
                              </span>
                            )}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-[11px] text-on-surface-variant">
                          <div>
                            <span className="text-[10px] text-outline block">Cintura</span>
                            <span className="font-mono text-on-surface font-semibold">
                              {log.waistCm ? `${log.waistCm} cm` : '—'}
                              {dWaist !== null && (
                                <span className="ml-1 text-[9px] text-emerald-700">({dWaist > 0 ? `+${dWaist}` : dWaist})</span>
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-outline block">% Grasa</span>
                            <span className="font-mono text-on-surface font-semibold">
                              {log.bodyFatPct ? `${log.bodyFatPct}%` : '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-outline block">Cadera</span>
                            <span className="font-mono text-on-surface font-semibold">
                              {log.hipCm ? `${log.hipCm} cm` : '—'}
                            </span>
                          </div>
                        </div>

                        {log.notes && (
                          <div className="text-[11px] text-on-surface bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/10">
                            <strong className="text-[10px] text-primary block uppercase">Comentarios del especialista:</strong>
                            <p className="mt-0.5 leading-relaxed">{log.notes}</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        )}

        {/* Footer info */}
        <footer className="text-center text-[11px] text-outline pt-4 no-print">
          BioMetrix Pro • Tu plan clínico se actualiza en vivo cada vez que tu especialista realiza ajustes.
        </footer>
      </main>

      {/* --- MODAL INTERACTIVO DE EQUIVALENTES SMAE --- */}
      {selectedEquivalentPortion && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs no-print">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-outline-variant/30 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">swap_horiz</span>
                <div>
                  <h3 className="font-bold text-sm text-on-surface">
                    Equivalentes: {selectedEquivalentPortion.groupName}
                  </h3>
                  <p className="text-[11px] text-on-surface-variant">
                    Sustituye <strong>{selectedEquivalentPortion.suggestedFood}</strong> ({selectedEquivalentPortion.portions} porción) por cualquiera de estas opciones:
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEquivalentPortion(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body - Alternatives List */}
            <div className="p-4 overflow-y-auto space-y-2.5">
              {equivalentAlternatives.length === 0 ? (
                <div className="p-6 text-center text-xs text-on-surface-variant">
                  No se encontraron alimentos alternativos registrados en este grupo que cumplan con tus restricciones alimentarias.
                </div>
              ) : (
                equivalentAlternatives.map((alt) => {
                  const qtyTotal = (alt.portionQty * selectedEquivalentPortion.portions).toFixed(1).replace(/\.0$/, '');
                  const netGramsTotal = Math.round(alt.gramsNet * selectedEquivalentPortion.portions);
                  const kcalTotal = Math.round(alt.kcal * selectedEquivalentPortion.portions);
                  const proteinTotal = Math.round(alt.proteinG * selectedEquivalentPortion.portions);

                  return (
                    <div
                      key={alt.id}
                      className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/20 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-xs text-on-surface truncate">
                          {alt.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-on-surface-variant font-mono">
                          <span className="text-primary font-bold">{qtyTotal} {alt.portionUnit}</span>
                          <span>•</span>
                          <span>{netGramsTotal}g netos</span>
                          <span>•</span>
                          <span>{kcalTotal} kcal</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="px-2 py-1 rounded bg-surface-container-lowest text-[10px] font-mono font-semibold text-blue-900 border border-outline-variant/20">
                          {proteinTotal}g P
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-outline-variant/20 bg-surface-container-low flex justify-between items-center text-[11px] text-on-surface-variant">
              <span>{equivalentAlternatives.length} opciones seguras disponibles</span>
              <button
                onClick={() => setSelectedEquivalentPortion(null)}
                className="px-4 py-1.5 rounded-lg bg-primary text-on-primary font-semibold text-xs shadow-sm hover:opacity-90 transition-all"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
