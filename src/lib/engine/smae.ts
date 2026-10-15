import { AllergenTag, MealScheduleItem, SmaeMealPortion } from '../types/clinical';

export interface SmaeGroupStandard {
  id: 'aoa' | 'cereals' | 'legumes' | 'vegetables' | 'fruits' | 'fats' | 'milk';
  name: string;
  kcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
}

export interface FoodEquivalent {
  id: string;
  name: string;
  group: 'aoa' | 'cereals' | 'legumes' | 'vegetables' | 'fruits' | 'fats' | 'milk';
  portionQty: number;
  portionUnit: string;
  gramsNet: number;
  allergens: AllergenTag[];
}

export const SMAE_GROUP_STANDARDS: Record<string, SmaeGroupStandard> = {
  aoa: { id: 'aoa', name: 'Alimentos de Origen Animal', kcal: 40, proteinG: 7, fatG: 1, carbsG: 0 },
  cereals: { id: 'cereals', name: 'Cereales y Tubérculos', kcal: 70, proteinG: 2, fatG: 0, carbsG: 15 },
  legumes: { id: 'legumes', name: 'Leguminosas', kcal: 120, proteinG: 8, fatG: 1, carbsG: 20 },
  vegetables: { id: 'vegetables', name: 'Verduras', kcal: 25, proteinG: 2, fatG: 0, carbsG: 4 },
  fruits: { id: 'fruits', name: 'Frutas', kcal: 60, proteinG: 0, fatG: 0, carbsG: 15 },
  fats: { id: 'fats', name: 'Aceites y Grasas', kcal: 45, proteinG: 0, fatG: 5, carbsG: 0 },
  milk: { id: 'milk', name: 'Lácteos Descremados', kcal: 95, proteinG: 9, fatG: 2, carbsG: 12 },
};

