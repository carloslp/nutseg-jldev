'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/admin/pacientes';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      if (isSignUp) {
        const { error, data } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data.session) {
          router.push(redirectTo);
          router.refresh();
        } else {
          setInfoMsg('Registro exitoso. Si Supabase requiere confirmación por email, revisa tu bandeja de entrada.');
        }
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data.session) {
          router.push(redirectTo);
          router.refresh();
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Error en las credenciales. Verifica tu usuario y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xl overflow-hidden">
      {/* Card Header */}
      <div className="p-8 border-b border-outline-variant/20 bg-surface-container-low/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols-outlined text-[22px]">ecg_heart</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-on-surface">BioMetrix Pro</h1>
            <p className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">
              Acceso Especialista • Nutrición & Biometría
            </p>
          </div>
        </div>
        <p className="text-xs text-on-surface-variant">
          {isSignUp
            ? 'Crea tu cuenta de especialista para gestionar expedientes clínicos y rutinas.'
            : 'Ingresa tus credenciales clínicas para acceder al panel de administración.'}
        </p>
      </div>

      {/* Form Body */}
      <form onSubmit={handleAuth} className="p-8 space-y-5">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{infoMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-on-surface mb-1.5">
            Correo Electrónico
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nutriologo@clinica.com"
              className="w-full px-3.5 py-2.5 pl-10 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-on-surface-variant">
              mail
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-on-surface">Contraseña</label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[11px] text-primary hover:underline font-medium"
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 pl-10 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-on-surface-variant">
              lock
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Validando credenciales...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">
                {isSignUp ? 'person_add' : 'login'}
              </span>
              <span>{isSignUp ? 'Registrar Especialista' : 'Iniciar Sesión en el Panel'}</span>
            </>
          )}
        </button>

        <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
          <span>{isSignUp ? '¿Ya tienes cuenta?' : '¿Primera vez en BioMetrix?'}</span>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className="text-primary font-semibold hover:underline"
          >
            {isSignUp ? 'Iniciar Sesión' : 'Crear Cuenta Especialista'}
          </button>
        </div>
      </form>

      {/* Footer Info */}
      <div className="p-4 bg-surface-container-low/60 border-t border-outline-variant/20 text-center">
        <span className="text-[11px] text-on-surface-variant font-mono">
          BioMetrix Pro v2.4 • Seguridad Criptográfica Supabase RLS
        </span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-surface-container-low flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-xs text-on-surface-variant">Cargando acceso...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
