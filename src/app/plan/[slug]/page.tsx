import React from 'react';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { NutritionRepository } from '@/lib/db/repository';
import { verifySessionToken } from '@/lib/security/auth';
import { PatientPinGate } from '@/components/patient/PatientPinGate';
import { PatientVisorView } from '@/components/patient/PatientVisorView';

export const metadata = {
  title: 'Mi Plan Nutricional • BioMetrix Pro',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PatientPlanPermalinkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const permalink = await NutritionRepository.getPermalinkBySlug(slug);

  if (!permalink) {
    notFound();
  }

  // CA-3.2: Deshabilitación inmediata del Permalink (Revocación de acceso)
  if (!permalink.isActive) {
    return (
      <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-6 text-center">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 shadow-sm flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[36px]">link_off</span>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full">
              Enlace Inactivo
            </span>
            <h1 className="font-display font-bold text-2xl text-on-surface">
              Acceso Temporalmente Deshabilitado
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Este enlace de plan nutricional se encuentra inactivo. Contacta a tu especialista para reactivarlo.
            </p>
          </div>

          <div className="w-full pt-4 border-t border-outline-variant/20 flex flex-col gap-2 text-xs text-outline">
            <span>BioMetrix Pro Clinical Intelligence</span>
            <span>ID de consulta: #{slug}</span>
          </div>
        </div>
      </div>
    );
  }

  // CA-3.1 & CA-3.3: Verificación de sesión mediante cookie HttpOnly y hash vigente del PIN
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('nutseg_session');

  const sessionCheck = sessionCookie
    ? verifySessionToken(sessionCookie.value, permalink.passwordHash)
    : { isValid: false };

  // If unauthenticated or PIN was changed, show PIN gate
  if (!sessionCheck.isValid || sessionCheck.slug !== slug) {
    return <PatientPinGate slug={slug} />;
  }

  // Load client and plan securely from server
  const client = await NutritionRepository.getClientById(permalink.clientId);
  if (!client) {
    notFound();
  }

  const plan = permalink.currentPlanId
    ? await NutritionRepository.getActivePlan(client.id)
    : await NutritionRepository.getActivePlan(client.id);

  if (!plan) {
    return (
      <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-6 text-center">
        <p className="text-sm text-on-surface-variant">Tu plan está en proceso de elaboración por tu especialista.</p>
      </div>
    );
  }

  return <PatientVisorView client={client} plan={plan} permalink={permalink} />;
}
