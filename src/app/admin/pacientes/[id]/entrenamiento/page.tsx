import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { NutritionRepository } from '@/lib/db/repository';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { buildWorkoutRoutine } from '@/lib/engine/workout';

export default async function PatientEntrenamientoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await NutritionRepository.getClientById(id);

  if (!client) {
    notFound();
  }

  const logs = await NutritionRepository.getBiometricLogs(id);
  const latestLog = logs[logs.length - 1];

  const currentPlan = await NutritionRepository.getCurrentPlan(id);

  // If a plan exists, use its workoutStructure; otherwise generate dynamically
  const routine = currentPlan?.workoutStructure && currentPlan.workoutStructure.length > 0
    ? currentPlan.workoutStructure
    : buildWorkoutRoutine({
        trainingDays: latestLog?.trainingDays || 4,
        equipment: latestLog?.equipmentAvailable || ['gym'],
        clinicalFlags: client.clinicalFlags,
      }).routine;

  const splitName = currentPlan?.workoutSplit
    ? currentPlan.workoutSplit === 'push_pull_legs'
      ? 'Push / Pull / Legs (5-6 Días)'
      : currentPlan.workoutSplit === 'upper_lower'
      ? 'Upper / Lower (4 Días)'
      : 'Full Body (2-3 Días)'
    : `${latestLog?.trainingDays || 4} Días de Entrenamiento`;

  const hasKneeInjury = client.clinicalFlags.includes('knee_injury');
  const hasShoulderInjury = client.clinicalFlags.includes('shoulder_injury');
  const hasBackInjury = client.clinicalFlags.includes('lower_back_injury');

  return (
    <AdminLayout clientId={client.id} clientName={client.fullName}>
      <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
        {/* Header */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">fitness_center</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-xl text-on-surface">Periodización & Rutina Biomecánica</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-primary text-xs font-mono font-medium">
                  {splitName}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Prescripción deportiva adaptada a equipamiento y exclusión estricta de estrés articular
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/pacientes/${client.id}/plan`}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-all flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>Ajustar en Motor Plan</span>
            </Link>
          </div>
        </div>

        {/* Biomechanical Caution Banner */}
        {(hasKneeInjury || hasShoulderInjury || hasBackInjury) && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-700 text-[24px] shrink-0">warning</span>
            <div className="text-xs text-amber-900">
              <strong className="font-bold block uppercase tracking-wider text-amber-950">
                Precaución Biomecánica Activa
              </strong>
              <div className="mt-1 space-y-1">
                {hasKneeInjury && (
                  <p>
                    • <strong>Rodilla:</strong> Evitar flexión profunda &gt;90° en cadena cerrada (prensa y sentadilla con tope articular, priorizando contracción isométrica en cuádriceps).
                  </p>
                )}
                {hasShoulderInjury && (
                  <p>
                    • <strong>Hombro:</strong> Evitar press tras nuca o abducción coronal pura. Se exige plano escapular a 30° y agarres neutros para evitar pinzamiento subacromial.
                  </p>
                )}
                {hasBackInjury && (
                  <p>
                    • <strong>Columna Lumbar:</strong> Eliminada la compresión axial directa. Remos con apoyo en pecho y puentes de glúteo en suelo recomendados.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Days & Exercises List */}
        <div className="space-y-6">
          {routine.map((day, dIdx) => (
            <div
              key={day.dayName}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs overflow-hidden"
            >
              <div className="p-5 border-b border-outline-variant/15 flex items-center justify-between bg-surface-container-low/50">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-primary text-on-primary font-bold text-xs flex items-center justify-center">
                    {dIdx + 1}
                  </span>
                  <div>
                    <h2 className="font-display font-bold text-sm text-on-surface">{day.dayName}</h2>
                    <p className="text-[11px] text-on-surface-variant">{day.focus}</p>
                  </div>
                </div>
                <span className="text-xs text-primary font-semibold font-mono">
                  {day.exercises.length} Ejercicios
                </span>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {day.exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 flex flex-col justify-between gap-3 hover:border-primary/40 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant font-semibold">
                          Patrón: {ex.movementPattern}
                        </span>
                        {ex.jointStressTags && ex.jointStressTags.length > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">
                            ⚠️ {ex.jointStressTags.join(', ')}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                            ✓ Seguro Articular
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-on-surface">{ex.name}</h3>

                      <div className="flex items-center gap-2 mt-2 text-xs font-mono">
                        <span className="px-2 py-0.5 rounded-md bg-surface-container font-semibold text-primary">
                          {ex.sets} Series × {ex.reps}
                        </span>
                        <span className="text-on-surface-variant text-[11px]">
                          Rest: {ex.restSec}s {ex.rpe ? `• RPE ${ex.rpe}` : ''}
                        </span>
                      </div>

                      {ex.notes && (
                        <p className="text-[11px] text-on-surface-variant mt-2 italic">
                          "{ex.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15 text-xs">
                      <span className="text-on-surface-variant capitalize text-[11px]">
                        Equipo: {ex.equipment}
                      </span>
                      {ex.videoUrl && (
                        <a
                          href={ex.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline font-semibold text-[11px]"
                        >
                          <span className="material-symbols-outlined text-[15px]">play_circle</span>
                          <span>Ver Video</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
