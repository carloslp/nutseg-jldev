'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PatientPinGateProps {
  slug: string;
}

export function PatientPinGate({ slug }: PatientPinGateProps) {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/plan/${slug}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setIsBlocked(true);
          setErrorMsg(data.error || 'Acceso bloqueado por demasiados intentos.');
        } else {
          setErrorMsg(data.error || 'PIN incorrecto.');
        }
        return;
      }

      // Success: cookie has been set, refresh to load server-rendered plan
      router.refresh();
    } catch {
      setErrorMsg('Error de conexión al servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl p-6 md:p-8 border border-outline-variant/30 shadow-md flex flex-col gap-6 text-center">
        {/* Security Icon */}
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px]">lock</span>
        </div>

        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
            BioMetrix Pro • Permalink Seguro
          </span>
          <h2 className="font-display font-bold text-xl text-on-surface mt-2">
            Validación de Acceso
          </h2>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            Ingresa el PIN de acceso personal que tu especialista te compartió por WhatsApp para consultar tu plan.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium flex items-start gap-2 text-left">
            <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-2">
              Código / PIN del Plan
            </label>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value.toUpperCase())}
              disabled={isBlocked || isSubmitting}
              placeholder="Ej. NUT-482"
              maxLength={12}
              className="w-full text-center tracking-widest text-lg font-mono font-bold px-4 py-3 bg-surface-container-low border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest disabled:opacity-50"
              autoFocus
              required
            />
          </div>

          <button
            type="submit"
            disabled={isBlocked || isSubmitting || !pin.trim()}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>{isSubmitting ? 'Verificando credenciales...' : 'Ver mi plan'}</span>
          </button>
        </form>

        <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-center gap-1.5 text-[11px] text-outline">
          <span className="material-symbols-outlined text-[15px] text-emerald-700">shield</span>
          <span>Cifrado SSL 256-bit • Acceso Privado</span>
        </div>
      </div>
    </div>
  );
}