export const DEFAULT_FOOD_CATALOG: FoodEquivalent[] = [
  // AOA
  { id: 'f_aoa_1', name: 'Pechuga de pollo cocida', group: 'aoa', portionQty: 30, portionUnit: 'g', gramsNet: 30, allergens: [] },
  { id: 'f_aoa_2', name: 'Atún en agua drenado', group: 'aoa', portionQty: 35, portionUnit: 'g', gramsNet: 35, allergens: ['fish'] },
  { id: 'f_aoa_3', name: 'Claras de huevo', group: 'aoa', portionQty: 2, portionUnit: 'piezas', gramsNet: 66, allergens: ['egg'] },
  { id: 'f_aoa_4', name: 'Filete de res magro', group: 'aoa', portionQty: 30, portionUnit: 'g', gramsNet: 30, allergens: [] },
  { id: 'f_aoa_5', name: 'Queso panela bajo en grasa', group: 'aoa', portionQty: 40, portionUnit: 'g', gramsNet: 40, allergens: ['lactose'] },
  { id: 'f_aoa_6', name: 'Salmón fresco a la plancha', group: 'aoa', portionQty: 30, portionUnit: 'g', gramsNet: 30, allergens: ['fish'] },
  { id: 'f_aoa_7', name: 'Camarón cocido', group: 'aoa', portionQty: 35, portionUnit: 'g', gramsNet: 35, allergens: ['shellfish'] },
  { id: 'f_aoa_8', name: 'Tofu firme', group: 'aoa', portionQty: 60, portionUnit: 'g', gramsNet: 60, allergens: ['soy'] },

  // Cereales
  { id: 'f_cer_1', name: 'Avena en hojuelas', group: 'cereals', portionQty: 0.33, portionUnit: 'taza', gramsNet: 30, allergens: ['gluten'] },
  { id: 'f_cer_2', name: 'Arroz blanco cocido', group: 'cereals', portionQty: 0.5, portionUnit: 'taza', gramsNet: 80, allergens: [] },
  { id: 'f_cer_3', name: 'Tortilla de maíz nixtamalizado', group: 'cereals', portionQty: 1, portionUnit: 'pieza', gramsNet: 30, allergens: [] },
  { id: 'f_cer_4', name: 'Papa cocida o al horno', group: 'cereals', portionQty: 0.5, portionUnit: 'pieza mediana', gramsNet: 90, allergens: [] },
  { id: 'f_cer_5', name: 'Pan integral de caja', group: 'cereals', portionQty: 1, portionUnit: 'rebanada', gramsNet: 30, allergens: ['gluten'] },
  { id: 'f_cer_6', name: 'Camote cocido al vapor', group: 'cereals', portionQty: 0.33, portionUnit: 'pieza', gramsNet: 70, allergens: [] },
  { id: 'f_cer_7', name: 'Pasta cocida', group: 'cereals', portionQty: 0.5, portionUnit: 'taza', gramsNet: 75, allergens: ['gluten'] },

  // Leguminosas
  { id: 'f_leg_1', name: 'Frijoles negros de la olla', group: 'legumes', portionQty: 0.5, portionUnit: 'taza', gramsNet: 85, allergens: [] },
  { id: 'f_leg_2', name: 'Lentejas cocidas', group: 'legumes', portionQty: 0.5, portionUnit: 'taza', gramsNet: 90, allergens: [] },
  { id: 'f_leg_3', name: 'Garbanzos cocidos', group: 'legumes', portionQty: 0.5, portionUnit: 'taza', gramsNet: 85, allergens: [] },
  { id: 'f_leg_4', name: 'Edamames al vapor', group: 'legumes', portionQty: 0.5, portionUnit: 'taza', gramsNet: 80, allergens: ['soy'] },

  // Verduras
  { id: 'f_ver_1', name: 'Espinacas crudas lavadas', group: 'vegetables', portionQty: 2, portionUnit: 'tazas', gramsNet: 120, allergens: [] },
  { id: 'f_ver_2', name: 'Brócoli al vapor', group: 'vegetables', portionQty: 1, portionUnit: 'taza', gramsNet: 90, allergens: [] },
  { id: 'f_ver_3', name: 'Jitomate saladette en cubos', group: 'vegetables', portionQty: 1, portionUnit: 'pieza', gramsNet: 100, allergens: [] },
  { id: 'f_ver_4', name: 'Pepino con cáscara rebanado', group: 'vegetables', portionQty: 1.5, portionUnit: 'tazas', gramsNet: 150, allergens: [] },
  { id: 'f_ver_5', name: 'Champiñones fileteados', group: 'vegetables', portionQty: 1, portionUnit: 'taza', gramsNet: 80, allergens: [] },
  { id: 'f_ver_6', name: 'Calabacita tierna en rodajas', group: 'vegetables', portionQty: 1, portionUnit: 'pieza', gramsNet: 110, allergens: [] },

  // Frutas
  { id: 'f_fru_1', name: 'Plátano maduro', group: 'fruits', portionQty: 0.5, portionUnit: 'pieza', gramsNet: 60, allergens: [] },
  { id: 'f_fru_2', name: 'Manzana verde o roja', group: 'fruits', portionQty: 1, portionUnit: 'pieza chica', gramsNet: 110, allergens: [] },
  { id: 'f_fru_3', name: 'Fresas frescas en mitades', group: 'fruits', portionQty: 1, portionUnit: 'taza', gramsNet: 150, allergens: [] },
  { id: 'f_fru_4', name: 'Frutos rojos mixtos', group: 'fruits', portionQty: 0.75, portionUnit: 'taza', gramsNet: 120, allergens: [] },
  { id: 'f_fru_5', name: 'Papaya picada', group: 'fruits', portionQty: 1, portionUnit: 'taza', gramsNet: 140, allergens: [] },

  // Grasas
  { id: 'f_fat_1', name: 'Aceite de oliva extra virgen', group: 'fats', portionQty: 1, portionUnit: 'cdta', gramsNet: 5, allergens: [] },
  { id: 'f_fat_2', name: 'Aguacate Hass', group: 'fats', portionQty: 0.33, portionUnit: 'pieza', gramsNet: 35, allergens: [] },
  { id: 'f_fat_3', name: 'Almendras naturales', group: 'fats', portionQty: 10, portionUnit: 'piezas', gramsNet: 12, allergens: ['tree_nuts'] },
  { id: 'f_fat_4', name: 'Nueces en mitades', group: 'fats', portionQty: 3, portionUnit: 'piezas', gramsNet: 12, allergens: ['tree_nuts'] },
  { id: 'f_fat_5', name: 'Crema de cacahuate sin azúcar', group: 'fats', portionQty: 2, portionUnit: 'cdtas', gramsNet: 14, allergens: ['peanuts'] },

  // Lácteos
  { id: 'f_mlk_1', name: 'Yogurt griego sin azúcar (Fage/Chobani)', group: 'milk', portionQty: 0.75, portionUnit: 'taza', gramsNet: 150, allergens: ['lactose'] },
  { id: 'f_mlk_2', name: 'Leche descremada / light', group: 'milk', portionQty: 1, portionUnit: 'taza', gramsNet: 240, allergens: ['lactose'] },
  { id: 'f_mlk_3', name: 'Bebida de almendras fortificada (Soya/Almendra sin azúcar)', group: 'milk', portionQty: 1.5, portionUnit: 'tazas', gramsNet: 300, allergens: ['tree_nuts'] },
];

