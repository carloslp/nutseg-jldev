import React from 'react';
import { ClinicalFlag } from '@/lib/types/clinical';

interface ClinicalAlertBannerProps {
  flags: ClinicalFlag[];
  bmi?: number;
}

export function ClinicalAlertBanner({ flags, bmi }: ClinicalAlertBannerProps) {
  const hasRisk =
    flags.length > 0 || (typeof bmi === 'number' && (bmi < 18.5 || bmi >= 30));

  if (!hasRisk) return null;

  return (
    <aside className="relative overflow-hidden rounded-2xl bg-amber-50/90 border border-amber-300/80 p-5 shadow-sm">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-600"></div>
      <div className="flex items-start gap-3.5 pl-2">
        <div className="p-2 rounded-xl bg-amber-100 text-amber-900 shrink-0">
          <span className="material-symbols-outlined text-[24px]">gpp_maybe</span>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-amber-950 font-bold tracking-wider uppercase flex items-center gap-1.5">
              <span>Bandera Roja Clínica: Protocolo Médico Activo</span>
            </span>
            <span className="text-[11px] text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded font-mono font-medium">
              CIE-10: E11.9 / M76.51
            </span>
          </div>
          <p className="text-xs text-amber-900 mt-1 leading-relaxed">
            Paciente con condición clínica reportada:{' '}
            <strong className="font-semibold text-amber-950">
              Restricción de alto aporte proteico (&le; 2.0 g/kg)
            </strong>{' '}
            y contraindicación de déficit calórico agresivo por sensibilidad metabólica y glucémica. En prescripción de fuerza, sustituir ejercicios con estrés patelar directo en rodilla derecha.
          </p>
        </div>
      </div>
    </aside>
  );
}
