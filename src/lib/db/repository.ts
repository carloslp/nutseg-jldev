import {
  ClientProfile,
  BiometricLog,
  NutritionalPlan,
  PermalinkRecord,
  FoodCatalogItem,
  ExerciseCatalogItem,
  AllergenTag,
} from '../types/clinical';
import { hashPin } from '../security/auth';
import { createAdminSupabaseClient } from '../supabase/server';
import { DEFAULT_FOOD_CATALOG } from '../engine/smae';
import { EXERCISE_DATABASE } from '../engine/workout';
import { nanoid } from 'nanoid';

// Initial fallback mock data for testing or when Supabase is not reachable
const INITIAL_CLIENT: ClientProfile = {
  id: 'c1111111-1111-1111-1111-111111111111',
  fullName: 'Carlos Mendoza Silva',
  birthDate: '1993-05-14',
  sex: 'male',
  heightCm: 179,
  phoneWhatsapp: '+52 55 1234 5678',
  phone: '+52 55 1234 5678',
  email: 'carlos.mendoza@ejemplo.com',
  clinicalFlags: ['diabetes_type_2', 'knee_injury'],
  allergies: [],
  notes: '8 meses en seguimiento. Lesión en tendón rotuliano derecho en fase de remodelación. Diabetes Tipo 2 controlada con metformina. Restricción de aporte proteico agresivo > 2.0 g/kg.',
  isActive: true,
  createdAt: '2024-02-15T10:00:00Z',
  updatedAt: '2024-10-24T18:00:00Z',
};

const INITIAL_LOGS: BiometricLog[] = [
  {
    id: 'b1111111-0001-0000-0000-000000000001',
    clientId: 'c1111111-1111-1111-1111-111111111111',
    recordedAt: '2024-03-01',
    weightKg: 92.5,
    bodyFatPct: 24.5,
    muscleMassKg: 64.2,
    waistCm: 96.0,
    hipCm: 104.0,
    abdomenCm: 98.0,
    armRelaxedCm: 34.0,
    armContractedCm: 36.5,
    thighCm: 59.0,
    activityFactor: 1.4,
    trainingDays: 3,
    equipmentAvailable: ['gym'],
    notes: 'Consulta inicial #1. Inicio de acondicionamiento y déficit moderado.',
    createdAt: '2024-03-01T10:00:00Z',
  },
  {
    id: 'b1111111-0004-0000-0000-000000000004',
    clientId: 'c1111111-1111-1111-1111-111111111111',
    recordedAt: '2024-10-24',
    weightKg: 84.3,
    bodyFatPct: 18.4,
    muscleMassKg: 68.8,
    waistCm: 86.0,
    hipCm: 98.5,
    abdomenCm: 87.5,
    armRelaxedCm: 35.5,
    armContractedCm: 38.5,
    thighCm: 57.5,
    activityFactor: 1.55,
    trainingDays: 4,
    equipmentAvailable: ['gym'],
    notes: 'Consulta #9 (Actual). Excelente recomposición: -8.2kg de peso total, -10cm de cintura y +4.6kg de masa magra.',
    createdAt: '2024-10-24T10:00:00Z',
  },
];

