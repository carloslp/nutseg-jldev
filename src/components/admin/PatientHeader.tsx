'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClientProfile } from '@/lib/types/clinical';
import { EditPatientModal } from './EditPatientModal';

interface PatientHeaderProps {
  client: ClientProfile;
  consultationCount: number;
}

export function PatientHeader({ client: initialClient, consultationCount }: PatientHeaderProps) {
  const router = useRouter();
  const [client, setClient] = useState<ClientProfile>(initialClient);
  const [isEditOpen, setIsEditOpen] = useState(false);

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
              ID: #{client.id.slice(0, 8)}
            </span>
            <span className="text-[11px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              {client.isActive !== false ? 'Fase Activa' : 'Inactivo'}
            </span>
            <button
              onClick={() => setIsEditOpen(true)}
              className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center gap-1 transition-colors"
              title="Editar ficha del paciente"
            >
              <span className="material-symbols-outlined text-[14px]">edit</span>
              <span>Editar Ficha</span>
            </button>
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
            {client.phoneWhatsapp && (
              <>
                <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <span className="material-symbols-outlined text-[14px]">chat</span>
                  {client.phoneWhatsapp}
                </span>
              </>
            )}
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <span className="flex items-center gap-1 text-primary font-medium">
              <span className="material-symbols-outlined text-[15px]">schedule</span>
              {consultationCount} Consultas registradas
            </span>
          </div>

          {/* Clinical Flags Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {client.clinicalFlags.map((flag) => (
              <span
                key={flag}
                className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-[11px] font-medium px-2.5 py-1 rounded-full border border-amber-200"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                {flag.replace(/_/g, ' ')}
              </span>
            ))}
            {client.allergies.length > 0 && (
              <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 text-[11px] font-medium px-2.5 py-1 rounded-full border border-rose-200">
                <span className="material-symbols-outlined text-[13px]">no_food</span>
                Alergias: {client.allergies.join(', ')}
              </span>
            )}
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

      {isEditOpen && (
        <EditPatientModal
          client={client}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onUpdated={(updated) => {
            setClient(updated);
            setIsEditOpen(false);
            router.refresh();
          }}
        />
      )}
    </section>
  );
}
