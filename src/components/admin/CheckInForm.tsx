'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BiometricLog } from '@/lib/types/clinical';

interface CheckInFormProps {
  clientId: string;
  latestLog?: BiometricLog;
  onAdded?: (newLog: BiometricLog) => void;
}

export function CheckInForm({ clientId, latestLog }: CheckInFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [recordedAt, setRecordedAt] = useState(new Date().toISOString().split('T')[0]);
  const [weightKg, setWeightKg] = useState<string>(latestLog ? String(latestLog.weightKg) : '84.0');
  const [bodyFatPct, setBodyFatPct] = useState<string>(latestLog?.bodyFatPct ? String(latestLog.bodyFatPct) : '18.0');
  const [muscleMassKg, setMuscleMassKg] = useState<string>(latestLog?.muscleMassKg ? String(latestLog.muscleMassKg) : '69.0');
  const [waistCm, setWaistCm] = useState<string>(latestLog?.waistCm ? String(latestLog.waistCm) : '85.5');
  const [hipCm, setHipCm] = useState<string>(latestLog?.hipCm ? String(latestLog.hipCm) : '98.0');
  const [abdomenCm, setAbdomenCm] = useState<string>(latestLog?.abdomenCm ? String(latestLog.abdomenCm) : '87.0');
  const [activityFactor, setActivityFactor] = useState<string>('1.55');
  const [trainingDays, setTrainingDays] = useState<string>('4');
  const [notes, setNotes] = useState<string>('');

  // Live differential / delta calculations against latest log
  const currentWeightNum = parseFloat(weightKg) || 0;
  const currentFatNum = parseFloat(bodyFatPct) || 0;
  const currentWaistNum = parseFloat(waistCm) || 0;

  const deltaWeight = latestLog ? Math.round((currentWeightNum - latestLog.weightKg) * 10) / 10 : 0;
  const deltaFat = latestLog?.bodyFatPct ? Math.round((currentFatNum - latestLog.bodyFatPct) * 10) / 10 : 0;
  const deltaWaist = latestLog?.waistCm ? Math.round((currentWaistNum - latestLog.waistCm) * 10) / 10 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg(null);

    try {
      const payload = {
        clientId,
        recordedAt,
        weightKg: currentWeightNum,
        bodyFatPct: currentFatNum > 0 ? currentFatNum : null,
        muscleMassKg: parseFloat(muscleMassKg) || null,
        waistCm: currentWaistNum > 0 ? currentWaistNum : null,
        hipCm: parseFloat(hipCm) || null,
        abdomenCm: parseFloat(abdomenCm) || null,
        activityFactor: parseFloat(activityFactor) || 1.4,
        trainingDays: parseInt(trainingDays, 10) || 3,
        equipmentAvailable: ['gym'],
        notes: notes.trim() || undefined,
      };

      const res = await fetch('/api/admin/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Error al guardar la consulta');
      }

      setSuccessMsg('¡Consulta registrada con éxito! El histórico fue actualizado.');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[22px]">edit_calendar</span>
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg text-on-surface">Nueva Consulta & Check-in</h2>
            <p className="text-xs text-on-surface-variant">ISAK Nivel 1 • Registro histórico inmutable</p>
          </div>
        </div>

        {/* Live Delta Summary Pills */}
        {latestLog && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-on-surface-variant font-medium">Deltas vs Consulta Previa:</span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1 ${
                deltaWeight <= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              <span>{deltaWeight <= 0 ? '↓' : '↑'}</span>
              <span>{deltaWeight > 0 ? `+${deltaWeight}` : deltaWeight} kg</span>
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1 ${
                deltaFat <= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              <span>{deltaFat <= 0 ? '↓' : '↑'}</span>
              <span>{deltaFat > 0 ? `+${deltaFat}` : deltaFat}% grasa</span>
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1 ${
                deltaWaist <= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              <span>{deltaWaist <= 0 ? '↓' : '↑'}</span>
              <span>{deltaWaist > 0 ? `+${deltaWaist}` : deltaWaist} cm cintura</span>
            </span>
          </div>
        )}
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">Fecha de Medición</label>
            <input
              type="date"
              value={recordedAt}
              onChange={(e) => setRecordedAt(e.target.value)}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">Peso Actual (kg)</label>
            <input
              type="number"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">% Grasa Corporal</label>
            <input
              type="number"
              step="0.1"
              value={bodyFatPct}
              onChange={(e) => setBodyFatPct(e.target.value)}
              placeholder="Opcional (habilita Katch)"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">Masa Muscular (kg)</label>
            <input
              type="number"
              step="0.1"
              value={muscleMassKg}
              onChange={(e) => setMuscleMassKg(e.target.value)}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
          </div>
        </div>

        {/* Perímetros */}
        <div>
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
            Perímetros Corporales (cm)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-on-surface mb-1">Cintura (mínima)</label>
              <input
                type="number"
                step="0.1"
                value={waistCm}
                onChange={(e) => setWaistCm(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface mb-1">Abdomen (ombligo)</label>
              <input
                type="number"
                step="0.1"
                value={abdomenCm}
                onChange={(e) => setAbdomenCm(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface mb-1">Cadera (glúteo máx)</label>
              <input
                type="number"
                step="0.1"
                value={hipCm}
                onChange={(e) => setHipCm(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
          </div>
        </div>

        {/* Actividad física */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">Factor de Actividad (FAF)</label>
            <select
              value={activityFactor}
              onChange={(e) => setActivityFactor(e.target.value)}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="1.2">1.2 - Sedentario (Trabajo de escritorio, poco ejercicio)</option>
              <option value="1.375">1.375 - Ligero (1-3 días de entrenamiento suave)</option>
              <option value="1.55">1.55 - Moderado-Alto (4-5 días fuerza + 8k pasos)</option>
              <option value="1.725">1.725 - Muy Activo (6-7 días de entrenamiento intenso)</option>
              <option value="1.9">1.9 - Atleta Élite / Doble sesión diaria</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">Días de Entrenamiento Semanal</label>
            <select
              value={trainingDays}
              onChange={(e) => setTrainingDays(e.target.value)}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="2">2 días (Full Body)</option>
              <option value="3">3 días (Full Body A/B/C)</option>
              <option value="4">4 días (Torso / Pierna)</option>
              <option value="5">5 días (Push / Pull / Legs)</option>
              <option value="6">6 días (Push / Pull / Legs x2)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-on-surface mb-1">Notas Clínicas y Adherencia</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Observaciones de adherencia, tolerancia gastrointestinal o ajuste de cargas..."
            className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
          ></textarea>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-medium text-xs transition-all shadow-sm flex items-center gap-2 active:scale-[0.98] disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>{isSubmitting ? 'Guardando consulta...' : 'Guardar Consulta en Histórico'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
