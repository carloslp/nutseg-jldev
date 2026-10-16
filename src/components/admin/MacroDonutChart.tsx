'use client';

import React from 'react';

interface MacroDonutChartProps {
  targetKcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
}

export function MacroDonutChart({ targetKcal, proteinG, fatG, carbsG }: MacroDonutChartProps) {
  const proteinKcal = Math.round(proteinG * 4);
  const fatKcal = Math.round(fatG * 9);
  const carbsKcal = Math.round(carbsG * 4);
  const totalKcal = proteinKcal + fatKcal + carbsKcal || targetKcal || 1;

  const proteinPct = proteinKcal / totalKcal;
  const fatPct = fatKcal / totalKcal;
  const carbsPct = carbsKcal / totalKcal;

  const circumference = 251.3; // 2 * PI * 40
  const carbsLen = Math.round(circumference * carbsPct * 10) / 10;
  const fatLen = Math.round(circumference * fatPct * 10) / 10;
  const proteinLen = Math.round(circumference * proteinPct * 10) / 10;

  const fatOffset = -carbsLen;
  const proteinOffset = -(carbsLen + fatLen);

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant/15">
        <h3 className="font-display font-bold text-xs uppercase tracking-wider text-on-surface">
          Balance de Macronutrientes
        </h3>
        <span className="material-symbols-outlined text-primary text-[18px]">pie_chart</span>
      </div>

      {/* SVG Donut Chart */}
      <div className="relative w-40 h-40 mx-auto my-3 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" fill="transparent" r="40" stroke="#f1f5f9" strokeWidth="12" />
          {/* Carbs (Cyan/Indigo) */}
          <circle
            cx="50"
            cy="50"
            fill="transparent"
            r="40"
            stroke="#0ea5e9"
            strokeDasharray={`${carbsLen} ${circumference}`}
            strokeDashoffset="0"
            strokeWidth="12"
          />
          {/* Fat (Amber/Orange) */}
          <circle
            cx="50"
            cy="50"
            fill="transparent"
            r="40"
            stroke="#f59e0b"
            strokeDasharray={`${fatLen} ${circumference}`}
            strokeDashoffset={fatOffset}
            strokeWidth="12"
          />
          {/* Protein (Teal/Primary) */}
          <circle
            cx="50"
            cy="50"
            fill="transparent"
            r="40"
            stroke="#0d9488"
            strokeDasharray={`${proteinLen} ${circumference}`}
            strokeDashoffset={proteinOffset}
            strokeWidth="12"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-display font-bold text-xl text-on-surface leading-tight">
            {targetKcal.toLocaleString()}
          </span>
          <span className="text-[9px] font-mono font-bold tracking-widest text-on-surface-variant uppercase">
            Kcal / Día
          </span>
        </div>
      </div>

      {/* Macro Legend */}
      <div className="space-y-1.5 pt-1 text-xs">
        <div className="flex items-center justify-between text-on-surface">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
            <span className="font-medium">Proteína</span>
          </span>
          <span className="font-mono text-[11px] text-on-surface-variant">
            {proteinG}g ({proteinKcal} kcal • {Math.round(proteinPct * 100)}%)
          </span>
        </div>

        <div className="flex items-center justify-between text-on-surface">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="font-medium">Lípidos (Grasas)</span>
          </span>
          <span className="font-mono text-[11px] text-on-surface-variant">
            {fatG}g ({fatKcal} kcal • {Math.round(fatPct * 100)}%)
          </span>
        </div>

        <div className="flex items-center justify-between text-on-surface">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <span className="font-medium">Carbohidratos</span>
          </span>
          <span className="font-mono text-[11px] text-on-surface-variant">
            {carbsG}g ({carbsKcal} kcal • {Math.round(carbsPct * 100)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
