'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClientProfile, NutritionalPlan, PermalinkRecord } from '@/lib/types/clinical';

interface PatientVisorViewProps {
  client: ClientProfile;
  plan: NutritionalPlan;
  permalink: PermalinkRecord;
}

export function PatientVisorView({ client, plan, permalink }: PatientVisorViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'nutrition' | 'workout'>('nutrition');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans text-on-surface">
      {/* 1. Mobile Top Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 px-4 h-14 flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container text-primary text-[11px] font-semibold">
            <span className="material-symbols-outlined text-[13px]">lock</span>
            <span>256-Bit SSL</span>
          </div>
          <div className="h-3.5 w-px bg-outline-variant/40"></div>
          <span className="text-xs font-semibold text-on-surface truncate max-w-[130px]">
            {client.fullName}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary text-on-primary text-xs font-semibold shadow-sm active:scale-95 transition-all"
            title="Descargar o imprimir PDF"
          >
            <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
            <span>PDF</span>
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            title="Cerrar sesión en este dispositivo"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </header>

      {/* Print-only Header */}
      <div className="hidden print:block p-4 border-b border-gray-300 mb-4">
        <div className="flex justify-between items-center text-xs text-gray-600">
          <strong className="text-black text-sm">BioMetrix Pro • Hoja Clínica Nutricional</strong>
          <span>Expediente: #BIO-9942 • {client.fullName}</span>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 flex flex-col gap-5 pb-24">
        {/* 2. Saludo Personalizado & Status */}
        <section className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
              Plan Clínico Personalizado
            </span>
            <h2 className="font-display text-2xl font-bold text-on-surface mt-0.5">
              ¡Hola, {firstName}! 👋
            </h2>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Tu plan de <strong className="text-on-surface font-semibold">Recomposición Corporal & Déficit Seguro</strong> está activo y supervisado por tu especialista.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-on-surface-variant">
              <span className="material-symbols-outlined text-primary text-[15px]">stethoscope</span>
              <span>Supervisado por: Dr. Alejandro Valdés (Medicina Deportiva)</span>
            </div>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary font-bold text-base flex items-center justify-center shrink-0 border border-primary/20">
            {firstName[0]}
          </div>
        </section>

        {/* 3. Tab Switcher (Nutrición / Rutina) */}
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
            <span>Nutrición & SMAE</span>
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
            <span>Rutina de Entrenamiento</span>
          </button>
        </div>

        {/* --- TAB 1: NUTRICIÓN --- */}
        {(activeTab === 'nutrition' || typeof window === 'undefined') && (
          <div className="flex flex-col gap-5">
            {/* Target Card with Radial Arc */}
            <section className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">nutrition</span>
                  <h3 className="font-display font-semibold text-base text-on-surface">Metas Nutricionales Diarias</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 text-[11px] font-semibold">
                  Déficit -15% Activo
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
                    Suelo metabólico seguro respetado (&ge; {plan.caloricFloorMin} kcal)
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
                  <div style={{ width: '28%' }} className="h-full bg-blue-600" title="Proteína"></div>
                  <div style={{ width: '26%' }} className="h-full bg-emerald-600" title="Grasas"></div>
                  <div style={{ width: '46%' }} className="h-full bg-amber-600" title="Carbohidratos"></div>
                </div>

                <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
                  <span>{plan.proteinRatioGKg} g/kg peso</span>
                  <span>{plan.fatRatioGKg} g/kg peso</span>
                  <span>Balance glucídico</span>
                </div>
              </div>
            </section>

            {/* Hydration Card */}
            <section className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">water_drop</span>
                </div>
                <div>
                  <span className="font-semibold text-xs text-blue-950 block">Recomendación de Hidratación</span>
                  <span className="text-[11px] text-blue-800">
                    Meta mínima diaria: <strong>{plan.hydrationMl || 3200} ml</strong> (40 ml/kg)
                  </span>
                </div>
              </div>
              <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-900 text-xs font-mono font-bold">
                {((plan.hydrationMl || 3200) / 1000).toFixed(1)} Litros
              </span>
            </section>

            {/* Meal Times & Equivalent Food Portions */}
            <section className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">restaurant_menu</span>
                  <h3 className="font-display font-semibold text-base text-on-surface">
                    Menú y Raciones por Comida
                  </h3>
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
                        <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                          <div>
                            <span className="font-medium text-on-surface block">{p.suggestedFood}</span>
                            <span className="text-[10px] text-on-surface-variant">
                              {p.groupName} • {p.portions} porción ({p.gramsNet}g aprox)
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-surface-container text-[10px] font-mono font-medium">
                            {p.portionUnit}
                          </span>
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
          <div className="flex flex-col gap-5">
            <section className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">fitness_center</span>
                  <h3 className="font-display font-semibold text-base text-on-surface">Rutina Semanal de Fuerza</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-[11px] font-semibold uppercase">
                  {plan.workoutSplit.replace(/_/g, ' ')}
                </span>
              </div>

              {client.clinicalFlags.some((f) => f.includes('injury')) && (
                <div className="p-3 bg-surface-container text-secondary text-xs rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">healing</span>
                  <span>Ejercicios con protección articular activa para tendón rotuliano derecho.</span>
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
                        <span className="text-[10px] text-on-surface-variant">{day.focus}</span>
                      </div>
                      <span className="text-[10px] font-mono text-outline font-semibold">
                        {day.exercises.length} Ejercicios
                      </span>
                    </div>

                    <div className="space-y-2">
                      {day.exercises.map((ex) => (
                        <div key={ex.id} className="p-2.5 rounded-lg bg-surface-container-lowest text-xs flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <strong className="text-on-surface font-medium">{ex.name}</strong>
                            <span className="text-[11px] font-mono font-bold text-secondary">
                              {ex.sets} × {ex.reps}
                            </span>
                          </div>
                          {ex.notes && (
                            <p className="text-[10px] text-on-surface-variant leading-relaxed">
                              {ex.notes}
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

        {/* Footer info */}
        <footer className="text-center text-[11px] text-outline pt-4 no-print">
          BioMetrix Pro • Permalink protegido con expiración automática de 30 días.
        </footer>
      </main>
    </div>
  );
}
