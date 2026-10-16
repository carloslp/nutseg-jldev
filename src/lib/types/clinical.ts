export type BiologicalSex = 'male' | 'female';

export type ClinicalFlag =
  | 'diabetes_type_2'
  | 'hypertension'
  | 'pregnancy'
  | 'renal_pathology'
  | 'eating_disorder_hx'
  | 'knee_injury'
  | 'shoulder_injury'
  | 'lower_back_injury';

export type AllergenTag =
  | 'gluten'
  | 'lactose'
  | 'shellfish'
  | 'tree_nuts'
  | 'peanuts'
  | 'soy'
  | 'egg'
  | 'fish';

export type GoalType =
  | 'deficit_aggressive'
  | 'deficit_moderate'
  | 'maintenance'
  | 'surplus_lean'
  | 'surplus_aggressive'
  | 'custom';

export type WorkoutSplit =
  | 'full_body'
  | 'upper_lower'
  | 'push_pull_legs';

export type EquipmentType =
  | 'gym'
  | 'dumbbells'
  | 'bodyweight'
  | 'machine';

export interface ClientProfile {
  id: string;
  fullName: string;
  birthDate: string; // YYYY-MM-DD
  sex: BiologicalSex;
  heightCm: number;
  phoneWhatsapp?: string;
  phone?: string;
  email?: string;
  clinicalFlags: ClinicalFlag[];
  allergies: AllergenTag[];
  notes?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BiometricLog {
  id: string;
  clientId: string;
  recordedAt: string; // YYYY-MM-DD
  weightKg: number;
  bodyFatPct?: number | null;
  muscleMassKg?: number | null;
  waistCm?: number | null;
  hipCm?: number | null;
  abdomenCm?: number | null;
  armRelaxedCm?: number | null;
  armContractedCm?: number | null;
  thighCm?: number | null;
  activityFactor: number; // 1.2 to 2.2
  trainingDays: number; // 0 to 7
  equipmentAvailable: EquipmentType[];
  notes?: string;
  createdAt: string;
}

export interface SmaeMealPortion {
  group: 'aoa' | 'cereals' | 'legumes' | 'vegetables' | 'fruits' | 'fats' | 'milk';
  groupName: string;
  portions: number;
  suggestedFood: string;
  portionUnit: string;
  gramsNet: number;
}

export interface MealScheduleItem {
  id: string;
  mealNumber: number;
  name: string; // "Desayuno", "Colación 1", "Comida", "Cena", etc.
  targetTime?: string;
  portions: SmaeMealPortion[];
  totalKcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  notes?: string;
}

export interface ExercisePrescription {
  id: string;
  name: string;
  movementPattern: string;
  equipment: EquipmentType;
  jointStressTags: string[];
  sets: number;
  reps: string;
  restSec: number;
  rpe?: number;
  notes?: string;
  videoUrl?: string;
}

export interface WorkoutDayPlan {
  dayName: string; // e.g. "Día 1 - Full Body A" or "Día 1 - Torso"
  focus: string;
  exercises: ExercisePrescription[];
}

export interface NutritionalPlan {
  id: string;
  clientId: string;
  biometricLogId?: string | null;
  name?: string;
  formulaUsed: 'mifflin_st_jeor' | 'katch_mcardle';
  lbmKg?: number | null;
  tmbKcal: number;
  getdKcal: number;
  tdeeKcal?: number;
  goal: GoalType;
  goalAdjustmentPct: number;
  targetKcal: number;
  caloricFloorMin: number;
  caloricFloorOverride: boolean;
  bmi: number;
  isObese: boolean;
  adjustedWeightKg?: number | null;
  proteinG: number;
  proteinRatioGKg: number;
  fatG: number;
  fatRatioGKg: number;
  carbsG: number;
  mealCount: number;
  mealStructure: MealScheduleItem[];
  hydrationMl: number;
  workoutSplit: WorkoutSplit;
  workoutStructure: WorkoutDayPlan[];
  clinicalAlertNotes?: string | null;
  isPublished: boolean;
  createdAt: string;
}

export interface PermalinkRecord {
  id: string;
  clientId: string;
  currentPlanId?: string | null;
  slugToken: string;
  passwordHash: string;
  passwordHintAdmin: string; // Clear PIN for specialist (e.g. "NUT-482")
  isActive: boolean;
  expiresAt?: string | null;
  lastAccessedAt?: string | null;
  accessCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FoodCatalogItem {
  id: string;
  name: string;
  smaeGroup: 'aoa' | 'cereals' | 'legumes' | 'vegetables' | 'fruits' | 'fats' | 'milk';
  portionQty: number;
  portionUnit: string;
  gramsNet: number;
  kcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  allergenTags: AllergenTag[];
  isActive?: boolean;
  createdAt?: string;
}

export interface ExerciseCatalogItem {
  id: string;
  name: string;
  movementPattern: 'squat' | 'hinge' | 'push_h' | 'push_v' | 'pull_h' | 'pull_v' | 'core' | 'arms';
  primaryMuscle: string;
  equipmentRequired: EquipmentType | 'bands';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  jointStressTags: ('knee' | 'shoulder' | 'lower_back' | 'wrist')[];
  defaultSets: number;
  defaultReps: string;
  defaultRestSec: number;
  instructions?: string;
  videoUrl?: string;
  isActive?: boolean;
  createdAt?: string;
}
