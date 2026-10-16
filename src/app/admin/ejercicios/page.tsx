import React from 'react';
import { NutritionRepository } from '@/lib/db/repository';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ExerciseCatalogManager } from '@/components/admin/ExerciseCatalogManager';

export default async function EjerciciosIndexPage() {
  const exercises = await NutritionRepository.getExerciseCatalog();

  return (
    <AdminLayout>
      <ExerciseCatalogManager initialExercises={exercises} />
    </AdminLayout>
  );
}
