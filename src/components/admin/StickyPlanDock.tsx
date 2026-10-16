'use client';

import React from 'react';
import Link from 'next/link';

interface StickyPlanDockProps {
  clientId: string;
  targetKcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  isSaving: boolean;
  onSave: () => void;
  permalinkSlug?: string;
}

export function StickyPlanDock({
  clientId,
  targetKcal,
  proteinG,
  fatG,
  carbsG,
  isSaving,
  onSave,
  permalinkSlug,
}: StickyPlanDockProps) {
  return (
    <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/30 shadow-2xl z-40 py-3 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Summary Info */}
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-on-surface">Plan Clínico Listo</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="font-bold text-on-surface">{targetKcal.toLocaleString()} kcal</span>
            <span className="text-on-surface-variant/40">|</span>
            <span className="text-primary font-semibold">{proteinG}g P</span>
            <span className="text-on-surface-variant/40">·</span>
            <span className="text-amber-700 font-semibold">{fatG}g G</span>
            <span className="text-on-surface-variant/40">·</span>
            <span className="text-emerald-700 font-semibold">{carbsG}g C</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {permalinkSlug && (
            <Link
              href={`/plan/${permalinkSlug}`}
              target="_blank"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-[17px]">visibility</span>
              <span className="hidden sm:inline">Previsualizar</span>
            </Link>
          )}

          <Link
            href={`/admin/pacientes/${clientId}/permalink`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-secondary text-xs font-semibold transition-colors border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[17px]">share</span>
            <span className="hidden sm:inline">Despacho</span> WhatsApp
          </Link>

          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold transition-all shadow-md active:scale-[0.99] disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                <span>Guardar y Publicar Plan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