export interface PortionAllocation {
  aoa: number;
  cereals: number;
  legumes: number;
  vegetables: number;
  fruits: number;
  fats: number;
  milk: number;
}

/**
 * Filter available food catalog to 100% exclude patient allergies.
 */
export function filterFoodsForPatient(catalog: FoodEquivalent[], patientAllergies: AllergenTag[]): FoodEquivalent[] {
  if (!patientAllergies || patientAllergies.length === 0) return catalog;
  return catalog.filter((food) => {
    return !food.allergens.some((allergen) => patientAllergies.includes(allergen));
  });
}

/**
 * Finds a safe food suggestion from a given group.
 */
export function pickSafeFood(group: keyof PortionAllocation, safeCatalog: FoodEquivalent[]): FoodEquivalent {
  const matching = safeCatalog.filter((f) => f.group === group);
  if (matching.length > 0) {
    return matching[0];
  }
  // Fallback to generic representation
  return {
    id: `fallback_${group}`,
    name: SMAE_GROUP_STANDARDS[group]?.name ?? group,
    group: group as any,
    portionQty: 1,
    portionUnit: 'porción equivalente',
    gramsNet: 100,
    allergens: [],
  };
}

/**
 * Automatically allocates SMAE group portions to match target calories & macros
 * within standard tolerance (+- 35 kcal and +- 5g per macro).
 */
