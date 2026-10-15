import React from 'react';
import Link from 'next/link';
import { ClientProfile } from '@/lib/types/clinical';

interface PatientHeaderProps {
  client: ClientProfile;
  consultationCount: number;
}

export function PatientHeader({ client, consultationCount }: PatientHeaderProps) {
  // Calculate age from birthDate
  const birthYear = new Date(client.birthDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6">
      <div className="flex items-start md:items-center gap-5 min-w-0">
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-display font-bold text-xl text-primary shadow-inner">
            {client.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-primary text-on-primary text-[10px] font-bold items-center justify-center">
              {consultationCount}
            </span>
          </span>
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-on-surface tracking-tight">
              {client.fullName}
            </h1>
            <span className="bg-surface-container-high text-on-surface-variant text-[11px] font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">
              ID: #BIO-9942
            </span>
            <span className="text-[11px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified</span> Fase Activa
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-on-surface-variant text-xs mt-1.5">
            <span>
              <strong className="text-on-surface font-semibold">Edad:</strong> {age} años ({client.birthDate})
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <span>
              <strong className="text-on-surface font-semibold">Sexo:</strong> {client.sex === 'male' ? 'Masculino' : 'Femenino'}
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <span>
              <strong className="text-on-surface font-semibold">Estatura:</strong> {client.heightCm} cm
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <span className="flex items-center gap-1 text-primary font-medium">
              <span className="material-symbols-outlined text-[15px]">schedule</span>
              {consultationCount} Consultas registradas
            </span>
          </div>

          {/* Clinical Flags Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {client.clinicalFlags.includes('diabetes_type_2') && (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-[11px] font-medium px-2.5 py-1 rounded-full border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Diabetes Tipo II (Controlada)
              </span>
            )}
            {client.clinicalFlags.includes('knee_injury') && (
              <span className="inline-flex items-center gap-1.5 bg-surface-container text-secondary text-[11px] font-medium px-2.5 py-1 rounded-full border border-secondary/20">
                <span className="material-symbols-outlined text-[13px]">healing</span>
                Lesión tendón rotuliano derecho (Fase remodelación)
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 bg-surface-container-high text-on-surface text-[11px] font-medium px-2.5 py-1 rounded-full">
              <span className="material-symbols-outlined text-[13px]">tune</span>
              Objetivo: Recomposición corporal & Déficit seguro
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 self-end xl:self-center">
        <Link
          href={`/admin/pacientes/${client.id}/permalink`}
          className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-low hover:bg-surface-container text-secondary font-medium text-xs rounded-xl border border-secondary/20 transition-all active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">share</span>
          <span>Gestionar Permalink</span>
        </Link>
        <Link
          href={`/admin/pacientes/${client.id}/plan`}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary hover:bg-primary-container font-medium text-xs rounded-xl shadow-sm transition-all active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
          <span>Generar Plan con Algoritmo</span>
        </Link>
      </div>
    </section>
  );
}
