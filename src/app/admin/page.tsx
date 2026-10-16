import React from 'react';
import Link from 'next/link';
import { NutritionRepository } from '@/lib/db/repository';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default async function AdminDashboardPage() {
  const metrics = await NutritionRepository.getSystemMetrics();

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12">
        {/* Welcome Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                Unidad Biomecánica & Nutrición Clínica
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-on-surface">Panel de Control Clínico</h1>
            <p className="text-xs text-on-surface-variant">
              Monitoreo centralizado de pacientes, evolución antropométrica y estado de prescripciones
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/alimentos"
              className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[17px]">nutrition</span>
              <span>Catálogo SMAE</span>
            </Link>
            <Link
              href="/admin/ejercicios"
              className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[17px]">fitness_center</span>
              <span>Ejercicios</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Patients */}
          <div className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant mb-3">
              <span className="text-xs font-semibold">Pacientes Activos</span>
              <span className="p-2 rounded-xl bg-primary/10 text-primary material-symbols-outlined text-[20px]">
                groups
              </span>
            </div>
            <div>
              <div className="text-3xl font-display font-bold text-on-surface mb-1">
                {metrics.totalClients}
              </div>
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>En seguimiento regular</span>
              </p>
            </div>
          </div>

          {/* Check-ins Month */}
          <div className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant mb-3">
              <span className="text-xs font-semibold">Check-ins del Mes</span>
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 material-symbols-outlined text-[20px]">
                vital_signs
              </span>
            </div>
            <div>
              <div className="text-3xl font-display font-bold text-on-surface mb-1">
                {metrics.checkInsThisMonth}
              </div>
              <p className="text-[11px] text-on-surface-variant font-medium">
                Mediciones y pesajes registrados
              </p>
            </div>
          </div>

          {/* Permalinks Active/Inactive */}
          <div className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant mb-3">
              <span className="text-xs font-semibold">Permalinks Web</span>
              <span className="p-2 rounded-xl bg-cyan-50 text-cyan-700 material-symbols-outlined text-[20px]">
                share
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-display font-bold text-on-surface">
                  {metrics.activePermalinks}
                </span>
                <span className="text-xs text-on-surface-variant font-medium">
                  / {metrics.activePermalinks + metrics.inactivePermalinks}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-emerald-600 font-medium">
                  ● {metrics.activePermalinks} activos
                </span>
                {metrics.inactivePermalinks > 0 && (
                  <span className="text-rose-600 font-medium">
                    ● {metrics.inactivePermalinks} revocados
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Catalogs */}
          <div className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant mb-3">
              <span className="text-xs font-semibold">Base de Datos</span>
              <span className="p-2 rounded-xl bg-amber-50 text-amber-700 material-symbols-outlined text-[20px]">
                database
              </span>
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-on-surface mb-1">
                {metrics.totalFoods} <span className="text-xs font-normal text-on-surface-variant">alimentos</span>
              </div>
              <p className="text-[11px] text-on-surface-variant font-medium">
                {metrics.totalExercises} ejercicios biomecánicos
              </p>
            </div>
          </div>
        </div>

        {/* Recent Patients Section */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-base text-on-surface">Últimos Pacientes Atendidos</h2>
              <p className="text-xs text-on-surface-variant">Acceso rápido al expediente clínico y reajuste de plan</p>
            </div>
            <Link
              href="/admin/pacientes"
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              <span>Ver todos</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {metrics.recentClients.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[40px] text-outline mb-2">person_off</span>
              <p className="text-sm font-medium">No hay pacientes registrados aún.</p>
              <p className="text-xs mt-1">Haz clic en "+ Nuevo Paciente" para crear el primer expediente.</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/20">
              {metrics.recentClients.map((client) => (
                <div
                  key={client.id}
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-surface-container-low/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                      {client.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-on-surface">{client.fullName}</h3>
                      <p className="text-[11px] text-on-surface-variant font-mono">
                        {client.sex === 'male' ? 'Hombre' : 'Mujer'} • {client.heightCm} cm • {client.phoneWhatsapp || client.phone || 'Sin tel'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {client.clinicalFlags.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200">
                        {client.clinicalFlags.length} alerta{client.clinicalFlags.length > 1 ? 's' : ''}
                      </span>
                    )}
                    <Link
                      href={`/admin/pacientes/${client.id}`}
                      className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-all"
                    >
                      Expediente
                    </Link>
                    <Link
                      href={`/admin/pacientes/${client.id}/plan`}
                      className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold transition-all shadow-xs"
                    >
                      Plan
                    </Link>
                    <Link
                      href={`/admin/pacientes/${client.id}/permalink`}
                      className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-secondary text-xs font-semibold transition-all"
                    >
                      Link
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