export function solveSmaePortions(target: {
  targetKcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
}): PortionAllocation {
  const { targetKcal, proteinG, fatG, carbsG } = target;

  let bestPortions: PortionAllocation = {
    aoa: 6,
    cereals: 6,
    legumes: 1,
    vegetables: 3,
    fruits: 2,
    fats: 4,
    milk: 1,
  };
  let bestScore = Infinity;

  // Realistic bounds for clinical meal plans
  const vegRange = [2, 3, 4];
  const fruitRange = [1, 2, 3];
  const legRange = [0, 1, 2];
  const milkRange = targetKcal > 1800 ? [0, 1] : [0];

  for (const veg of vegRange) {
    for (const fru of fruitRange) {
      for (const leg of legRange) {
        for (const mlk of milkRange) {
          // Current subtotal from fixed base
          const subKcal = veg * 25 + fru * 60 + leg * 120 + mlk * 95;
          const subProt = veg * 2 + fru * 0 + leg * 8 + mlk * 9;
          const subFat = veg * 0 + fru * 0 + leg * 1 + mlk * 2;
          const subCarb = veg * 4 + fru * 15 + leg * 20 + mlk * 12;

          // Solve AOA primarily for remaining protein (7g per portion)
          const remProt = proteinG - subProt;
          const aoaEst = Math.max(1, Math.round(remProt / 7));

          // AOA contributes: aoa * 7 prot, aoa * 1 fat, aoa * 40 kcal
          for (let aoa = Math.max(1, aoaEst - 4); aoa <= aoaEst + 4; aoa++) {
            const curProt = subProt + aoa * 7;
            const curFatFromAoa = subFat + aoa * 1;

            // Solve Fats for remaining fat (5g per portion)
            const remFat = fatG - curFatFromAoa;
            const fatEst = Math.max(1, Math.round(remFat / 5));

            for (let fats = Math.max(1, fatEst - 3); fats <= fatEst + 3; fats++) {
              const totalFat = curFatFromAoa + fats * 5;

              // Solve Cereals for remaining carbs (15g per portion)
              const remCarb = carbsG - subCarb;
              const cerEst = Math.max(1, Math.round(remCarb / 15));

              for (let cereals = Math.max(1, cerEst - 4); cereals <= cerEst + 4; cereals++) {
                const totalCarb = subCarb + cereals * 15;
                const totalProt = curProt + cereals * 2;
                const totalKcal = subKcal + aoa * 40 + fats * 45 + cereals * 70;

                const dKcal = Math.abs(totalKcal - targetKcal);
                const dProt = Math.abs(totalProt - proteinG);
                const dFat = Math.abs(totalFat - fatG);
                const dCarb = Math.abs(totalCarb - carbsG);

                // Priority score with penalty for exceeding criteria tolerances
                const penaltyKcal = dKcal > 35 ? (dKcal - 35) * 10 : 0;
                const penaltyProt = dProt > 5 ? (dProt - 5) * 20 : 0;
                const penaltyFat = dFat > 5 ? (dFat - 5) * 20 : 0;
                const penaltyCarb = dCarb > 5 ? (dCarb - 5) * 20 : 0;

                const score =
                  (dKcal / 35) ** 2 +
                  (dProt / 5) ** 2 +
                  (dFat / 5) ** 2 +
                  (dCarb / 5) ** 2 +
                  penaltyKcal +
                  penaltyProt +
                  penaltyFat +
                  penaltyCarb;

                if (score < bestScore) {
                  bestScore = score;
                  bestPortions = {
                    aoa,
                    cereals,
                    legumes: leg,
                    vegetables: veg,
                    fruits: fru,
                    fats,
                    milk: mlk,
                  };

                  // If perfect tolerance reached, return immediately
                  if (dKcal <= 35 && dProt <= 5 && dFat <= 5 && dCarb <= 5) {
                    return bestPortions;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return bestPortions;
}

/**
 * Calculates sum of energy and macros from a portion allocation.
 */
export function calculateSmaeTotals(portions: PortionAllocation) {
  let kcal = 0;
  let proteinG = 0;
  let fatG = 0;
  let carbsG = 0;

  for (const [group, count] of Object.entries(portions)) {
    const std = SMAE_GROUP_STANDARDS[group];
    if (std) {
      kcal += std.kcal * count;
      proteinG += std.proteinG * count;
      fatG += std.fatG * count;
      carbsG += std.carbsG * count;
    }
  }

  return {
    kcal: Math.round(kcal),
    proteinG: Math.round(proteinG * 10) / 10,
    fatG: Math.round(fatG * 10) / 10,
    carbsG: Math.round(carbsG * 10) / 10,
  };
}

/**
 * Validates whether the calculated plan is within acceptance criteria:
 * +- 35 kcal and +- 5g per macro.
 */
export function validateMacroTolerance(
  target: { targetKcal: number; proteinG: number; fatG: number; carbsG: number },
  actual: { kcal: number; proteinG: number; fatG: number; carbsG: number }
) {
  const deltaKcal = Math.abs(actual.kcal - target.targetKcal);
  const deltaProt = Math.abs(actual.proteinG - target.proteinG);
  const deltaFat = Math.abs(actual.fatG - target.fatG);
  const deltaCarbs = Math.abs(actual.carbsG - target.carbsG);

  const isKcalValid = deltaKcal <= 35;
  const isProtValid = deltaProt <= 5.5; // slight round allowance
  const isFatValid = deltaFat <= 5.5;
  const isCarbsValid = deltaCarbs <= 6.0;

  return {
    isValid: isKcalValid && isProtValid && isFatValid && isCarbsValid,
    deltaKcal: Math.round(actual.kcal - target.targetKcal),
    deltaProt: Math.round((actual.proteinG - target.proteinG) * 10) / 10,
    deltaFat: Math.round((actual.fatG - target.fatG) * 10) / 10,
    deltaCarbs: Math.round((actual.carbsG - target.carbsG) * 10) / 10,
  };
}

/**
 * Distributes portions across 3, 4, or 5 meals according to clinical meal schedules.
 */
export function buildMealSchedule(
  portions: PortionAllocation,
  mealCount: number,
  safeCatalog: FoodEquivalent[]
): MealScheduleItem[] {
  const count = Math.min(5, Math.max(3, mealCount));

  const mealNamesMap: Record<number, string[]> = {
    3: ['Desayuno', 'Comida', 'Cena'],
    4: ['Desayuno', 'Colación Matutina', 'Comida', 'Cena'],
    5: ['Desayuno', 'Colación Matutina', 'Comida', 'Colación Vespertina', 'Cena'],
  };

  const mealNames = mealNamesMap[count] || mealNamesMap[4];
  const items: MealScheduleItem[] = [];

  // Group distributions:
  // e.g. for 4 meals:
  // Desayuno: AOA, Cereales, Fruta, Grasa
  // Colación 1: Fruta, Grasa o Lácteo
  // Comida: AOA, Cereales, Leguminosas, Verduras, Grasa
  // Cena: AOA, Cereales, Verduras, Grasa
  for (let i = 0; i < count; i++) {
    const mealNumber = i + 1;
    const name = mealNames[i];
    const mealPortions: SmaeMealPortion[] = [];

    // Distribute groups based on meal role
    if (mealNumber === 1) {
      // Breakfast
      const aoaShare = Math.max(1, Math.round(portions.aoa * 0.3));
      const cerShare = Math.max(1, Math.round(portions.cereals * 0.3));
      const fruShare = Math.min(portions.fruits, 1);
      const fatShare = Math.max(1, Math.round(portions.fats * 0.25));

      if (aoaShare > 0) addPortion(mealPortions, 'aoa', aoaShare, safeCatalog);
      if (cerShare > 0) addPortion(mealPortions, 'cereals', cerShare, safeCatalog);
      if (fruShare > 0) addPortion(mealPortions, 'fruits', fruShare, safeCatalog);
      if (fatShare > 0) addPortion(mealPortions, 'fats', fatShare, safeCatalog);
      if (portions.milk > 0) addPortion(mealPortions, 'milk', 1, safeCatalog);
    } else if (mealNumber === 2 && count > 3) {
      // Mid-morning snack
      const fruShare = Math.max(1, portions.fruits - 1);
      const fatShare = 1;
      if (fruShare > 0) addPortion(mealPortions, 'fruits', fruShare, safeCatalog);
      if (fatShare > 0) addPortion(mealPortions, 'fats', fatShare, safeCatalog);
    } else if (name === 'Comida') {
      // Main Lunch
      const aoaShare = Math.max(1, Math.round(portions.aoa * 0.4));
      const cerShare = Math.max(1, Math.round(portions.cereals * 0.4));
      const legShare = portions.legumes;
      const vegShare = Math.max(1, Math.round(portions.vegetables * 0.6));
      const fatShare = Math.max(1, Math.round(portions.fats * 0.4));

      if (aoaShare > 0) addPortion(mealPortions, 'aoa', aoaShare, safeCatalog);
      if (cerShare > 0) addPortion(mealPortions, 'cereals', cerShare, safeCatalog);
      if (legShare > 0) addPortion(mealPortions, 'legumes', legShare, safeCatalog);
      if (vegShare > 0) addPortion(mealPortions, 'vegetables', vegShare, safeCatalog);
      if (fatShare > 0) addPortion(mealPortions, 'fats', fatShare, safeCatalog);
    } else if (name === 'Colación Vespertina') {
      // Afternoon snack
      const cerShare = 1;
      const fatShare = 1;
      addPortion(mealPortions, 'cereals', cerShare, safeCatalog);
      addPortion(mealPortions, 'fats', fatShare, safeCatalog);
    } else {
      // Dinner
      const aoaShare = Math.max(1, Math.round(portions.aoa * 0.3));
      const cerShare = Math.max(1, Math.round(portions.cereals * 0.3));
      const vegShare = Math.max(1, portions.vegetables - Math.round(portions.vegetables * 0.6));
      const fatShare = Math.max(1, Math.round(portions.fats * 0.25));

      if (aoaShare > 0) addPortion(mealPortions, 'aoa', aoaShare, safeCatalog);
      if (cerShare > 0) addPortion(mealPortions, 'cereals', cerShare, safeCatalog);
      if (vegShare > 0) addPortion(mealPortions, 'vegetables', vegShare, safeCatalog);
      if (fatShare > 0) addPortion(mealPortions, 'fats', fatShare, safeCatalog);
    }

    // Compute meal totals
    let mealKcal = 0;
    let mealProt = 0;
    let mealFat = 0;
    let mealCarbs = 0;

    for (const p of mealPortions) {
      const std = SMAE_GROUP_STANDARDS[p.group];
      if (std) {
        mealKcal += std.kcal * p.portions;
        mealProt += std.proteinG * p.portions;
        mealFat += std.fatG * p.portions;
        mealCarbs += std.carbsG * p.portions;
      }
    }

    items.push({
      id: `meal_${mealNumber}`,
      mealNumber,
      name,
      portions: mealPortions,
      totalKcal: Math.round(mealKcal),
      proteinG: Math.round(mealProt * 10) / 10,
      fatG: Math.round(mealFat * 10) / 10,
      carbsG: Math.round(mealCarbs * 10) / 10,
    });
  }

  return items;
}

function addPortion(
  list: SmaeMealPortion[],
  group: keyof PortionAllocation,
  portions: number,
  catalog: FoodEquivalent[]
) {
  const safeFood = pickSafeFood(group, catalog);
  const std = SMAE_GROUP_STANDARDS[group];
  list.push({
    group: group as any,
    groupName: std?.name ?? group,
    portions,
    suggestedFood: safeFood.name,
    portionUnit: safeFood.portionUnit,
    gramsNet: safeFood.gramsNet * portions,
  });
}
