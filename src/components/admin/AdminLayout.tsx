'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
  clientId?: string;
  clientName?: string;
}

export function AdminLayout({ children, clientId = 'c1111111-1111-1111-1111-111111111111', clientName = 'Carlos Mendoza Silva' }: AdminLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Expediente & Biometría',
      href: `/admin/pacientes/${clientId}`,
      icon: 'vital_signs',
      active: pathname === `/admin/pacientes/${clientId}`,
    },
    {
      label: 'Motor Nutricional & SMAE',
      href: `/admin/pacientes/${clientId}/plan`,
      icon: 'calculate',
      active: pathname.includes('/plan') && !pathname.includes('/permalink'),
    },
    {
      label: 'Permalinks & WhatsApp',
      href: `/admin/pacientes/${clientId}/permalink`,
      icon: 'groups',
      active: pathname.includes('/permalink'),
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant/30 hidden lg:flex flex-col justify-between fixed inset-y-0 left-0 z-40">
        <div className="flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 gap-3 border-b border-outline-variant/20">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold">
              <span className="material-symbols-outlined text-[20px]">ecg_heart</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-semibold text-base text-on-surface leading-tight">BioMetrix Pro</span>
              <span className="text-[11px] text-on-surface-variant font-medium">Sports Nutrition Clinical</span>
            </div>
          </div>

          {/* Clinical Badge */}
          <div className="px-4 py-3">
            <div className="px-3 py-1.5 bg-surface-container rounded-lg flex items-center justify-between">
              <span className="text-xs text-primary font-semibold">Panel Clínico v2.4</span>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="flex flex-col gap-1 px-3 mt-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Sede Info */}
        <div className="p-4 border-t border-outline-variant/20">
          <div className="p-3 bg-surface-container-low rounded-lg flex flex-col gap-1">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Unidad Biomecánica
            </span>
            <span className="text-xs font-semibold text-on-surface">Sede Central — L-4</span>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-primary">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              <span>ISAK Nivel 1 Certificado</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-on-surface-variant hover:text-primary flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Inicio</span>
            </Link>
            <div className="h-4 w-px bg-outline-variant/40"></div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant">Paciente Activo:</span>
              <span className="text-sm font-semibold text-on-surface">{clientName}</span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-mono font-medium">#BIO-9942</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/admin/pacientes/${clientId}/permalink`}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-secondary text-xs font-medium transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">share</span>
              <span>Permalink</span>
            </Link>
            <Link
              href={`/admin/pacientes/${clientId}/plan`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-medium transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">auto_fix_high</span>
              <span>Motor Plan</span>
            </Link>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-4 md:p-8 max-w-[1500px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
