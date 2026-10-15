import React from 'react';
import { notFound } from 'next/navigation';
import { NutritionRepository } from '@/lib/db/repository';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PermalinkManager } from '@/components/admin/PermalinkManager';

export default async function PatientPermalinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await NutritionRepository.getClientById(id);

  if (!client) {
    notFound();
  }

  let permalink = await NutritionRepository.getPermalinkByClientId(id);

  if (!permalink) {
    // Generate default permalink if none exists
    permalink = await NutritionRepository.createOrUpdatePermalink({
      clientId: id,
      pin: 'NUT-482',
    });
  }

  return (
    <AdminLayout clientId={client.id} clientName={client.fullName}>
      <PermalinkManager client={client} permalink={permalink} />
    </AdminLayout>
  );
}
