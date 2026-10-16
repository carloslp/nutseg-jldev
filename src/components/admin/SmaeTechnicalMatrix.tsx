'use client';

import React from 'react';
import { MealScheduleItem } from '@/lib/types/clinical';
import { PortionAllocation, SMAE_GROUP_STANDARDS } from '@/lib/engine/smae';

interface SmaeTechnicalMatrixProps {
  schedule: MealScheduleItem[];
  targetAllocation: PortionAllocation;
  onPortionChange?: (mealIndex: number, group: keyof PortionAllocation, delta: number) => void;
}

export function SmaeTechnicalMatrix({
  schedule,
  targetAllocation,
  onPortionChange,
}: SmaeTechnicalMatrixProps) {
  const groups: { key: keyof PortionAllocation; label: string; uKcal: number; color: string }[] = [
    { key: 'vegetables', label: 'Verduras', uKcal: 25, color: 'bg-emerald-500' },
    { key: 'fruits', label: 'Frutas frescas', uKcal: 60, color: 'bg-cyan-500' },
    { key: 'cereals', label: 'Cereales y Tubérculos', uKcal: 70, color: 'bg-amber-500' },
    { key: 'legumes', label: 'Leguminosas', uKcal: 120, color: 'bg-orange-500' },
    { key: 'aoa', label: 'Origen Animal (AOA)', uKcal: 40, color: 'bg-teal-600' },
    { key: 'milk', label: 'Lácteos Descremados', uKcal: 95, color: 'bg-indigo-500' },
    { key: 'fats', label: 'Aceites y Grasas', uKcal: 45, color: 'bg-yellow-500' },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs overflow-hidden flex flex-col">
      <div className="p-5 border-b border-outline-variant/15 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-sm text-on-surface">
            Matriz Técnica de Porciones Equivalentes SMAE
          </h3>
          <p className="text-[11px] text-on-surface-variant">
            Distribución cuantitativa de raciones por tiempo de comida y balance calórico
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-surface-container text-primary text-[11px] font-semibold">
          SMAE 5ª Edición
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] tracking-wider font-semibold border-b border-outline-variant/15">
            <tr>
              <th className="py-3 px-4">Grupo SMAE</th>
              <th className="py-3 px-2 text-center">Aporte U.</th>
              {schedule.map((meal, idx) => (
                <th key={meal.id} className="py-3 px-2 text-center truncate max-w-[100px]">
                  {meal.name.split(' ')[0]}
                </th>
              ))}
              <th className="py-3 px-2 text-center">Total Asig.</th>
              <th className="py-3 px-2 text-center">Meta Rec.</th>
              <th className="py-3 px-3 text-center">Delta (Δ)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10 text-on-surface">
            {groups.map((g) => {
              // Calculate assigned total for this group across meals
              let totalAssigned = 0;
              schedule.forEach((meal) => {
                const portion = meal.portions.find((p) => p.group === g.key);
                if (portion) totalAssigned += portion.portions;
              });

              const target = targetAllocation[g.key] || 0;
              const delta = Math.round((totalAssigned - target) * 10) / 10;

              return (
                <tr key={g.key} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-on-surface">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${g.color}`}></span>
                      <span>{g.label}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center text-on-surface-variant font-mono">
                    {g.uKcal} kcal
                  </td>

                  {/* Meal cells */}
                  {schedule.map((meal, mIdx) => {
                    const portion = meal.portions.find((p) => p.group === g.key);
                    const qty = portion ? portion.portions : 0;

                    return (
                      <td key={meal.id} className="py-2 px-1 text-center">
                        <div className="inline-flex items-center gap-1 bg-surface-container-low px-2 py-0.5 rounded-lg border border-outline-variant/20 font-mono">
                          {onPortionChange && (
                            <button
                              type="button"
                              onClick={() => onPortionChange(mIdx, g.key, -0.5)}
                              disabled={qty <= 0}
                              className="text-on-surface-variant hover:text-rose-600 disabled:opacity-20 text-[10px] font-bold px-0.5"
                            >
                              -
                            </button>
                          )}
                          <span className="font-semibold text-xs min-w-[14px]">{qty}</span>
                          {onPortionChange && (
                            <button
                              type="button"
                              onClick={() => onPortionChange(mIdx, g.key, 0.5)}
                              className="text-on-surface-variant hover:text-emerald-600 text-[10px] font-bold px-0.5"
                            >
                              +
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  })}

                  <td className="py-3 px-2 text-center font-mono font-bold text-on-surface">
                    {totalAssigned.toFixed(1)}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-on-surface-variant">
                    {target.toFixed(1)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        Math.abs(delta) < 0.1
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : delta > 0
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </span>
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
