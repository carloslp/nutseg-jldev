import React from 'react';
import { NutritionRepository } from '@/lib/db/repository';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PatientDirectory } from '@/components/admin/PatientDirectory';

export default async function PacientesIndexPage() {
  const clients = await NutritionRepository.getClients();

  return (
    <AdminLayout>
      <PatientDirectory initialClients={clients} />
    </AdminLayout>
  );
}