const INITIAL_PLAN: NutritionalPlan = {
  id: 'p1111111-1111-1111-1111-111111111111',
  clientId: 'c1111111-1111-1111-1111-111111111111',
  biometricLogId: 'b1111111-0004-0000-0000-000000000004',
  formulaUsed: 'katch_mcardle',
  lbmKg: 68.8,
  tmbKcal: 1845,
  getdKcal: 2860,
  goal: 'deficit_moderate',
  goalAdjustmentPct: -15,
  targetKcal: 2431,
  caloricFloorMin: 1500,
  caloricFloorOverride: false,
  bmi: 26.3,
  isObese: false,
  adjustedWeightKg: 84.3,
  proteinG: 165,
  proteinRatioGKg: 1.95,
  fatG: 70,
  fatRatioGKg: 0.83,
  carbsG: 285,
  mealCount: 4,
  hydrationMl: 3200,
  workoutSplit: 'upper_lower',
  clinicalAlertNotes: 'Protocolo de Sensibilidad Renal: Proteína acotada a ≤ 2.0 g/kg (actual: 1.95 g/kg). Protección de tendón rotuliano en ejercicios de pierna.',
  isPublished: true,
  createdAt: '2024-10-24T18:00:00Z',
  mealStructure: [
    {
      id: 'meal_1',
      mealNumber: 1,
      name: 'Desayuno (Pre-Entreno / Inicio)',
      targetTime: '08:00',
      totalKcal: 560,
      proteinG: 38,
      fatG: 16,
      carbsG: 66,
      portions: [
        { group: 'aoa', groupName: 'Alimentos de Origen Animal', portions: 2, suggestedFood: 'Claras de huevo + 1 huevo entero', portionUnit: 'piezas', gramsNet: 110 },
        { group: 'cereals', groupName: 'Cereales y Tubérculos', portions: 2, suggestedFood: 'Avena en hojuelas cocida con canela', portionUnit: 'taza', gramsNet: 60 },
        { group: 'fruits', groupName: 'Frutas', portions: 1, suggestedFood: 'Plátano maduro rebanado', portionUnit: 'pieza', gramsNet: 60 },
        { group: 'fats', groupName: 'Aceites y Grasas', portions: 1, suggestedFood: 'Crema de cacahuate natural', portionUnit: 'cdta', gramsNet: 14 },
      ],
      notes: 'Hidratación con 500ml de agua al despertar.',
    },
    {
      id: 'meal_2',
      mealNumber: 2,
      name: 'Colación Post-Entreno',
      targetTime: '11:30',
      totalKcal: 310,
      proteinG: 22,
      fatG: 7,
      carbsG: 40,
      portions: [
        { group: 'milk', groupName: 'Lácteos Descremados', portions: 1, suggestedFood: 'Yogurt griego sin azúcar', portionUnit: 'taza', gramsNet: 150 },
        { group: 'fruits', groupName: 'Frutas', portions: 1, suggestedFood: 'Frutos rojos mixtos', portionUnit: 'taza', gramsNet: 120 },
        { group: 'fats', groupName: 'Aceites y Grasas', portions: 1, suggestedFood: 'Nueces en mitades', portionUnit: 'piezas', gramsNet: 12 },
      ],
    },
    {
      id: 'meal_3',
      mealNumber: 3,
      name: 'Comida Principal (Post-Jornada)',
      targetTime: '15:00',
      totalKcal: 885,
      proteinG: 64,
      fatG: 29,
      carbsG: 92,
      portions: [
        { group: 'aoa', groupName: 'Alimentos de Origen Animal', portions: 4, suggestedFood: 'Pechuga de pollo a la plancha', portionUnit: 'g', gramsNet: 120 },
        { group: 'cereals', groupName: 'Cereales y Tubérculos', portions: 3, suggestedFood: 'Arroz blanco cocido al vapor', portionUnit: 'taza', gramsNet: 160 },
        { group: 'legumes', groupName: 'Leguminosas', portions: 1, suggestedFood: 'Frijoles negros de la olla', portionUnit: 'taza', gramsNet: 85 },
        { group: 'vegetables', groupName: 'Verduras', portions: 2, suggestedFood: 'Brócoli al vapor y jitomate en cubos', portionUnit: 'taza', gramsNet: 190 },
        { group: 'fats', groupName: 'Aceites y Grasas', portions: 2, suggestedFood: 'Aguacate Hass + Aceite de oliva', portionUnit: 'porción', gramsNet: 40 },
      ],
      notes: 'Consumir ensalada primero para optimizar el índice glucémico.',
    },
    {
      id: 'meal_4',
      mealNumber: 4,
      name: 'Cena Ligera de Recuperación',
      targetTime: '20:30',
      totalKcal: 676,
      proteinG: 41,
      fatG: 18,
      carbsG: 87,
      portions: [
        { group: 'aoa', groupName: 'Alimentos de Origen Animal', portions: 2, suggestedFood: 'Atún en agua o filete de pescado blanco', portionUnit: 'g', gramsNet: 70 },
        { group: 'cereals', groupName: 'Cereales y Tubérculos', portions: 2, suggestedFood: 'Tortillas de maíz nixtamalizado', portionUnit: 'piezas', gramsNet: 60 },
        { group: 'vegetables', groupName: 'Verduras', portions: 1, suggestedFood: 'Espinacas crudas salteadas con ajo', portionUnit: 'tazas', gramsNet: 120 },
        { group: 'fats', groupName: 'Aceites y Grasas', portions: 1, suggestedFood: 'Aceite de oliva extra virgen', portionUnit: 'cdta', gramsNet: 5 },
      ],
    },
  ],
  workoutStructure: [
    {
      dayName: 'Día 1 - Torso A (Fuerza Horizontal)',
      focus: 'Pectoral, dorsal y estabilizadores de hombro',
      exercises: [
        { id: 'ex_1', name: 'Press de Banca Plano con Mancuernas', movementPattern: 'push_h', equipment: 'dumbbells', jointStressTags: [], sets: 4, reps: '8-10', restSec: 90, rpe: 8, notes: 'Mantener escápulas firmes en el banco.' },
        { id: 'ex_2', name: 'Remo con Mancuerna con Pecho Apoyado', movementPattern: 'pull_h', equipment: 'dumbbells', jointStressTags: [], sets: 4, reps: '10-12', restSec: 75, rpe: 8, notes: 'Elimina carga axial sobre columna lumbar.' },
        { id: 'ex_3', name: 'Elevaciones Laterales en Plano Escapular', movementPattern: 'push_v', equipment: 'dumbbells', jointStressTags: [], sets: 4, reps: '15', restSec: 60, rpe: 8, notes: '30° por delante del torso para cuidar bursa.' },
        { id: 'ex_4', name: 'Pallof Press con Banda / Polea', movementPattern: 'core', equipment: 'dumbbells', jointStressTags: [], sets: 3, reps: '12 por lado', restSec: 45, rpe: 7, notes: 'Anti-rotación estricta de core.' },
      ],
    },
    {
      dayName: 'Día 2 - Pierna A (Cuádriceps & Safe Tendón Rotuliano)',
      focus: 'Patrón sentadilla controlado sin estrés en tendón',
      exercises: [
        { id: 'ex_5', name: 'Extensión Isométrica de Cuádriceps (Safe Rodilla)', movementPattern: 'squat', equipment: 'machine', jointStressTags: [], sets: 4, reps: '45 seg', restSec: 60, rpe: 7, notes: 'Contracción estática a 45° sin impacto articular.' },
        { id: 'ex_6', name: 'Hip Thrust con Barra / Máquina', movementPattern: 'hinge', equipment: 'gym', jointStressTags: [], sets: 4, reps: '10-12', restSec: 90, rpe: 8.5, notes: 'Empuje desde talones, pausa de 1s arriba.' },
        { id: 'ex_7', name: 'Prensa Inclinada Pies Altos (Énfasis Isquios/Glúteo)', movementPattern: 'squat', equipment: 'machine', jointStressTags: [], sets: 4, reps: '12-15', restSec: 90, rpe: 8, notes: 'Pies en la parte superior para minimizar ángulo de flexión de rodilla.' },
        { id: 'ex_8', name: 'Plancha Abdominal Frontal', movementPattern: 'core', equipment: 'bodyweight', jointStressTags: [], sets: 3, reps: '60 seg', restSec: 60, rpe: 7.5, notes: 'Pelvis en retroversión activa.' },
      ],
    },
  ],
};

const INITIAL_PERMALINK: PermalinkRecord = {
  id: 'pm111111-1111-1111-1111-111111111111',
  clientId: 'c1111111-1111-1111-1111-111111111111',
  currentPlanId: 'p1111111-1111-1111-1111-111111111111',
  slugToken: 'k9x2m7p4q1w8',
  passwordHash: hashPin('NUT-482'),
  passwordHintAdmin: 'NUT-482',
  isActive: true,
  accessCount: 14,
  lastAccessedAt: '2024-10-25T14:32:00Z',
  createdAt: '2024-10-24T18:05:00Z',
  updatedAt: '2024-10-25T14:32:00Z',
};

// Global in-memory store for fallback/dev
interface GlobalStore {
  clients: Map<string, ClientProfile>;
  biometrics: Map<string, BiometricLog[]>;
  plans: Map<string, NutritionalPlan[]>;
  permalinks: Map<string, PermalinkRecord>;
  foodCatalog: Map<string, FoodCatalogItem>;
  exerciseCatalog: Map<string, ExerciseCatalogItem>;
}

