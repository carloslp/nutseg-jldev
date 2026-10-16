'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { NewPatientModal } from './NewPatientModal';
import { createClient } from '@/lib/supabase/client';

interface AdminLayoutProps {
  children: React.ReactNode;
  clientId?: string;
  clientName?: string;
}

export function AdminLayout({
  children,
  clientId,
  clientName,
}: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isClientView = Boolean(clientId && pathname.includes(`/admin/pacientes/${clientId}`));

  const globalNav = [
    {
      label: 'Panel Principal',
      href: '/admin',
      icon: 'dashboard',
      active: pathname === '/admin',
    },
    {
      label: 'Pacientes',
      href: '/admin/pacientes',
      icon: 'groups',
      active: pathname === '/admin/pacientes',
    },
    {
      label: 'Catálogo SMAE',
      href: '/admin/alimentos',
      icon: 'nutrition',
      active: pathname.startsWith('/admin/alimentos'),
    },
    {
      label: 'Catálogo Ejercicios',
      href: '/admin/ejercicios',
      icon: 'fitness_center',
      active: pathname.startsWith('/admin/ejercicios'),
    },
  ];

  const clientNav = clientId
    ? [
        {
          label: 'Expediente & Biometría',
          href: `/admin/pacientes/${clientId}`,
          icon: 'vital_signs',
          active: pathname === `/admin/pacientes/${clientId}`,
        },
        {
          label: 'Motor Nutricional',
          href: `/admin/pacientes/${clientId}/plan`,
          icon: 'calculate',
          active: pathname.endsWith('/plan'),
        },
        {
          label: 'Entrenamiento',
          href: `/admin/pacientes/${clientId}/entrenamiento`,
          icon: 'exercise',
          active: pathname.endsWith('/entrenamiento'),
        },
        {
          label: 'Permalink & WhatsApp',
          href: `/admin/pacientes/${clientId}/permalink`,
          icon: 'share',
          active: pathname.endsWith('/permalink'),
        },
      ]
    : [];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
      window.location.href = '/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex text-on-surface">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant/30 hidden lg:flex flex-col justify-between fixed inset-y-0 left-0 z-40">
        <div className="flex flex-col">
          {/* Logo */}
          <Link href="/admin" className="h-16 flex items-center px-6 gap-3 border-b border-outline-variant/20 hover:bg-surface-container/50 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold shadow-sm">
              <span className="material-symbols-outlined text-[20px]">ecg_heart</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-semibold text-base text-on-surface leading-tight">BioMetrix Pro</span>
              <span className="text-[11px] text-on-surface-variant font-medium">Sports Clinical Nutrition</span>
            </div>
          </Link>

          {/* Quick Action: New Patient Button */}
          <div className="p-3">
            <button
              onClick={() => setIsNewPatientOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>+ Nuevo Paciente</span>
            </button>
          </div>

          {/* Global Nav List */}
          <div className="px-4 pt-1 pb-1">
            <span className="text-[10px] text-on-surface-variant/70 uppercase tracking-wider font-bold">
              Gestión Clínica
            </span>
          </div>
          <nav className="flex flex-col gap-1 px-3">
            {globalNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  item.active
                    ? 'bg-surface-container-high text-primary font-semibold shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Contextual Client Nav if active */}
          {isClientView && clientId && (
            <div className="mt-4 pt-3 border-t border-outline-variant/20">
              <div className="px-4 pb-1.5 flex items-center justify-between">
                <span className="text-[10px] text-on-surface-variant/70 uppercase tracking-wider font-bold">
                  Paciente Seleccionado
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="px-3 pb-2">
                <div className="p-2 bg-surface-container-low rounded-lg border border-outline-variant/20">
                  <p className="text-xs font-semibold text-on-surface truncate">{clientName || 'Paciente Activo'}</p>
                </div>
              </div>
              <nav className="flex flex-col gap-1 px-3">
                {clientNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      item.active
                        ? 'bg-primary text-on-primary font-semibold shadow-xs'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>

        {/* Bottom Sede Info & Logout */}
        <div className="p-4 border-t border-outline-variant/20 space-y-3">
          <div className="p-2.5 bg-surface-container-low rounded-xl flex flex-col gap-1 border border-outline-variant/20">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Unidad Biomecánica
            </span>
            <span className="text-xs font-semibold text-on-surface">Sede Central — L-4</span>
            <div className="flex items-center gap-1 mt-0.5 text-[11px] text-primary">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              <span>ISAK Nivel 1 • RLS Activo</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-200"
          >
            <span className="material-symbols-outlined text-[17px]">logout</span>
            <span>{isLoggingOut ? 'Saliendo...' : 'Cerrar Sesión'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/pacientes"
              className="text-xs text-on-surface-variant hover:text-primary flex items-center gap-1 font-medium"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span className="hidden sm:inline">Pacientes</span>
            </Link>
            {clientName && (
              <>
                <div className="h-4 w-px bg-outline-variant/40"></div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant hidden md:inline">Paciente:</span>
                  <span className="text-sm font-semibold text-on-surface truncate max-w-[180px] sm:max-w-none">
                    {clientName}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsNewPatientOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-medium transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span className="hidden sm:inline">Nuevo Paciente</span>
            </button>

            {clientId && (
              <>
                <Link
                  href={`/admin/pacientes/${clientId}/permalink`}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-secondary text-xs font-medium transition-all border border-outline-variant/30"
                >
                  <span className="material-symbols-outlined text-[16px]">share</span>
                  <span>Permalink</span>
                </Link>
                <Link
                  href={`/admin/pacientes/${clientId}/plan`}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">auto_fix_high</span>
                  <span>Motor Plan</span>
                </Link>
              </>
            )}

            <button
              onClick={handleLogout}
              className="lg:hidden p-1.5 rounded-lg text-rose-700 hover:bg-rose-50"
              title="Cerrar sesión"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-4 md:p-8 max-w-[1500px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* New Patient Modal */}
      <NewPatientModal
        isOpen={isNewPatientOpen}
        onClose={() => setIsNewPatientOpen(false)}
      />
    </div>
  );
}
