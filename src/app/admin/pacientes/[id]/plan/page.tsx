import React from 'react';
import { notFound } from 'next/navigation';
import { NutritionRepository } from '@/lib/db/repository';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PlanGenerator } from '@/components/admin/PlanGenerator';

export default async function PatientPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await NutritionRepository.getClientById(id);

  if (!client) {
    notFound();
  }

  const logs = await NutritionRepository.getBiometricLogs(id);
  const latestLog = logs[logs.length - 1];

  if (!latestLog) {
    return (
      <AdminLayout clientId={client.id} clientName={client.fullName}>
        <div className="p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 text-center">
          <p className="text-sm text-on-surface-variant">
            Se requiere al menos una consulta registrada con peso para ejecutar el motor algorítmico.
          </p>
        </div>
      </AdminLayout>
    );
  }

  const existingPlan = await NutritionRepository.getActivePlan(id);
  const pastPlans = await NutritionRepository.getPlans(id);
  const permalink = await NutritionRepository.getPermalinkByClientId(id);

  return (
    <AdminLayout clientId={client.id} clientName={client.fullName}>
      <PlanGenerator
        client={client}
        latestLog={latestLog}
        existingPlan={existingPlan}
        pastPlans={pastPlans}
        permalinkSlug={permalink?.slugToken}
      />
    </AdminLayout>
  );
}