declare global {
  var __nutsegStore: GlobalStore | undefined;
}

function getStore(): GlobalStore {
  if (!global.__nutsegStore) {
    const clients = new Map<string, ClientProfile>();
    const biometrics = new Map<string, BiometricLog[]>();
    const plans = new Map<string, NutritionalPlan[]>();
    const permalinks = new Map<string, PermalinkRecord>();
    const foodCatalog = new Map<string, FoodCatalogItem>();
    const exerciseCatalog = new Map<string, ExerciseCatalogItem>();

    clients.set(INITIAL_CLIENT.id, INITIAL_CLIENT);
    biometrics.set(INITIAL_CLIENT.id, [...INITIAL_LOGS]);
    plans.set(INITIAL_CLIENT.id, [INITIAL_PLAN]);
    permalinks.set(INITIAL_PERMALINK.slugToken, INITIAL_PERMALINK);

    global.__nutsegStore = { clients, biometrics, plans, permalinks, foodCatalog, exerciseCatalog };
  }
  return global.__nutsegStore;
}

export class NutritionRepository {
  private static isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes('placeholder.supabase.co'));
  }

  // ==========================================================================
  // CLIENTS
  // ==========================================================================
  static async getClients(): Promise<ClientProfile[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map(this.mapClientFromDb);
        }
      } catch (e) {
        console.warn('Supabase getClients error, fallback to memory:', e);
      }
    }
    const store = getStore();
    return Array.from(store.clients.values());
  }

  static async getClientById(id: string): Promise<ClientProfile | null> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) {
          return this.mapClientFromDb(data);
        }
      } catch (e) {
        console.warn('Supabase getClientById error, fallback to memory:', e);
      }
    }
    const store = getStore();
    return store.clients.get(id) || null;
  }

  static async createClient(data: Omit<ClientProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientProfile> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newClient: ClientProfile = {
      ...data,
      id,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        const { error } = await supabase.from('clients').insert({
          id,
          full_name: newClient.fullName,
          birth_date: newClient.birthDate,
          sex: newClient.sex,
          height_cm: newClient.heightCm,
          phone_whatsapp: newClient.phoneWhatsapp || newClient.phone,
          phone: newClient.phone || newClient.phoneWhatsapp,
          email: newClient.email,
          clinical_flags: newClient.clinicalFlags,
          allergies: newClient.allergies,
          notes: newClient.notes,
          is_active: newClient.isActive,
          created_at: now,
          updated_at: now,
        });
        if (error) {
          console.warn('Supabase client insert error:', error);
        }
      } catch (e) {
        console.warn('Supabase client insert failed:', e);
      }
    }

    const store = getStore();
    store.clients.set(id, newClient);
    return newClient;
  }

  static async updateClient(id: string, updates: Partial<ClientProfile>): Promise<ClientProfile | null> {
    const now = new Date().toISOString();
    let updated: ClientProfile | null = null;

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        const dbUpdates: any = { updated_at: now };
        if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
        if (updates.birthDate !== undefined) dbUpdates.birth_date = updates.birthDate;
        if (updates.sex !== undefined) dbUpdates.sex = updates.sex;
        if (updates.heightCm !== undefined) dbUpdates.height_cm = updates.heightCm;
        if (updates.phoneWhatsapp !== undefined) dbUpdates.phone_whatsapp = updates.phoneWhatsapp;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.email !== undefined) dbUpdates.email = updates.email;
        if (updates.clinicalFlags !== undefined) dbUpdates.clinical_flags = updates.clinicalFlags;
        if (updates.allergies !== undefined) dbUpdates.allergies = updates.allergies;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

        const { data, error } = await supabase
          .from('clients')
          .update(dbUpdates)
          .eq('id', id)
          .select('*')
          .maybeSingle();

        if (!error && data) {
          updated = this.mapClientFromDb(data);
        }
      } catch (e) {
        console.warn('Supabase client update failed:', e);
      }
    }

    const store = getStore();
    const existing = store.clients.get(id);
    if (existing) {
      const merged = { ...existing, ...updates, updatedAt: now };
      store.clients.set(id, merged);
      if (!updated) updated = merged;
    }

    return updated;
  }

  static async deleteClient(id: string): Promise<boolean> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (error) console.warn('Supabase client delete error:', error);
      } catch (e) {
        console.warn('Supabase client delete failed:', e);
      }
    }
    const store = getStore();
    store.clients.delete(id);
    store.biometrics.delete(id);
    store.plans.delete(id);
    return true;
  }

  // ==========================================================================
  // BIOMETRIC LOGS
  // ==========================================================================
  static async getBiometricLogs(clientId: string): Promise<BiometricLog[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        const { data, error } = await supabase
          .from('biometric_logs')
          .select('*')
          .eq('client_id', clientId)
          .order('recorded_at', { ascending: true });
        if (!error && data) {
          return data.map(this.mapBiometricFromDb);
        }
      } catch (e) {
        console.warn('Supabase biometric query failed, using memory:', e);
      }
    }
    const store = getStore();
    return store.biometrics.get(clientId) || [];
  }

  static async createBiometricLog(data: Omit<BiometricLog, 'id' | 'createdAt'>): Promise<BiometricLog> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newLog: BiometricLog = {
      ...data,
      id,
      createdAt: now,
    };

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        const { error } = await supabase.from('biometric_logs').insert({
          id,
          client_id: newLog.clientId,
          recorded_at: newLog.recordedAt,
          weight_kg: newLog.weightKg,
          body_fat_pct: newLog.bodyFatPct,
          muscle_mass_kg: newLog.muscleMassKg,
          waist_cm: newLog.waistCm,
          hip_cm: newLog.hipCm,
          abdomen_cm: newLog.abdomenCm,
          arm_relaxed_cm: newLog.armRelaxedCm,
          arm_contracted_cm: newLog.armContractedCm,
          thigh_cm: newLog.thighCm,
          activity_factor: newLog.activityFactor,
          training_days: newLog.trainingDays,
          equipment_available: newLog.equipmentAvailable,
          notes: newLog.notes,
          created_at: now,
        });
        if (error) console.warn('Supabase biometric insert error:', error);
      } catch (e) {
        console.warn('Supabase biometric insert failed:', e);
      }
    }

    const store = getStore();
    const list = store.biometrics.get(newLog.clientId) || [];
    list.push(newLog);
    store.biometrics.set(newLog.clientId, list);
    return newLog;
  }

  static async addBiometricLog(data: Omit<BiometricLog, 'id' | 'createdAt'>): Promise<BiometricLog> {
    return this.createBiometricLog(data);
  }

  static async deleteBiometricLog(logId: string): Promise<boolean> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        await supabase.from('biometric_logs').delete().eq('id', logId);
      } catch (e) {
        console.warn('Supabase biometric delete failed:', e);
      }
    }
    const store = getStore();
    for (const [clientId, logs] of store.biometrics.entries()) {
      const filtered = logs.filter((l) => l.id !== logId);
      if (filtered.length !== logs.length) {
        store.biometrics.set(clientId, filtered);
        return true;
      }
    }
    return true;
  }

  // ==========================================================================
  // PLANS
  // ==========================================================================
  static async getPlans(clientId: string): Promise<NutritionalPlan[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map(this.mapPlanFromDb);
        }
      } catch (e) {
        console.warn('Supabase getPlans error, fallback to memory:', e);
      }
    }
    const store = getStore();
    return store.plans.get(clientId) || [];
  }

  static async getCurrentPlan(clientId: string): Promise<NutritionalPlan | null> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .eq('client_id', clientId)
          .eq('is_current', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!error && data) {
          return this.mapPlanFromDb(data);
        }
      } catch (e) {
        console.warn('Supabase getCurrentPlan error:', e);
      }
    }
    const store = getStore();
    const plans = store.plans.get(clientId) || [];
    return plans.find((p) => p.isPublished) || plans[0] || null;
  }

  static async getActivePlan(clientId: string): Promise<NutritionalPlan | null> {
    return this.getCurrentPlan(clientId);
  }

  static async getPlanById(id: string): Promise<NutritionalPlan | null> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) {
          return this.mapPlanFromDb(data);
        }
      } catch (e) {
        console.warn('Supabase getPlanById error:', e);
      }
    }
    const store = getStore();
    for (const plans of store.plans.values()) {
      const match = plans.find((p) => p.id === id);
      if (match) return match;
    }
    return null;
  }

  static async savePlan(planData: Omit<NutritionalPlan, 'id' | 'createdAt'>): Promise<NutritionalPlan> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newPlan: NutritionalPlan = {
      ...planData,
      id,
      createdAt: now,
    };

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        // Mark previous plans for this client as is_current = false
        await supabase
          .from('plans')
          .update({ is_current: false })
          .eq('client_id', newPlan.clientId);

        const { error } = await supabase.from('plans').insert({
          id,
          client_id: newPlan.clientId,
          biometric_log_id: newPlan.biometricLogId,
          formula_used: newPlan.formulaUsed,
          lbm_kg: newPlan.lbmKg,
          tmb_kcal: newPlan.tmbKcal,
          getd_kcal: newPlan.getdKcal,
          goal: newPlan.goal,
          goal_adjustment_pct: newPlan.goalAdjustmentPct,
          target_kcal: newPlan.targetKcal,
          caloric_floor_min: newPlan.caloricFloorMin,
          caloric_floor_override: newPlan.caloricFloorOverride,
          bmi: newPlan.bmi,
          is_obese: newPlan.isObese,
          adjusted_weight_kg: newPlan.adjustedWeightKg,
          protein_g: newPlan.proteinG,
          protein_ratio_g_kg: newPlan.proteinRatioGKg,
          fat_g: newPlan.fatG,
          fat_ratio_g_kg: newPlan.fatRatioGKg,
          carbs_g: newPlan.carbsG,
          meal_count: newPlan.mealCount,
          meal_structure: newPlan.mealStructure,
          workout_split: newPlan.workoutSplit,
          workout_structure: newPlan.workoutStructure,
          clinical_alert_notes: newPlan.clinicalAlertNotes,
          is_published: newPlan.isPublished,
          is_current: true,
          created_at: now,
        });

        if (error) console.warn('Supabase savePlan error:', error);
      } catch (e) {
        console.warn('Supabase savePlan failed:', e);
      }
    }

    const store = getStore();
    const clientPlans = store.plans.get(newPlan.clientId) || [];
    clientPlans.unshift(newPlan);
    store.plans.set(newPlan.clientId, clientPlans);

    return newPlan;
  }

  // ==========================================================================
  // PERMALINKS
  // ==========================================================================
  static async getPermalinkBySlug(slug: string): Promise<PermalinkRecord | null> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        const { data, error } = await supabase
          .from('permalinks')
          .select('*')
          .eq('slug_token', slug)
          .maybeSingle();
        if (!error && data) {
          return this.mapPermalinkFromDb(data);
        }
      } catch (e) {
        console.warn('Supabase getPermalinkBySlug error:', e);
      }
    }
    const store = getStore();
    return store.permalinks.get(slug) || null;
  }

  static async getPermalinkByClientId(clientId: string): Promise<PermalinkRecord | null> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        const { data, error } = await supabase
          .from('permalinks')
          .select('*')
          .eq('client_id', clientId)
          .maybeSingle();
        if (!error && data) {
          return this.mapPermalinkFromDb(data);
        }
      } catch (e) {
        console.warn('Supabase getPermalinkByClientId error:', e);
      }
    }
    const store = getStore();
    for (const record of store.permalinks.values()) {
      if (record.clientId === clientId) return record;
    }
    return null;
  }

  static async createOrUpdatePermalink(
    paramsOrClientId:
      | string
      | {
          clientId: string;
          pin?: string;
          slugToken?: string;
          currentPlanId?: string | null;
          isActive?: boolean;
          expiresAt?: string | null;
        },
    argSlug?: string,
    argPin?: string,
    argPlanId?: string | null
  ): Promise<PermalinkRecord> {
    let clientId: string;
    let slugToken: string;
    let plainPin: string;
    let currentPlanId: string | null | undefined;
    let isActive: boolean | undefined;
    let expiresAt: string | null | undefined;

    if (typeof paramsOrClientId === 'object') {
      clientId = paramsOrClientId.clientId;
      plainPin = paramsOrClientId.pin || 'NUT-482';
      slugToken = paramsOrClientId.slugToken || nanoid(12);
      currentPlanId = paramsOrClientId.currentPlanId;
      isActive = paramsOrClientId.isActive;
      expiresAt = paramsOrClientId.expiresAt;
    } else {
      clientId = paramsOrClientId;
      slugToken = argSlug || nanoid(12);
      plainPin = argPin || 'NUT-482';
      currentPlanId = argPlanId;
    }

    const existing = await this.getPermalinkByClientId(clientId);
    const now = new Date().toISOString();
    const pin = plainPin || existing?.passwordHintAdmin || 'NUT-482';
    const pinHash = hashPin(pin);
    const finalSlug = existing ? existing.slugToken : (slugToken || nanoid(12));

    const record: PermalinkRecord = {
      id: existing ? existing.id : crypto.randomUUID(),
      clientId,
      currentPlanId: currentPlanId !== undefined ? currentPlanId : (existing?.currentPlanId || null),
      slugToken: finalSlug,
      passwordHash: pinHash,
      passwordHintAdmin: pin,
      isActive: isActive !== undefined ? isActive : (existing ? existing.isActive : true),
      expiresAt: expiresAt !== undefined ? expiresAt : (existing?.expiresAt || null),
      lastAccessedAt: existing?.lastAccessedAt || null,
      accessCount: existing?.accessCount || 0,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    };

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        const { error } = await supabase.from('permalinks').upsert(
          {
            id: record.id,
            client_id: record.clientId,
            current_plan_id: record.currentPlanId,
            slug_token: record.slugToken,
            password_hash: record.passwordHash,
            password_hint_admin: record.passwordHintAdmin,
            is_active: record.isActive,
            expires_at: record.expiresAt,
            last_accessed_at: record.lastAccessedAt,
            access_count: record.accessCount,
            created_at: record.createdAt,
            updated_at: now,
          },
          { onConflict: 'client_id' }
        );
        if (error) console.warn('Supabase permalink upsert error:', error);
      } catch (e) {
        console.warn('Supabase permalink upsert failed:', e);
      }
    }

    const store = getStore();
    store.permalinks.set(record.slugToken, record);
    return record;
  }

  static async updatePermalinkStatus(slug: string, isActive: boolean): Promise<boolean> {
    const record = await this.getPermalinkBySlug(slug);
    if (!record) return false;

    const now = new Date().toISOString();
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        await supabase
          .from('permalinks')
          .update({ is_active: isActive, updated_at: now })
          .eq('slug_token', slug);
      } catch (e) {
        console.warn('Supabase toggle failed:', e);
      }
    }

    record.isActive = isActive;
    record.updatedAt = now;
    const store = getStore();
    store.permalinks.set(slug, record);
    return true;
  }

  static async togglePermalinkActive(slug: string, isActive: boolean): Promise<boolean> {
    return this.updatePermalinkStatus(slug, isActive);
  }

  static async updatePermalinkPin(slug: string, newPin: string): Promise<boolean> {
    const record = await this.getPermalinkBySlug(slug);
    if (!record) return false;

    const now = new Date().toISOString();
    const newHash = hashPin(newPin);

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        await supabase
          .from('permalinks')
          .update({
            password_hash: newHash,
            password_hint_admin: newPin,
            updated_at: now,
          })
          .eq('slug_token', slug);
      } catch (e) {
        console.warn('Supabase PIN update failed:', e);
      }
    }

    record.passwordHash = newHash;
    record.passwordHintAdmin = newPin;
    record.updatedAt = now;
    const store = getStore();
    store.permalinks.set(slug, record);
    return true;
  }

  static async updatePermalinkExpiration(slug: string, expiresAt: string | null): Promise<boolean> {
    const record = await this.getPermalinkBySlug(slug);
    if (!record) return false;

    const now = new Date().toISOString();
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        await supabase
          .from('permalinks')
          .update({ expires_at: expiresAt, updated_at: now })
          .eq('slug_token', slug);
      } catch (e) {
        console.warn('Supabase expiration update failed:', e);
      }
    }

    record.expiresAt = expiresAt;
    record.updatedAt = now;
    const store = getStore();
    store.permalinks.set(slug, record);
    return true;
  }

  static async incrementPermalinkAccess(slug: string): Promise<void> {
    const now = new Date().toISOString();
    const store = getStore();
    const record = store.permalinks.get(slug);
    if (record) {
      record.accessCount += 1;
      record.lastAccessedAt = now;
    }

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        const { error } = await supabase.rpc('increment_permalink_access', { p_slug: slug });
        if (error && record) {
          await supabase
            .from('permalinks')
            .update({
              access_count: record.accessCount,
              last_accessed_at: now,
            })
            .eq('slug_token', slug);
        }
      } catch {
        // Ignored fallback
      }
    }
  }

  // ==========================================================================
  // FOOD CATALOG
  // ==========================================================================
  static async getFoodCatalog(filters?: {
    group?: string;
    excludeAllergens?: AllergenTag[];
    search?: string;
  }): Promise<FoodCatalogItem[]> {
    let items: FoodCatalogItem[] = [];

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        let query = supabase.from('food_catalog').select('*').eq('is_active', true);
        if (filters?.group && filters.group !== 'all') {
          query = query.eq('smae_group', filters.group);
        }
        if (filters?.search) {
          query = query.ilike('name', `%${filters.search}%`);
        }
        const { data, error } = await query.order('name', { ascending: true });
        if (!error && data && data.length > 0) {
          items = data.map(this.mapFoodFromDb);
        }
      } catch (e) {
        console.warn('Supabase food catalog query failed:', e);
      }
    }

    if (items.length === 0) {
      // Fallback from DEFAULT_FOOD_CATALOG
      items = DEFAULT_FOOD_CATALOG.map((f) => ({
        id: f.id,
        name: f.name,
        smaeGroup: f.group,
        portionQty: f.portionQty,
        portionUnit: f.portionUnit,
        gramsNet: f.gramsNet,
        kcal: f.group === 'aoa' ? 40 : f.group === 'cereals' ? 70 : f.group === 'legumes' ? 120 : f.group === 'vegetables' ? 25 : f.group === 'fruits' ? 60 : f.group === 'fats' ? 45 : 95,
        proteinG: f.group === 'aoa' ? 7 : f.group === 'cereals' ? 2 : f.group === 'legumes' ? 8 : f.group === 'vegetables' ? 2 : f.group === 'fruits' ? 0 : f.group === 'fats' ? 0 : 9,
        fatG: f.group === 'fats' ? 5 : f.group === 'aoa' ? 1 : 0,
        carbsG: f.group === 'cereals' ? 15 : f.group === 'legumes' ? 20 : f.group === 'fruits' ? 15 : f.group === 'vegetables' ? 4 : 0,
        allergenTags: f.allergens,
        isActive: true,
      }));

      if (filters?.group && filters.group !== 'all') {
        items = items.filter((i) => i.smaeGroup === filters.group);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        items = items.filter((i) => i.name.toLowerCase().includes(q));
      }
    }

    if (filters?.excludeAllergens && filters.excludeAllergens.length > 0) {
      items = items.filter(
        (food) => !food.allergenTags.some((tag) => filters.excludeAllergens!.includes(tag))
      );
    }

    return items;
  }

  static async createFoodItem(data: Omit<FoodCatalogItem, 'id' | 'createdAt'>): Promise<FoodCatalogItem> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newItem: FoodCatalogItem = { ...data, id, isActive: true, createdAt: now };

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        await supabase.from('food_catalog').insert({
          id,
          name: newItem.name,
          smae_group: newItem.smaeGroup,
          portion_qty: newItem.portionQty,
          portion_unit: newItem.portionUnit,
          grams_net: newItem.gramsNet,
          kcal: newItem.kcal,
          protein_g: newItem.proteinG,
          fat_g: newItem.fatG,
          carbs_g: newItem.carbsG,
          allergen_tags: newItem.allergenTags,
          is_active: true,
          created_at: now,
        });
      } catch (e) {
        console.warn('Supabase food insert failed:', e);
      }
    }

    const store = getStore();
    store.foodCatalog.set(id, newItem);
    return newItem;
  }

  static async updateFoodItem(id: string, updates: Partial<FoodCatalogItem>): Promise<FoodCatalogItem | null> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.smaeGroup !== undefined) dbUpdates.smae_group = updates.smaeGroup;
        if (updates.portionQty !== undefined) dbUpdates.portion_qty = updates.portionQty;
        if (updates.portionUnit !== undefined) dbUpdates.portion_unit = updates.portionUnit;
        if (updates.gramsNet !== undefined) dbUpdates.grams_net = updates.gramsNet;
        if (updates.kcal !== undefined) dbUpdates.kcal = updates.kcal;
        if (updates.proteinG !== undefined) dbUpdates.protein_g = updates.proteinG;
        if (updates.fatG !== undefined) dbUpdates.fat_g = updates.fatG;
        if (updates.carbsG !== undefined) dbUpdates.carbs_g = updates.carbsG;
        if (updates.allergenTags !== undefined) dbUpdates.allergen_tags = updates.allergenTags;
        if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

        const { data, error } = await supabase
          .from('food_catalog')
          .update(dbUpdates)
          .eq('id', id)
          .select('*')
          .maybeSingle();

        if (!error && data) {
          return this.mapFoodFromDb(data);
        }
      } catch (e) {
        console.warn('Supabase food update failed:', e);
      }
    }

    const store = getStore();
    const existing = store.foodCatalog.get(id);
    if (existing) {
      const merged = { ...existing, ...updates };
      store.foodCatalog.set(id, merged);
      return merged;
    }
    return null;
  }

  static async deleteFoodItem(id: string): Promise<boolean> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        await supabase.from('food_catalog').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase food delete failed:', e);
      }
    }
    const store = getStore();
    store.foodCatalog.delete(id);
    return true;
  }

  // ==========================================================================
  // EXERCISE CATALOG
  // ==========================================================================
  static async getExerciseCatalog(filters?: {
    pattern?: string;
    equipment?: string;
    excludeJointStress?: string[];
    search?: string;
  }): Promise<ExerciseCatalogItem[]> {
    let items: ExerciseCatalogItem[] = [];

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        let query = supabase.from('exercise_catalog').select('*').eq('is_active', true);
        if (filters?.pattern && filters.pattern !== 'all') {
          query = query.eq('movement_pattern', filters.pattern);
        }
        if (filters?.equipment && filters.equipment !== 'all') {
          query = query.eq('equipment_required', filters.equipment);
        }
        if (filters?.search) {
          query = query.ilike('name', `%${filters.search}%`);
        }
        const { data, error } = await query.order('name', { ascending: true });
        if (!error && data && data.length > 0) {
          items = data.map(this.mapExerciseFromDb);
        }
      } catch (e) {
        console.warn('Supabase exercise query failed:', e);
      }
    }

    if (items.length === 0) {
      items = EXERCISE_DATABASE.map((ex) => ({
        id: ex.id,
        name: ex.name,
        movementPattern: ex.movementPattern,
        primaryMuscle: 'Cadena muscular principal',
        equipmentRequired: ex.equipmentRequired,
        difficulty: 'intermediate',
        jointStressTags: ex.jointStressTags as any,
        defaultSets: ex.defaultSets,
        defaultReps: ex.defaultReps,
        defaultRestSec: ex.defaultRestSec,
        instructions: ex.instructions,
        isActive: true,
      }));

      if (filters?.pattern && filters.pattern !== 'all') {
        items = items.filter((i) => i.movementPattern === filters.pattern);
      }
      if (filters?.equipment && filters.equipment !== 'all') {
        items = items.filter((i) => i.equipmentRequired === filters.equipment);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        items = items.filter((i) => i.name.toLowerCase().includes(q));
      }
    }

    if (filters?.excludeJointStress && filters.excludeJointStress.length > 0) {
      items = items.filter(
        (ex) => !ex.jointStressTags.some((tag) => filters.excludeJointStress!.includes(tag))
      );
    }

    return items;
  }

  static async createExerciseItem(data: Omit<ExerciseCatalogItem, 'id' | 'createdAt'>): Promise<ExerciseCatalogItem> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newItem: ExerciseCatalogItem = { ...data, id, isActive: true, createdAt: now };

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        await supabase.from('exercise_catalog').insert({
          id,
          name: newItem.name,
          movement_pattern: newItem.movementPattern,
          primary_muscle: newItem.primaryMuscle,
          equipment_required: newItem.equipmentRequired,
          difficulty: newItem.difficulty,
          joint_stress_tags: newItem.jointStressTags,
          default_sets: newItem.defaultSets,
          default_reps: newItem.defaultReps,
          default_rest_sec: newItem.defaultRestSec,
          instructions: newItem.instructions,
          video_url: newItem.videoUrl,
          is_active: true,
          created_at: now,
        });
      } catch (e) {
        console.warn('Supabase exercise insert failed:', e);
      }
    }

    const store = getStore();
    store.exerciseCatalog.set(id, newItem);
    return newItem;
  }

  static async updateExerciseItem(id: string, updates: Partial<ExerciseCatalogItem>): Promise<ExerciseCatalogItem | null> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.movementPattern !== undefined) dbUpdates.movement_pattern = updates.movementPattern;
        if (updates.primaryMuscle !== undefined) dbUpdates.primary_muscle = updates.primaryMuscle;
        if (updates.equipmentRequired !== undefined) dbUpdates.equipment_required = updates.equipmentRequired;
        if (updates.difficulty !== undefined) dbUpdates.difficulty = updates.difficulty;
        if (updates.jointStressTags !== undefined) dbUpdates.joint_stress_tags = updates.jointStressTags;
        if (updates.defaultSets !== undefined) dbUpdates.default_sets = updates.defaultSets;
        if (updates.defaultReps !== undefined) dbUpdates.default_reps = updates.defaultReps;
        if (updates.defaultRestSec !== undefined) dbUpdates.default_rest_sec = updates.defaultRestSec;
        if (updates.instructions !== undefined) dbUpdates.instructions = updates.instructions;
        if (updates.videoUrl !== undefined) dbUpdates.video_url = updates.videoUrl;
        if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

        const { data, error } = await supabase
          .from('exercise_catalog')
          .update(dbUpdates)
          .eq('id', id)
          .select('*')
          .maybeSingle();

        if (!error && data) {
          return this.mapExerciseFromDb(data);
        }
      } catch (e) {
        console.warn('Supabase exercise update failed:', e);
      }
    }

    const store = getStore();
    const existing = store.exerciseCatalog.get(id);
    if (existing) {
      const merged = { ...existing, ...updates };
      store.exerciseCatalog.set(id, merged);
      return merged;
    }
    return null;
  }

  static async deleteExerciseItem(id: string): Promise<boolean> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        await supabase.from('exercise_catalog').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase exercise delete failed:', e);
      }
    }
    const store = getStore();
    store.exerciseCatalog.delete(id);
    return true;
  }

  // ==========================================================================
  // SEED & METRICS
  // ==========================================================================
  static async seedCatalogsIfNeeded(force: boolean = false): Promise<{ foodsCount: number; exercisesCount: number }> {
    if (!this.isSupabaseConfigured()) {
      return { foodsCount: 0, exercisesCount: 0 };
    }

    const supabase = createAdminSupabaseClient();

    // Check foods
    const { count: foodCount } = await supabase
      .from('food_catalog')
      .select('*', { count: 'exact', head: true });

    let insertedFoods = 0;
    if (force || !foodCount || foodCount === 0) {
      const foodsToInsert = DEFAULT_FOOD_CATALOG.map((f) => ({
        name: f.name,
        smae_group: f.group,
        portion_qty: f.portionQty,
        portion_unit: f.portionUnit,
        grams_net: f.gramsNet,
        kcal: f.group === 'aoa' ? 40 : f.group === 'cereals' ? 70 : f.group === 'legumes' ? 120 : f.group === 'vegetables' ? 25 : f.group === 'fruits' ? 60 : f.group === 'fats' ? 45 : 95,
        protein_g: f.group === 'aoa' ? 7 : f.group === 'cereals' ? 2 : f.group === 'legumes' ? 8 : f.group === 'vegetables' ? 2 : f.group === 'fruits' ? 0 : f.group === 'fats' ? 0 : 9,
        fat_g: f.group === 'fats' ? 5 : f.group === 'aoa' ? 1 : 0,
        carbs_g: f.group === 'cereals' ? 15 : f.group === 'legumes' ? 20 : f.group === 'fruits' ? 15 : f.group === 'vegetables' ? 4 : 0,
        allergen_tags: f.allergens,
        is_active: true,
      }));

      const { data } = await supabase.from('food_catalog').insert(foodsToInsert).select();
      insertedFoods = data?.length || foodsToInsert.length;
    }

    // Check exercises
    const { count: exCount } = await supabase
      .from('exercise_catalog')
      .select('*', { count: 'exact', head: true });

    let insertedExercises = 0;
    if (force || !exCount || exCount === 0) {
      const exercisesToInsert = EXERCISE_DATABASE.map((ex) => ({
        name: ex.name,
        movement_pattern: ex.movementPattern,
        primary_muscle: 'Cadena principal',
        equipment_required: ex.equipmentRequired,
        difficulty: 'intermediate',
        joint_stress_tags: ex.jointStressTags,
        default_sets: ex.defaultSets,
        default_reps: ex.defaultReps,
        default_rest_sec: ex.defaultRestSec,
        instructions: ex.instructions,
        is_active: true,
      }));

      const { data } = await supabase.from('exercise_catalog').insert(exercisesToInsert).select();
      insertedExercises = data?.length || exercisesToInsert.length;
    }

    return { foodsCount: insertedFoods, exercisesCount: insertedExercises };
  }

  static async getSystemMetrics(): Promise<{
    totalClients: number;
    checkInsThisMonth: number;
    activePermalinks: number;
    inactivePermalinks: number;
    totalFoods: number;
    totalExercises: number;
    recentClients: ClientProfile[];
  }> {
    const clients = await this.getClients();
    const activeClients = clients.filter((c) => c.isActive !== false);

    let checkInsThisMonth = 0;
    let activePermalinks = 0;
    let inactivePermalinks = 0;
    let totalFoods = 0;
    let totalExercises = 0;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startIso = startOfMonth.toISOString();

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        const [
          { count: checkInsCount },
          { count: activeLinksCount },
          { count: inactiveLinksCount },
          { count: foodsCount },
          { count: exercisesCount },
        ] = await Promise.all([
          supabase.from('biometric_logs').select('*', { count: 'exact', head: true }).gte('created_at', startIso),
          supabase.from('permalinks').select('*', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('permalinks').select('*', { count: 'exact', head: true }).eq('is_active', false),
          supabase.from('food_catalog').select('*', { count: 'exact', head: true }),
          supabase.from('exercise_catalog').select('*', { count: 'exact', head: true }),
        ]);

        checkInsThisMonth = checkInsCount || 0;
        activePermalinks = activeLinksCount || 0;
        inactivePermalinks = inactiveLinksCount || 0;
        totalFoods = foodsCount || 0;
        totalExercises = exercisesCount || 0;
      } catch (e) {
        console.warn('Supabase getSystemMetrics error:', e);
      }
    }

    // Fallbacks if zero or local store
    if (totalFoods === 0) totalFoods = DEFAULT_FOOD_CATALOG.length;
    if (totalExercises === 0) totalExercises = EXERCISE_DATABASE.length;
    if (activePermalinks === 0 && inactivePermalinks === 0) {
      const store = getStore();
      for (const p of store.permalinks.values()) {
        if (p.isActive) activePermalinks++;
        else inactivePermalinks++;
      }
    }

    return {
      totalClients: activeClients.length,
      checkInsThisMonth,
      activePermalinks,
      inactivePermalinks,
      totalFoods,
      totalExercises,
      recentClients: clients.slice(0, 5),
    };
  }

  // ==========================================================================
  // DB MAPPERS
  // ==========================================================================
  private static mapClientFromDb(row: any): ClientProfile {
    return {
      id: row.id,
      fullName: row.full_name,
      birthDate: row.birth_date,
      sex: row.sex,
      heightCm: Number(row.height_cm),
      phoneWhatsapp: row.phone_whatsapp || row.phone,
      phone: row.phone || row.phone_whatsapp,
      email: row.email,
      clinicalFlags: row.clinical_flags || [],
      allergies: row.allergies || [],
      notes: row.notes,
      isActive: row.is_active !== undefined ? Boolean(row.is_active) : true,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private static mapBiometricFromDb(row: any): BiometricLog {
    return {
      id: row.id,
      clientId: row.client_id,
      recordedAt: row.recorded_at,
      weightKg: Number(row.weight_kg),
      bodyFatPct: row.body_fat_pct ? Number(row.body_fat_pct) : undefined,
      muscleMassKg: row.muscle_mass_kg ? Number(row.muscle_mass_kg) : undefined,
      waistCm: row.waist_cm ? Number(row.waist_cm) : undefined,
      hipCm: row.hip_cm ? Number(row.hip_cm) : undefined,
      abdomenCm: row.abdomen_cm ? Number(row.abdomen_cm) : undefined,
      armRelaxedCm: row.arm_relaxed_cm ? Number(row.arm_relaxed_cm) : undefined,
      armContractedCm: row.arm_contracted_cm ? Number(row.arm_contracted_cm) : undefined,
      thighCm: row.thigh_cm ? Number(row.thigh_cm) : undefined,
      activityFactor: Number(row.activity_factor),
      trainingDays: Number(row.training_days),
      equipmentAvailable: row.equipment_available || ['gym'],
      notes: row.notes,
      createdAt: row.created_at,
    };
  }

  private static mapPlanFromDb(row: any): NutritionalPlan {
    return {
      id: row.id,
      clientId: row.client_id,
      biometricLogId: row.biometric_log_id,
      formulaUsed: row.formula_used,
      lbmKg: row.lbm_kg ? Number(row.lbm_kg) : undefined,
      tmbKcal: Number(row.tmb_kcal),
      getdKcal: Number(row.getd_kcal),
      goal: row.goal,
      goalAdjustmentPct: Number(row.goal_adjustment_pct),
      targetKcal: Number(row.target_kcal),
      caloricFloorMin: Number(row.caloric_floor_min),
      caloricFloorOverride: Boolean(row.caloric_floor_override),
      bmi: Number(row.bmi),
      isObese: Boolean(row.is_obese),
      adjustedWeightKg: row.adjusted_weight_kg ? Number(row.adjusted_weight_kg) : undefined,
      proteinG: Number(row.protein_g),
      proteinRatioGKg: Number(row.protein_ratio_g_kg),
      fatG: Number(row.fat_g),
      fatRatioGKg: Number(row.fat_ratio_g_kg),
      carbsG: Number(row.carbs_g),
      mealCount: Number(row.meal_count),
      mealStructure: row.meal_structure || [],
      workoutSplit: row.workout_split,
      workoutStructure: row.workout_structure || [],
      clinicalAlertNotes: row.clinical_alert_notes,
      hydrationMl: Math.round(Number(row.target_kcal) * 1.3),
      isPublished: Boolean(row.is_published),
      createdAt: row.created_at,
    };
  }

  private static mapPermalinkFromDb(row: any): PermalinkRecord {
    return {
      id: row.id,
      clientId: row.client_id,
      currentPlanId: row.current_plan_id,
      slugToken: row.slug_token,
      passwordHash: row.password_hash,
      passwordHintAdmin: row.password_hint_admin,
      isActive: Boolean(row.is_active),
      expiresAt: row.expires_at,
      lastAccessedAt: row.last_accessed_at,
      accessCount: Number(row.access_count),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private static mapFoodFromDb(row: any): FoodCatalogItem {
    return {
      id: row.id,
      name: row.name,
      smaeGroup: row.smae_group,
      portionQty: Number(row.portion_qty),
      portionUnit: row.portion_unit,
      gramsNet: Number(row.grams_net),
      kcal: Number(row.kcal),
      proteinG: Number(row.protein_g),
      fatG: Number(row.fat_g),
      carbsG: Number(row.carbs_g),
      allergenTags: row.allergen_tags || [],
      isActive: row.is_active !== undefined ? Boolean(row.is_active) : true,
      createdAt: row.created_at,
    };
  }

  private static mapExerciseFromDb(row: any): ExerciseCatalogItem {
    return {
      id: row.id,
      name: row.name,
      movementPattern: row.movement_pattern,
      primaryMuscle: row.primary_muscle || 'General',
      equipmentRequired: row.equipment_required,
      difficulty: row.difficulty || 'intermediate',
      jointStressTags: row.joint_stress_tags || [],
      defaultSets: Number(row.default_sets || 3),
      defaultReps: String(row.default_reps || '10-12'),
      defaultRestSec: Number(row.default_rest_sec || 90),
      instructions: row.instructions,
      videoUrl: row.video_url,
      isActive: row.is_active !== undefined ? Boolean(row.is_active) : true,
      createdAt: row.created_at,
    };
  }
}
