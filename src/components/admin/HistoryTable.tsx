import React from 'react';
import { BiometricLog } from '@/lib/types/clinical';
import { calculateBMI } from '@/lib/engine/macros';

interface HistoryTableProps {
  logs: BiometricLog[];
  heightCm: number;
}

export function HistoryTable({ logs, heightCm }: HistoryTableProps) {
  // Sort descending for table view (latest first)
  const sorted = [...logs].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-base text-on-surface">Histórico de Consultas & Check-ins</h3>
          <p className="text-xs text-on-surface-variant">Registro inmutable ordenado cronológicamente</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-xs font-mono font-medium">
          {logs.length} Consultas
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] tracking-wider font-semibold border-b border-outline-variant/20">
            <tr>
              <th className="py-3 px-4">Fecha</th>
              <th className="py-3 px-4">Peso (kg)</th>
              <th className="py-3 px-4">IMC</th>
              <th className="py-3 px-4">% Grasa</th>
              <th className="py-3 px-4">Masa Magra</th>
              <th className="py-3 px-4">Cintura</th>
              <th className="py-3 px-4">Abdomen</th>
              <th className="py-3 px-4">FAF / Días</th>
              <th className="py-3 px-4">Notas Clínicas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10 text-on-surface">
            {sorted.map((log, index) => {
              const bmi = calculateBMI(log.weightKg, heightCm);
              const prevLog = sorted[index + 1]; // chronological predecessor

              const deltaWeight = prevLog ? Math.round((log.weightKg - prevLog.weightKg) * 10) / 10 : null;
              const deltaFat = prevLog?.bodyFatPct && log.bodyFatPct ? Math.round((log.bodyFatPct - prevLog.bodyFatPct) * 10) / 10 : null;
              const deltaWaist = prevLog?.waistCm && log.waistCm ? Math.round((log.waistCm - prevLog.waistCm) * 10) / 10 : null;

              return (
                <tr key={log.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-primary">
                    {log.recordedAt}
                    {index === 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] uppercase font-bold">
                        Actual
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold">
                    {log.weightKg} kg
                    {deltaWeight !== null && (
                      <span
                        className={`block text-[10px] font-normal ${
                          deltaWeight <= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {deltaWeight <= 0 ? '↓' : '↑'} {deltaWeight > 0 ? `+${deltaWeight}` : deltaWeight} kg
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-[11px] font-medium">
                      {bmi}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    {log.bodyFatPct ? `${log.bodyFatPct}%` : '—'}
                    {deltaFat !== null && (
                      <span
                        className={`block text-[10px] font-normal ${
                          deltaFat <= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {deltaFat <= 0 ? '↓' : '↑'} {deltaFat > 0 ? `+${deltaFat}` : deltaFat}%
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    {log.muscleMassKg ? `${log.muscleMassKg} kg` : '—'}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    {log.waistCm ? `${log.waistCm} cm` : '—'}
                    {deltaWaist !== null && (
                      <span
                        className={`block text-[10px] font-normal ${
                          deltaWaist <= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {deltaWaist <= 0 ? '↓' : '↑'} {deltaWaist > 0 ? `+${deltaWaist}` : deltaWaist} cm
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    {log.abdomenCm ? `${log.abdomenCm} cm` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-on-surface-variant">
                    {log.activityFactor} FAF • {log.trainingDays}d/sem
                  </td>
                  <td className="py-3.5 px-4 text-on-surface-variant max-w-xs truncate" title={log.notes}>
                    {log.notes || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
