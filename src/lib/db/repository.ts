import {
  ClientProfile,
  BiometricLog,
  NutritionalPlan,
  PermalinkRecord,
} from '../types/clinical';
import { hashPin } from '../security/auth';
import { createAdminSupabaseClient } from '../supabase/server';

// Initial seed data for pilot patient: Carlos Mendoza Silva (#BIO-9942)
const INITIAL_CLIENT: ClientProfile = {
  id: 'c1111111-1111-1111-1111-111111111111',
  fullName: 'Carlos Mendoza Silva',
  birthDate: '1993-05-14',
  sex: 'male',
  heightCm: 179,
  phoneWhatsapp: '+52 55 1234 5678',
  email: 'carlos.mendoza@ejemplo.com',
  clinicalFlags: ['diabetes_type_2', 'knee_injury'],
  allergies: [],
  notes: '8 meses en seguimiento. Lesión en tendón rotuliano derecho en fase de remodelación. Diabetes Tipo 2 controlada con metformina. Restricción de aporte proteico agresivo > 2.0 g/kg.',
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
    id: 'b1111111-0002-0000-0000-000000000002',
    clientId: 'c1111111-1111-1111-1111-111111111111',
    recordedAt: '2024-05-15',
    weightKg: 89.1,
    bodyFatPct: 22.0,
    muscleMassKg: 65.1,
    waistCm: 92.5,
    hipCm: 102.0,
    abdomenCm: 94.0,
    armRelaxedCm: 34.5,
    armContractedCm: 37.0,
    thighCm: 58.5,
    activityFactor: 1.5,
    trainingDays: 4,
    equipmentAvailable: ['gym'],
    notes: 'Consulta #4. Buena adherencia, glucemia en ayuno estabilizada.',
    createdAt: '2024-05-15T10:00:00Z',
  },
  {
    id: 'b1111111-0003-0000-0000-000000000003',
    clientId: 'c1111111-1111-1111-1111-111111111111',
    recordedAt: '2024-08-10',
    weightKg: 86.4,
    bodyFatPct: 19.8,
    muscleMassKg: 67.0,
    waistCm: 89.0,
    hipCm: 100.0,
    abdomenCm: 90.5,
    armRelaxedCm: 35.0,
    armContractedCm: 38.0,
    thighCm: 58.0,
    activityFactor: 1.55,
    trainingDays: 4,
    equipmentAvailable: ['gym'],
    notes: 'Consulta #7. Reducción notoria en perímetro abdominal (-3.5cm).',
    createdAt: '2024-08-10T10:00:00Z',
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
    {
      dayName: 'Día 3 - Torso B (Fuerza Vertical & Tracción)',
      focus: 'Dorsales amplios y deltoides posterior',
      exercises: [
        { id: 'ex_9', name: 'Jalón al Pecho con Agarre Neutro', movementPattern: 'pull_v', equipment: 'machine', jointStressTags: [], sets: 4, reps: '10-12', restSec: 90, rpe: 8, notes: 'Tracción controlada hacia el esternón.' },
        { id: 'ex_10', name: 'Press en Máquina con Agarre Neutro', movementPattern: 'push_h', equipment: 'machine', jointStressTags: [], sets: 4, reps: '12', restSec: 75, rpe: 7.5, notes: 'Cero pinzamiento subacromial.' },
        { id: 'ex_11', name: 'Remo Gironda en Polea Baja', movementPattern: 'pull_h', equipment: 'gym', jointStressTags: [], sets: 4, reps: '12', restSec: 75, rpe: 8, notes: 'Enfocar la retracción de escápulas.' },
        { id: 'ex_12', name: 'Face Pulls en Polea con Cuerda', movementPattern: 'pull_h', equipment: 'gym', jointStressTags: [], sets: 4, reps: '15', restSec: 60, rpe: 7.5, notes: 'Salud escapular y manguito rotador.' },
      ],
    },
    {
      dayName: 'Día 4 - Pierna B (Cadena Posterior & Isquiotibiales)',
      focus: 'Bisagra de cadera y fuerza de glúteo',
      exercises: [
        { id: 'ex_13', name: 'Peso Muerto Rumano con Mancuernas', movementPattern: 'hinge', equipment: 'dumbbells', jointStressTags: [], sets: 4, reps: '10-12', restSec: 90, rpe: 8, notes: 'Espalda neutra, recorrido hasta media tibia.' },
        { id: 'ex_14', name: 'Curl Femoral Tumbado en Máquina', movementPattern: 'hinge', equipment: 'machine', jointStressTags: [], sets: 4, reps: '12-14', restSec: 75, rpe: 8.5, notes: 'Fase excéntrica lenta de 3 segundos.' },
        { id: 'ex_15', name: 'Puente de Glúteos en Suelo Unilateral', movementPattern: 'hinge', equipment: 'bodyweight', jointStressTags: [], sets: 3, reps: '15 por pierna', restSec: 60, rpe: 7, notes: 'Activación neuromuscular sin sobrecarga.' },
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
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  lastAccessedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
  accessCount: 14,
  createdAt: '2024-10-24T18:00:00Z',
  updatedAt: '2024-10-24T18:00:00Z',
};

// Global in-memory data store (persists across server requests in process)
interface GlobalStore {
  clients: Map<string, ClientProfile>;
  biometrics: Map<string, BiometricLog[]>;
  plans: Map<string, NutritionalPlan>;
  permalinks: Map<string, PermalinkRecord>;
}

declare global {
  var __nutsegStore: GlobalStore | undefined;
}

function getStore(): GlobalStore {
  if (!global.__nutsegStore) {
    const clients = new Map<string, ClientProfile>();
    const biometrics = new Map<string, BiometricLog[]>();
    const plans = new Map<string, NutritionalPlan>();
    const permalinks = new Map<string, PermalinkRecord>();

    clients.set(INITIAL_CLIENT.id, INITIAL_CLIENT);
    biometrics.set(INITIAL_CLIENT.id, [...INITIAL_LOGS]);
    plans.set(INITIAL_CLIENT.id, INITIAL_PLAN);
    permalinks.set(INITIAL_PERMALINK.slugToken, INITIAL_PERMALINK);

    global.__nutsegStore = { clients, biometrics, plans, permalinks };
  }
  return global.__nutsegStore;
}

export class NutritionRepository {
  /**
   * Check if live Supabase is configured and reachable.
   */
  private static isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes('placeholder.supabase.co'));
  }

  // --- CLIENTS ---
  static async getClients(): Promise<ClientProfile[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          return data.map(this.mapClientFromDb);
        }
      } catch (e) {
        console.warn('Supabase query failed, using local store:', e);
      }
    }
    const store = getStore();
    return Array.from(store.clients.values());
  }

  static async getClientById(id: string): Promise<ClientProfile | null> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
        if (!error && data) {
          return this.mapClientFromDb(data);
        }
      } catch (e) {
        console.warn('Supabase query failed, using local store:', e);
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
      createdAt: now,
      updatedAt: now,
    };

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        await supabase.from('clients').insert({
          id,
          full_name: newClient.fullName,
          birth_date: newClient.birthDate,
          sex: newClient.sex,
          height_cm: newClient.heightCm,
          phone_whatsapp: newClient.phoneWhatsapp,
          email: newClient.email,
          clinical_flags: newClient.clinicalFlags,
          allergies: newClient.allergies,
          notes: newClient.notes,
        });
      } catch (e) {
        console.warn('Supabase insert failed, saving to local store:', e);
      }
    }

    const store = getStore();
    store.clients.set(id, newClient);
    return newClient;
  }

  // --- BIOMETRICS ---
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
        console.warn('Supabase query failed, using local store:', e);
      }
    }
    const store = getStore();
    return store.biometrics.get(clientId) || [];
  }

  static async addBiometricLog(data: Omit<BiometricLog, 'id' | 'createdAt'>): Promise<BiometricLog> {
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
        await supabase.from('biometric_logs').insert({
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
        });
      } catch (e) {
        console.warn('Supabase insert failed, saving to local store:', e);
      }
    }

    const store = getStore();
    const logs = store.biometrics.get(data.clientId) || [];
    logs.push(newLog);
    store.biometrics.set(data.clientId, logs);
    return newLog;
  }

  // --- PLANS ---
  static async getActivePlan(clientId: string): Promise<NutritionalPlan | null> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .eq('client_id', clientId)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (!error && data) {
          return this.mapPlanFromDb(data);
        }
      } catch (e) {
        console.warn('Supabase query failed, using local store:', e);
      }
    }
    const store = getStore();
    return store.plans.get(clientId) || null;
  }

  static async savePlan(plan: NutritionalPlan): Promise<NutritionalPlan> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        await supabase.from('plans').upsert({
          id: plan.id,
          client_id: plan.clientId,
          biometric_log_id: plan.biometricLogId,
          formula_used: plan.formulaUsed,
          lbm_kg: plan.lbmKg,
          tmb_kcal: plan.tmbKcal,
          getd_kcal: plan.getdKcal,
          goal: plan.goal,
          goal_adjustment_pct: plan.goalAdjustmentPct,
          target_kcal: plan.targetKcal,
          caloric_floor_min: plan.caloricFloorMin,
          caloric_floor_override: plan.caloricFloorOverride,
          bmi: plan.bmi,
          is_obese: plan.isObese,
          adjusted_weight_kg: plan.adjustedWeightKg,
          protein_g: plan.proteinG,
          protein_ratio_g_kg: plan.proteinRatioGKg,
          fat_g: plan.fatG,
          fat_ratio_g_kg: plan.fatRatioGKg,
          carbs_g: plan.carbsG,
          meal_count: plan.mealCount,
          meal_structure: plan.mealStructure,
          workout_split: plan.workoutSplit,
          workout_structure: plan.workoutStructure,
          clinical_alert_notes: plan.clinicalAlertNotes,
          is_published: plan.isPublished,
        });
      } catch (e) {
        console.warn('Supabase save plan failed, saving to local store:', e);
      }
    }

    const store = getStore();
    store.plans.set(plan.clientId, plan);
    return plan;
  }

  // --- PERMALINKS ---
  static async getPermalinkBySlug(slug: string): Promise<PermalinkRecord | null> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        const { data, error } = await supabase
          .from('permalinks')
          .select('*')
          .eq('slug_token', slug)
          .single();
        if (!error && data) {
          return this.mapPermalinkFromDb(data);
        }
      } catch (e) {
        console.warn('Supabase query failed, using local store:', e);
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
          .single();
        if (!error && data) {
          return this.mapPermalinkFromDb(data);
        }
      } catch (e) {
        console.warn('Supabase query failed, using local store:', e);
      }
    }
    const store = getStore();
    for (const record of store.permalinks.values()) {
      if (record.clientId === clientId) {
        return record;
      }
    }
    return null;
  }

  static async createOrUpdatePermalink(params: {
    clientId: string;
    pin: string;
    slugToken?: string;
    currentPlanId?: string;
  }): Promise<PermalinkRecord> {
    const existing = await this.getPermalinkByClientId(params.clientId);
    const slug = params.slugToken || existing?.slugToken || crypto.randomUUID().slice(0, 12).replace(/-/g, '');
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const pinClean = params.pin.trim().toUpperCase();

    const record: PermalinkRecord = {
      id: existing?.id || crypto.randomUUID(),
      clientId: params.clientId,
      currentPlanId: params.currentPlanId || existing?.currentPlanId || null,
      slugToken: slug,
      passwordHash: hashPin(pinClean),
      passwordHintAdmin: pinClean,
      isActive: existing ? existing.isActive : true,
      expiresAt: existing?.expiresAt || expiresAt,
      lastAccessedAt: existing?.lastAccessedAt || null,
      accessCount: existing ? existing.accessCount : 0,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    };

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        await supabase.from('permalinks').upsert({
          id: record.id,
          client_id: record.clientId,
          current_plan_id: record.currentPlanId,
          slug_token: record.slugToken,
          password_hash: record.passwordHash,
          password_hint_admin: record.passwordHintAdmin,
          is_active: record.isActive,
          expires_at: record.expiresAt,
          access_count: record.accessCount,
        });
      } catch (e) {
        console.warn('Supabase permalink upsert failed:', e);
      }
    }

    const store = getStore();
    store.permalinks.set(slug, record);
    return record;
  }

  static async togglePermalinkActive(slug: string, isActive: boolean): Promise<boolean> {
    const store = getStore();
    const record = store.permalinks.get(slug);

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        await supabase
          .from('permalinks')
          .update({ is_active: isActive, updated_at: new Date().toISOString() })
          .eq('slug_token', slug);
      } catch (e) {
        console.warn('Supabase toggle failed:', e);
      }
    }

    if (record) {
      record.isActive = isActive;
      record.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
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
        // Fallback or ignore if Supabase unavailable
      }
    }
  }

  // --- DB MAPPERS ---
  private static mapClientFromDb(row: any): ClientProfile {
    return {
      id: row.id,
      fullName: row.full_name,
      birthDate: row.birth_date,
      sex: row.sex,
      heightCm: Number(row.height_cm),
      phoneWhatsapp: row.phone_whatsapp,
      email: row.email,
      clinicalFlags: row.clinical_flags || [],
      allergies: row.allergies || [],
      notes: row.notes,
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
}
