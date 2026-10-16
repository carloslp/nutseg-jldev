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

  // Expiration state
  const [expiresAt, setExpiresAt] = useState<string>(
    permalink.expiresAt ? permalink.expiresAt.split('T')[0] : ''
  );
  const [isSavingExp, setIsSavingExp] = useState(false);

  // Template selection
  const [selectedTemplate, setSelectedTemplate] = useState<'new_plan' | 'update' | 'reminder'>('new_plan');

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tudominio.com';
  const planUrl = `${origin}/plan/${permalink.slugToken}`;
  const firstName = client.fullName.split(' ')[0];

  const getTemplateMessage = () => {
    switch (selectedTemplate) {
      case 'new_plan':
        return `¡Hola, ${firstName}! 👋 Te comparto tu plan nutricional y rutina de entrenamiento personalizada en BioMetrix Pro:\n\n🔗 Accede a tu hoja aquí: ${planUrl}\n🔑 Tu clave de acceso personal es: *${pin}*\n\n(Tu enlace está protegido por PIN y puedes consultarlo en cualquier momento desde tu celular).`;
      case 'update':
        return `¡Hola, ${firstName}! 💪 Hemos actualizado tus macronutrientes y tu rutina de entrenamiento conforme a tu última consulta.\n\n🔗 Revisa tu nuevo plan actualizado aquí: ${planUrl}\n🔑 Tu clave de acceso es: *${pin}*\n\n¡Seguimos con todo en esta nueva fase!`;
      case 'reminder':
        return `¡Hola, ${firstName}! 📋 Te recordamos revisar tu hoja de equivalentes y plan de entrenamiento antes de tu próximo pesaje y consulta.\n\n🔗 Enlace a tu plan: ${planUrl}\n🔑 Tu clave de acceso: *${pin}*\n\nCualquier duda o síntoma, contáctame.`;
    }
  };

  const whatsappMessage = getTemplateMessage();

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
      setCopyStatus('¡PIN actualizado e historial de sesiones previas revocado de inmediato!');
      setTimeout(() => setCopyStatus(null), 4000);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error al guardar el PIN');
    } finally {
      setIsUpdatingPin(false);
    }
  };

  const handleSaveExpiration = async (newDate: string) => {
    setIsSavingExp(true);
    try {
      const iso = newDate ? new Date(`${newDate}T23:59:59Z`).toISOString() : null;
      const res = await fetch(`/api/plan/${permalink.slugToken}/expiration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresAt: iso }),
      });

      if (!res.ok) throw new Error('Error al actualizar fecha de vigencia');

      setExpiresAt(newDate);
      setCopyStatus('¡Fecha de vigencia actualizada!');
      setTimeout(() => setCopyStatus(null), 3000);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error al guardar vigencia');
    } finally {
      setIsSavingExp(false);
    }
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(`¡${label} copiado al portapapeles!`);
      setTimeout(() => setCopyStatus(null), 3000);
    } catch {
      setCopyStatus('Error al copiar');
    }
  };

  // Clean phone number for WhatsApp wa.me
  const cleanPhone = (client.phoneWhatsapp || client.phone || '').replace(/[^0-9]/g, '');

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
      {/* 1. Header & Quick Controls */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-xs flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/15 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">key</span>
              <h2 className="font-display font-semibold text-lg text-on-surface">
                Control de Acceso al Permalink
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              URL única protegida por PIN criptográfico e invalidación en vivo
            </p>
          </div>

          {/* Toggle Switch */}
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
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                isActive ? 'bg-primary' : 'bg-outline-variant'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
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
        <div className="p-4 bg-surface-container-low rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-outline-variant/20">
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block">
              URL Permanente del Paciente
            </span>
            <span className="font-mono text-xs sm:text-sm text-primary font-bold truncate block mt-0.5">
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

        {/* PIN Configuration */}
        <div className="p-4 bg-surface-container-low rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-outline-variant/20">
          <div>
            <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block">
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
                  {isUpdatingPin ? 'Guardando...' : 'Guardar y Revocar'}
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
                  className="text-xs text-primary hover:underline flex items-center gap-0.5 font-medium ml-2"
                >
                  <span className="material-symbols-outlined text-[15px]">edit</span>
                  <span>Cambiar PIN</span>
                </button>
              </div>
            )}
          </div>

          <div className="text-left sm:text-right text-xs text-on-surface-variant">
            <span className="font-medium text-on-surface block">Seguridad Inmediata:</span>
            <span>Al cambiar el PIN, todas las sesiones activas en el celular se cierran al instante.</span>
          </div>
        </div>

        {/* Expiration Date Selector */}
        <div className="p-4 bg-surface-container-low rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-outline-variant/20">
          <div>
            <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block">
              Vigencia / Fecha de Expiración
            </span>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => handleSaveExpiration(e.target.value)}
                disabled={isSavingExp}
                className="px-3 py-1 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-xs font-mono text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {expiresAt && (
                <button
                  onClick={() => handleSaveExpiration('')}
                  className="text-xs text-rose-700 hover:underline"
                >
                  Remover fecha
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => {
                const d = new Date();
                d.setDate(d.getDate() + 15);
                handleSaveExpiration(d.toISOString().split('T')[0]);
              }}
              className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-[11px] font-medium text-on-surface"
            >
              +15 Días
            </button>
            <button
              onClick={() => {
                const d = new Date();
                d.setDate(d.getDate() + 30);
                handleSaveExpiration(d.toISOString().split('T')[0]);
              }}
              className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-[11px] font-medium text-on-surface"
            >
              +30 Días
            </button>
            <button
              onClick={() => {
                const d = new Date();
                d.setDate(d.getDate() + 60);
                handleSaveExpiration(d.toISOString().split('T')[0]);
              }}
              className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-[11px] font-medium text-on-surface"
            >
              +60 Días
            </button>
          </div>
        </div>

        {/* Telemetries / Access Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-surface-container-low rounded-xl text-xs border border-outline-variant/15">
            <span className="text-[10px] text-on-surface-variant font-medium block">Total de Aperturas</span>
            <span className="font-display font-bold text-lg text-on-surface">{permalink.accessCount}</span>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl text-xs border border-outline-variant/15">
            <span className="text-[10px] text-on-surface-variant font-medium block">Último Acceso</span>
            <span className="font-mono text-xs font-medium text-on-surface">
              {permalink.lastAccessedAt ? permalink.lastAccessedAt.split('T')[0] : 'Sin aperturas aún'}
            </span>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl text-xs border border-outline-variant/15 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-on-surface-variant font-medium block">Estado de Enlace</span>
            <span className="font-semibold text-xs text-emerald-700 flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {isActive ? 'Vigente & Activo' : 'Revocado'}
            </span>
          </div>
        </div>
      </section>

      {/* 2. WhatsApp Dispatch Simulator & Message Templates */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-xs flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">chat</span>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-on-surface">Despacho de Acceso por WhatsApp</h3>
              <p className="text-[11px] text-on-surface-variant">Selecciona una plantilla y envíala directamente a su celular</p>
            </div>
          </div>

          {/* Template Chips */}
          <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-xl">
            <button
              onClick={() => setSelectedTemplate('new_plan')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedTemplate === 'new_plan'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Plan Nuevo
            </button>
            <button
              onClick={() => setSelectedTemplate('update')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedTemplate === 'update'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Actualización
            </button>
            <button
              onClick={() => setSelectedTemplate('reminder')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedTemplate === 'reminder'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Recordatorio
            </button>
          </div>
        </div>

        {/* WhatsApp Chat Simulation Bubble */}
        <div className="p-4 bg-[#e5ddd5]/40 rounded-2xl border border-outline-variant/20 flex flex-col items-start">
          <div className="bg-[#f0fdf4] text-emerald-950 p-4 rounded-2xl rounded-tl-sm border border-emerald-200/60 max-w-lg shadow-xs text-xs whitespace-pre-line leading-relaxed font-sans">
            {whatsappMessage}
            <div className="text-[10px] text-emerald-700/70 text-right mt-2 flex items-center justify-end gap-1 font-mono">
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="material-symbols-outlined text-[13px] text-emerald-600">done_all</span>
            </div>
          </div>
        </div>

        {/* Dispatch Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => handleCopy(whatsappMessage, 'Mensaje de WhatsApp')}
            className="flex-1 py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">content_copy</span>
            <span>Copiar Mensaje</span>
          </button>

          {cleanPhone ? (
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>Enviar por WhatsApp ({client.phoneWhatsapp || client.phone})</span>
            </a>
          ) : (
            <button
              disabled
              className="flex-1 py-2.5 px-4 rounded-xl bg-surface-container text-on-surface-variant font-semibold text-xs opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
              title="El paciente no tiene teléfono registrado"
            >
              <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
              <span>Sin teléfono registrado</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
