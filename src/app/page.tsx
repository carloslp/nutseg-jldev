import Link from 'next/link';
import { NutritionRepository } from '@/lib/db/repository';

export default async function HomePage() {
  const clients = await NutritionRepository.getClients();
  const pilotClient = clients[0];
  const permalink = pilotClient ? await NutritionRepository.getPermalinkByClientId(pilotClient.id) : null;

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 md:p-12 max-w-5xl mx-auto">
      <header className="flex items-center justify-between border-b border-outline-variant/30 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-[24px]">vital_signs</span>
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight text-on-surface">BioMetrix Pro</h1>
            <p className="text-xs text-on-surface-variant">Sistema Clínico Nutricional & Visor Protegido</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          MVP v1.0 Activo
        </span>
      </header>

      <main className="py-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Card 1: Admin Panel */}
        <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/40 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-all">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">admin_panel_settings</span>
            </div>
            <h2 className="text-2xl font-bold font-display text-on-surface">Panel del Especialista</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Expediente clínico inmutable, histórico de mediciones, alertas médicas permanentes, motor de cálculo energético (Mifflin/Katch-McArdle) y gestión de enlaces WhatsApp.
            </p>
            <div className="bg-surface-container-low p-4 rounded-xl text-xs space-y-1.5 text-on-surface-variant">
              <div className="flex items-center justify-between">
                <span>Paciente piloto:</span>
                <strong className="text-on-surface">{pilotClient?.fullName}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>ID Clínico:</span>
                <span className="font-mono">#BIO-9942</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Condición:</span>
                <span className="text-amber-800 font-medium">Diabetes T2 / Lesión Tendón</span>
              </div>
            </div>
          </div>
          <div className="pt-8">
            <Link
              href={`/admin/pacientes/${pilotClient?.id || ''}`}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-medium text-sm transition-all shadow-sm active:scale-[0.99]"
            >
              <span>Abrir Expediente Clínico</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Card 2: Patient Protected Visor */}
        <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/40 shadow-sm flex flex-col justify-between hover:border-secondary/50 transition-all">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">smartphone</span>
            </div>
            <h2 className="text-2xl font-bold font-display text-on-surface">Visor Móvil del Paciente</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Enlace único protegido por PIN de 6 dígitos sin registro de usuario. Incluye metas diarias, menú de equivalentes SMAE, rutina de ejercicios y exportación a PDF.
            </p>
            <div className="bg-surface-container-low p-4 rounded-xl text-xs space-y-1.5 text-on-surface-variant">
              <div className="flex items-center justify-between">
                <span>Slug del Permalink:</span>
                <span className="font-mono text-secondary font-semibold">/plan/{permalink?.slugToken}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>PIN de Acceso:</span>
                <span className="font-mono font-bold bg-surface-container-high px-2 py-0.5 rounded text-on-surface">
                  {permalink?.passwordHintAdmin}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Estado de Acceso:</span>
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  {permalink?.isActive ? 'Habilitado' : 'Deshabilitado'}
                </span>
              </div>
            </div>
          </div>
          <div className="pt-8 flex flex-col gap-2">
            <Link
              href={`/plan/${permalink?.slugToken || 'k9x2m7p4q1w8'}`}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-secondary hover:bg-secondary-container text-on-secondary font-medium text-sm transition-all shadow-sm active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[18px]">lock_open</span>
              <span>Probar Visor del Paciente</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-outline-variant/30 pt-6 text-center text-xs text-on-surface-variant">
        NutSeg MVP &copy; 2026 BioMetrix Clinical Intelligence • Supabase Postgres & Permalink Engine
      </footer>
    </div>
  );
}
