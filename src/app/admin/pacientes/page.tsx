import React from 'react';
import Link from 'next/link';
import { NutritionRepository } from '@/lib/db/repository';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default async function PacientesIndexPage() {
  const clients = await NutritionRepository.getClients();

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-on-surface">Expedientes de Pacientes</h1>
            <p className="text-xs text-on-surface-variant">
              Lista centralizada de seguimiento clínico y prescripción deportiva
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clients.map((c) => (
            <div
              key={c.id}
              className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col justify-between gap-4 hover:border-primary/40 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold text-base flex items-center justify-center">
                    {c.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-on-surface">{c.fullName}</h2>
                    <span className="text-xs text-on-surface-variant font-mono">
                      {c.sex === 'male' ? 'Hombre' : 'Mujer'} • {c.heightCm} cm
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                  Activo
                </span>
              </div>

              {c.clinicalFlags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {c.clinicalFlags.map((flag) => (
                    <span
                      key={flag}
                      className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200"
                    >
                      {flag.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/10">
                <Link
                  href={`/admin/pacientes/${c.id}`}
                  className="flex-1 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold text-center transition-all shadow-sm"
                >
                  Expediente & Check-ins
                </Link>
                <Link
                  href={`/admin/pacientes/${c.id}/plan`}
                  className="py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold text-center transition-all"
                >
                  Motor Plan
                </Link>
                <Link
                  href={`/admin/pacientes/${c.id}/permalink`}
                  className="py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-secondary text-xs font-semibold text-center transition-all"
                >
                  Permalink
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
