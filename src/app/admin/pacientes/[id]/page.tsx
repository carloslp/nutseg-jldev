import React from 'react';
import { notFound } from 'next/navigation';
import { NutritionRepository } from '@/lib/db/repository';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PatientHeader } from '@/components/admin/PatientHeader';
import { ClinicalAlertBanner } from '@/components/admin/ClinicalAlertBanner';
import { CheckInForm } from '@/components/admin/CheckInForm';
import { HistoryChart } from '@/components/admin/HistoryChart';
import { HistoryTable } from '@/components/admin/HistoryTable';
import { calculateBMI } from '@/lib/engine/macros';

export default async function PatientExpedientePage({
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
  const bmi = latestLog ? calculateBMI(latestLog.weightKg, client.heightCm) : undefined;

  return (
    <AdminLayout clientId={client.id} clientName={client.fullName}>
      <div className="flex flex-col gap-6 pb-12">
        {/* 1. Identity & Quick Actions */}
        <PatientHeader client={client} consultationCount={logs.length} />

        {/* 2. Permanent Medical Flag Banner */}
        <ClinicalAlertBanner flags={client.clinicalFlags} bmi={bmi} />

        {/* 3. Check-in Form & Evolution Chart Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5">
            <CheckInForm clientId={client.id} latestLog={latestLog} />
          </div>
          <div className="lg:col-span-7">
            <HistoryChart logs={logs} heightCm={client.heightCm} />
          </div>
        </div>

        {/* 4. Complete Inmutable History Table */}
        <HistoryTable logs={logs} heightCm={client.heightCm} />
      </div>
    </AdminLayout>
  );
}
