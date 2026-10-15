'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClientProfile, PermalinkRecord } from '@/lib/types/clinical';

interface PermalinkManagerProps {
  client: ClientProfile;
  permalink: PermalinkRecord;
}

export function PermalinkManager({ client, permalink }: PermalinkManagerProps) {
  const router = useRouter();
  const [isActive, setIsActive] = useState<boolean>(permalink.isActive);
  const [pin, setPin] = useState<string>(permalink.passwordHintAdmin);
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // Origin for public link
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tudominio.com';
  const planUrl = `${origin}/plan/${permalink.slugToken}`;

  // WhatsApp formatted message
  const whatsappMessage = `¡Hola, ${client.fullName.split(' ')[0]}! 👋 Te comparto tu plan nutricional y rutina de entrenamiento personalizada en BioMetrix Pro:\n\n🔗 Accede a tu hoja aquí: ${planUrl}\n🔑 Tu clave de acceso personal es: *${pin}*\n\n(Tu enlace está protegido y puedes consultarlo en cualquier momento desde tu celular).`;

  // Toggle active status (CA-3.2)
  const handleToggleActive = async () => {
    setIsToggling(true);
    const newStatus = !isActive;
    try {
      const res = await fetch(`/api/plan/${permalink.slugToken}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!res.ok) throw new Error('Error al cambiar el estado del permalink');

      setIsActive(newStatus);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado');
    } finally {
      setIsToggling(false);
    }
  };

  // Update PIN and invalidate sessions (CA-3.3)
  const handleSavePin = async () => {
    setIsUpdatingPin(true);
    try {
      const res = await fetch(`/api/plan/${permalink.slugToken}/pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPin: pin }),
      });

      if (!res.ok) throw new Error('Error al actualizar el PIN');

      setIsEditingPin(false);
      setCopyStatus('¡PIN actualizado e historial de sesiones previas revocado!');
      setTimeout(() => setCopyStatus(null), 4000);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error al guardar el PIN');
    } finally {
      setIsUpdatingPin(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(`¡${label} copiado al portapapeles!`);
      setTimeout(() => setCopyStatus(null), 3000);
    } catch {
      setCopyStatus('Error al copiar');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* 1. Status and Primary Controls */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[24px]">key</span>
              <h2 className="font-display font-semibold text-lg text-on-surface">
                Control de Acceso al Permalink
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              URL única protegida por PIN criptográfico e invalidación en vivo
            </p>
          </div>

          {/* Toggle is_active Switch (CA-3.2) */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-on-surface">
              {isActive ? (
                <span className="text-emerald-700 flex items-center gap-1 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  Acceso Activo
                </span>
              ) : (
                <span className="text-rose-700 flex items-center gap-1 font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  Acceso Revocado
                </span>
              )}
            </span>

            <button
              onClick={handleToggleActive}
              disabled={isToggling}
              className={`w-13 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                isActive ? 'bg-primary' : 'bg-outline-variant'
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  isActive ? 'translate-x-6' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>
        </div>

        {copyStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{copyStatus}</span>
          </div>
        )}

        {/* Permalink URL Display */}
        <div className="p-4 bg-surface-container-low rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">
              URL Permanente del Paciente
            </span>
            <span className="font-mono text-sm text-secondary font-bold truncate block mt-0.5">
              {planUrl}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleCopy(planUrl, 'Enlace')}
              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-medium text-on-surface flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              <span>Copiar URL</span>
            </button>
            <a
              href={planUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-xs font-semibold text-primary flex items-center gap-1 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              <span>Abrir Visor</span>
            </a>
          </div>
        </div>

        {/* PIN Configuration (CA-3.3) */}
        <div className="p-4 bg-surface-container-low rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">
              Contraseña / PIN de Acceso
            </span>
            {isEditingPin ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.toUpperCase())}
                  className="px-3 py-1 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-sm font-mono font-bold text-on-surface focus:outline-none focus:ring-1 focus:ring-primary w-32"
                />
                <button
                  onClick={handleSavePin}
                  disabled={isUpdatingPin}
                  className="px-3 py-1 bg-primary text-on-primary rounded-lg text-xs font-semibold"
                >
                  {isUpdatingPin ? 'Guardando...' : 'Guardar y Revocar Anteriores'}
                </button>
                <button
                  onClick={() => setIsEditingPin(false)}
                  className="px-2 py-1 text-xs text-on-surface-variant hover:text-on-surface"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-base font-bold text-on-surface px-2.5 py-0.5 rounded bg-surface-container-lowest border border-outline-variant/30">
                  {pin}
                </span>
                <button
                  onClick={() => setIsEditingPin(true)}
                  className="text-xs text-secondary hover:underline flex items-center gap-0.5 font-medium ml-2"
                >
                  <span className="material-symbols-outlined text-[15px]">edit</span>
                  <span>Cambiar PIN</span>
                </button>
              </div>
            )}
          </div>

          <div className="text-right">
            <span className="text-[11px] text-on-surface-variant block">Sesiones previas:</span>
            <span className="text-xs text-outline">
              Al cambiar el PIN, todas las sesiones abiertas en el celular del paciente se cierran de inmediato.
            </span>
          </div>
        </div>

        {/* WhatsApp Dispatch Section */}
        <div className="p-5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">chat</span>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-emerald-950">Despacho Inmediato por WhatsApp</h3>
              <p className="text-[11px] text-emerald-800">
                Envía el acceso seguro listo para consultar desde su celular
              </p>
            </div>
          </div>

          <div className="p-3 bg-white/90 rounded-xl border border-emerald-100 text-xs font-mono text-on-surface whitespace-pre-line leading-relaxed">
            {whatsappMessage}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleCopy(whatsappMessage, 'Mensaje de WhatsApp')}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[18px]">content_copy</span>
              <span>Copiar mensaje para WhatsApp</span>
            </button>
            {client.phoneWhatsapp && (
              <a
                href={`https://wa.me/${client.phoneWhatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  whatsappMessage
                )}`}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-emerald-900 font-semibold text-xs transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>Enviar Directo</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 2. Access Telemetry & Security Metrics */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm">
        <h3 className="font-display font-semibold text-base text-on-surface mb-4">
          Telemetría y Control de Aperturas
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-surface-container-low rounded-xl">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">
              Veces Abierto por el Paciente
            </span>
            <span className="text-2xl font-bold font-mono text-on-surface block my-1">
              {permalink.accessCount} aperturas
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">Frecuencia recomendada: &ge; 3/sem</span>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">
              Última Visualización
            </span>
            <span className="text-sm font-semibold font-mono text-on-surface block my-1">
              {permalink.lastAccessedAt ? new Date(permalink.lastAccessedAt).toLocaleString('es-MX') : 'Sin aperturas aún'}
            </span>
            <span className="text-[11px] text-on-surface-variant">Conexión validada por PIN</span>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">
              Vigencia del Enlace
            </span>
            <span className="text-sm font-semibold font-mono text-primary block my-1">
              {permalink.expiresAt ? new Date(permalink.expiresAt).toLocaleDateString('es-MX') : '30 días estándar'}
            </span>
            <span className="text-[11px] text-on-surface-variant">Renovación manual con cada consulta</span>
          </div>
        </div>
      </section>
    </div>
  );
}
