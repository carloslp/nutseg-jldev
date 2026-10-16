import React from 'react';
import { NutritionRepository } from '@/lib/db/repository';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { FoodCatalogManager } from '@/components/admin/FoodCatalogManager';

export default async function AlimentosIndexPage() {
  const foods = await NutritionRepository.getFoodCatalog();

  return (
    <AdminLayout>
      <FoodCatalogManager initialFoods={foods} />
    </AdminLayout>
  );
}
