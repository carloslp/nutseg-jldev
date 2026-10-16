'use client';

import React from 'react';
import { BiometricLog } from '@/lib/types/clinical';

interface ImmediateDifferentialProps {
  logs: BiometricLog[];
  heightCm: number;
}

export function ImmediateDifferential({ logs, heightCm }: ImmediateDifferentialProps) {
  if (logs.length === 0) return null;

  const current = logs[logs.length - 1];
  const previous = logs.length > 1 ? logs[logs.length - 2] : null;

  const deltaWeight = previous ? current.weightKg - previous.weightKg : 0;
  const deltaFat = previous && current.bodyFatPct && previous.bodyFatPct
    ? current.bodyFatPct - previous.bodyFatPct
    : null;
  const deltaMuscle = previous && current.muscleMassKg && previous.muscleMassKg
    ? current.muscleMassKg - previous.muscleMassKg
    : null;
  const deltaWaist = previous && current.waistCm && previous.waistCm
    ? current.waistCm - previous.waistCm
    : null;
  const deltaHip = previous && current.hipCm && previous.hipCm
    ? current.hipCm - previous.hipCm
    : null;

  // Waist to height ratio
  const whtr = current.waistCm ? (current.waistCm / heightCm) : null;
  const whtrStatus = whtr
    ? whtr < 0.5
      ? { label: 'Riesgo Cardiovascular Bajo', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
      : whtr < 0.6
      ? { label: 'Riesgo Cardiovascular Moderado', color: 'bg-amber-50 text-amber-800 border-amber-200' }
      : { label: 'Riesgo Cardiovascular Elevado', color: 'bg-rose-50 text-rose-800 border-rose-200' }
    : null;

  // Body Composition estimates
  const fatPct = current.bodyFatPct || 18.0;
  const musclePct = current.muscleMassKg ? Math.round((current.muscleMassKg / current.weightKg) * 100) : 45.0;
  const residualPct = Math.max(10, 100 - fatPct - musclePct);
  const lbmPct = (100 - fatPct).toFixed(1);

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-xs flex flex-col gap-3">
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant/15">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-on-surface">Diferencial Inmediato</h3>
            <span className="text-[11px] text-on-surface-variant">
              {previous ? `vs ${previous.recordedAt}` : 'Consulta inicial de referencia'}
            </span>
          </div>
        </div>
        {previous && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
            {deltaWeight <= 0 ? 'Favorable' : 'En ajuste'}
          </span>
        )}
      </div>

      {/* Comparative Micro-Metrics Grid */}
      <div className="flex flex-col divide-y divide-outline-variant/15 text-xs">
        {/* Row 1: Peso */}
        <div className="flex items-center justify-between py-2">
          <div className="flex flex-col">
            <span className="text-on-surface font-medium">Peso Corporal</span>
            {previous && (
              <span className="text-[11px] text-on-surface-variant font-mono">
                {previous.weightKg} kg → {current.weightKg} kg
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-on-surface">{current.weightKg} kg</span>
            {previous && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold ${
                  deltaWeight <= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}
              >
                Δ {deltaWeight > 0 ? `+${deltaWeight.toFixed(1)}` : deltaWeight.toFixed(1)} kg
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Grasa */}
        {current.bodyFatPct && (
          <div className="flex items-center justify-between py-2">
            <div className="flex flex-col">
              <span className="text-on-surface font-medium">% Grasa Corporal</span>
              {previous?.bodyFatPct && (
                <span className="text-[11px] text-on-surface-variant font-mono">
                  {previous.bodyFatPct}% → {current.bodyFatPct}%
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-on-surface">{current.bodyFatPct}%</span>
              {deltaFat !== null && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold ${
                    deltaFat <= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  Δ {deltaFat > 0 ? `+${deltaFat.toFixed(1)}` : deltaFat.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        )}

        {/* Row 3: Masa Muscular */}
        {current.muscleMassKg && (
          <div className="flex items-center justify-between py-2">
            <div className="flex flex-col">
              <span className="text-on-surface font-medium">Masa Muscular</span>
              {previous?.muscleMassKg && (
                <span className="text-[11px] text-on-surface-variant font-mono">
                  {previous.muscleMassKg} kg → {current.muscleMassKg} kg
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-on-surface">{current.muscleMassKg} kg</span>
              {deltaMuscle !== null && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold ${
                    deltaMuscle >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  Δ {deltaMuscle > 0 ? `+${deltaMuscle.toFixed(1)}` : deltaMuscle.toFixed(1)} kg
                </span>
              )}
            </div>
          </div>
        )}

        {/* Row 4: Cintura */}
        {current.waistCm && (
          <div className="flex items-center justify-between py-2">
            <div className="flex flex-col">
              <span className="text-on-surface font-medium">Perímetro Cintura</span>
              {previous?.waistCm && (
                <span className="text-[11px] text-on-surface-variant font-mono">
                  {previous.waistCm} cm → {current.waistCm} cm
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-on-surface">{current.waistCm} cm</span>
              {deltaWaist !== null && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold ${
                    deltaWaist <= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  Δ {deltaWaist > 0 ? `+${deltaWaist.toFixed(1)}` : deltaWaist.toFixed(1)} cm
                </span>
              )}
            </div>
          </div>
        )}

        {/* Row 5: Cadera */}
        {current.hipCm && (
          <div className="flex items-center justify-between py-2">
            <div className="flex flex-col">
              <span className="text-on-surface font-medium">Perímetro Cadera</span>
              {previous?.hipCm && (
                <span className="text-[11px] text-on-surface-variant font-mono">
                  {previous.hipCm} cm → {current.hipCm} cm
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-on-surface">{current.hipCm} cm</span>
              {deltaHip !== null && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-surface-container text-on-surface">
                  Δ {deltaHip > 0 ? `+${deltaHip.toFixed(1)}` : deltaHip.toFixed(1)} cm
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Segmented Body Recomposition Visual Bar */}
      <div className="bg-surface-container-low p-3 rounded-xl flex flex-col gap-2 mt-1 border border-outline-variant/20">
        <div className="flex items-center justify-between text-xs">
          <span className="text-on-surface font-medium">Composición Total ({current.weightKg} kg)</span>
          <span className="text-primary font-mono font-bold">MLG {lbmPct}%</span>
        </div>
        <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden flex">
          <div className="h-full bg-secondary" style={{ width: `${musclePct}%` }}></div>
          <div className="h-full bg-primary" style={{ width: `${residualPct}%` }}></div>
          <div className="h-full bg-amber-500" style={{ width: `${fatPct}%` }}></div>
        </div>
        <div className="flex items-center justify-between text-[11px] pt-0.5">
          <span className="flex items-center gap-1 text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-secondary"></span> Músculo ({Math.round(musclePct)}%)
          </span>
          <span className="flex items-center gap-1 text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-primary"></span> Residual ({Math.round(residualPct)}%)
          </span>
          <span className="flex items-center gap-1 text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Grasa ({Math.round(fatPct)}%)
          </span>
        </div>
      </div>

      {/* Cardiovascular Risk Metric */}
      {whtr && whtrStatus && (
        <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${whtrStatus.color}`}>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="material-symbols-outlined text-[17px]">cardiology</span>
            <span>Ratio Cintura/Estatura: <strong className="font-mono">{whtr.toFixed(2)}</strong></span>
          </div>
          <span className="text-[10px] font-bold uppercase">{whtrStatus.label}</span>
        </div>
      )}
    </div>
  );
}
