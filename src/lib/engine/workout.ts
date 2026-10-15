import { ClinicalFlag, EquipmentType, ExercisePrescription, WorkoutDayPlan, WorkoutSplit } from '../types/clinical';

export interface ExerciseDefinition {
  id: string;
  name: string;
  movementPattern: 'squat' | 'hinge' | 'push_h' | 'push_v' | 'pull_h' | 'pull_v' | 'core' | 'arms';
  equipmentRequired: EquipmentType;
  jointStressTags: ('knee' | 'shoulder' | 'lower_back')[];
  defaultSets: number;
  defaultReps: string;
  defaultRestSec: number;
  rpe: number;
  instructions: string;
}

export const EXERCISE_DATABASE: ExerciseDefinition[] = [
  // Squat Pattern
  {
    id: 'ex_sq_1',
    name: 'Sentadilla Goblet con Mancuerna',
    movementPattern: 'squat',
    equipmentRequired: 'dumbbells',
    jointStressTags: ['knee'],
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRestSec: 90,
    rpe: 8,
    instructions: 'Sujeta la mancuerna verticalmente pegada al pecho. Mantén el torso erguido y baja de manera controlada.',
  },
  {
    id: 'ex_sq_2',
    name: 'Prensa Inclinada de Piernas (45°)',
    movementPattern: 'squat',
    equipmentRequired: 'machine',
    jointStressTags: ['knee'],
    defaultSets: 4,
    defaultReps: '12-15',
    defaultRestSec: 90,
    rpe: 8,
    instructions: 'Coloca los pies al ancho de hombros en el centro de la plataforma. Evita bloquear las rodillas en la extensión máxima.',
  },
  {
    id: 'ex_sq_3',
    name: 'Sentadilla Búlgara con Mancuernas',
    movementPattern: 'squat',
    equipmentRequired: 'dumbbells',
    jointStressTags: ['knee'],
    defaultSets: 3,
    defaultReps: '10 por pierna',
    defaultRestSec: 75,
    rpe: 8.5,
    instructions: 'Eleva el pie trasero sobre un banco. Desciende verticalmente manteniendo el peso en el talón delantero.',
  },
  {
    id: 'ex_sq_safe',
    name: 'Extensión Isométrica de Cuádriceps (Safe Rodilla)',
    movementPattern: 'squat',
    equipmentRequired: 'machine',
    jointStressTags: [],
    defaultSets: 4,
    defaultReps: '45 seg isometría',
    defaultRestSec: 60,
    rpe: 7,
    instructions: 'Mantén la contracción estática a 45° sin impacto articular, protegiendo el tendón rotuliano.',
  },

  // Hinge Pattern (Bisagra de Cadera)
  {
    id: 'ex_hg_1',
    name: 'Peso Muerto Rumano con Mancuernas',
    movementPattern: 'hinge',
    equipmentRequired: 'dumbbells',
    jointStressTags: ['lower_back'],
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRestSec: 90,
    rpe: 8,
    instructions: 'Lleva la cadera hacia atrás con rodillas semiflexionadas y espalda neutra. Siente la tensión en isquiotibiales.',
  },
  {
    id: 'ex_hg_2',
    name: 'Hip Thrust con Barra / Máquina',
    movementPattern: 'hinge',
    equipmentRequired: 'gym',
    jointStressTags: [],
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRestSec: 90,
    rpe: 8.5,
    instructions: 'Apoya la zona escapular en el banco. Empuja desde los talones contrayendo glúteos en la cúspide.',
  },
  {
    id: 'ex_hg_safe',
    name: 'Puente de Glúteos en Suelo (Safe Lumbar)',
    movementPattern: 'hinge',
    equipmentRequired: 'bodyweight',
    jointStressTags: [],
    defaultSets: 4,
    defaultReps: '15-20',
    defaultRestSec: 60,
    rpe: 7,
    instructions: 'Ideal para activación posterior sin compresión axial de columna.',
  },

  // Push Horizontal
  {
    id: 'ex_ph_1',
    name: 'Press de Banca Plano con Mancuernas',
    movementPattern: 'push_h',
    equipmentRequired: 'dumbbells',
    jointStressTags: ['shoulder'],
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRestSec: 90,
    rpe: 8,
    instructions: 'Mantén las escápulas retraídas y baja las mancuernas en un ángulo de 45° respecto al torso.',
  },
  {
    id: 'ex_ph_safe',
    name: 'Press en Máquina con Agarre Neutro (Safe Hombro)',
    movementPattern: 'push_h',
    equipmentRequired: 'machine',
    jointStressTags: [],
    defaultSets: 4,
    defaultReps: '12-15',
    defaultRestSec: 75,
    rpe: 7.5,
    instructions: 'El agarre neutro reduce el pinzamiento subacromial protegiendo el manguito rotador.',
  },
  {
    id: 'ex_ph_3',
    name: 'Flexiones de Pecho (Push-ups)',
    movementPattern: 'push_h',
    equipmentRequired: 'bodyweight',
    jointStressTags: [],
    defaultSets: 3,
    defaultReps: 'Al fallo técnico',
    defaultRestSec: 60,
    rpe: 8,
    instructions: 'Cuerpo en línea recta desde los talones hasta la cabeza, activación de core firme.',
  },

  // Push Vertical
  {
    id: 'ex_pv_1',
    name: 'Press de Hombro Sentado con Mancuernas',
    movementPattern: 'push_v',
    equipmentRequired: 'dumbbells',
    jointStressTags: ['shoulder'],
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSec: 75,
    rpe: 8,
    instructions: 'Empuja verticalmente sin bloquear los codos bruscamente. Desciende hasta la altura de las orejas.',
  },
  {
    id: 'ex_pv_safe',
    name: 'Elevaciones Laterales en Polea o Mancuerna Ligera',
    movementPattern: 'push_v',
    equipmentRequired: 'dumbbells',
    jointStressTags: [],
    defaultSets: 4,
    defaultReps: '15-18',
    defaultRestSec: 60,
    rpe: 8,
    instructions: 'En el plano escapular (30° adelante del cuerpo) para proteger la bursa subacromial.',
  },

  // Pull Horizontal
  {
    id: 'ex_plh_1',
    name: 'Remo con Mancuerna a una Mano',
    movementPattern: 'pull_h',
    equipmentRequired: 'dumbbells',
    jointStressTags: ['lower_back'],
    defaultSets: 4,
    defaultReps: '10 por brazo',
    defaultRestSec: 75,
    rpe: 8,
    instructions: 'Apoya una rodilla y mano en banco. Tira de la mancuerna hacia la cadera concentrando en el dorsal.',
  },
  {
    id: 'ex_plh_safe',
    name: 'Remo en Pecho Apoyado (Chest-Supported Row)',
    movementPattern: 'pull_h',
    equipmentRequired: 'machine',
    jointStressTags: [],
    defaultSets: 4,
    defaultReps: '12',
    defaultRestSec: 75,
    rpe: 8,
    instructions: 'El soporte frontal elimina al 100% la carga en la zona lumbar.',
  },

  // Pull Vertical
  {
    id: 'ex_plv_1',
    name: 'Jalón al Pecho en Polea Alta (Lat Pulldown)',
    movementPattern: 'pull_v',
    equipmentRequired: 'machine',
    jointStressTags: ['shoulder'],
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRestSec: 90,
    rpe: 8,
    instructions: 'Tracciona hacia la parte superior del esternón con el pecho alto. Controla la fase excéntrica.',
  },
  {
    id: 'ex_plv_safe',
    name: 'Jalón al Pecho con Agarre Neutro Estrecho',
    movementPattern: 'pull_v',
    equipmentRequired: 'machine',
    jointStressTags: [],
    defaultSets: 4,
    defaultReps: '12-14',
    defaultRestSec: 75,
    rpe: 7.5,
    instructions: 'Minimiza la rotación interna del hombro, seguro para atletas con dolor anterior.',
  },
  {
    id: 'ex_plv_db',
    name: 'Pullover con Mancuerna en Banco Horizontal',
    movementPattern: 'pull_v',
    equipmentRequired: 'dumbbells',
    jointStressTags: [],
    defaultSets: 4,
    defaultReps: '12-15',
    defaultRestSec: 75,
    rpe: 7.5,
    instructions: 'Tracción dorsal en plano sagital con mancuerna, sin estrés acromioclavicular.',
  },

  // Core & Arms
  {
    id: 'ex_cor_1',
    name: 'Plancha Abdominal Estática (Plank)',
    movementPattern: 'core',
    equipmentRequired: 'bodyweight',
    jointStressTags: [],
    defaultSets: 3,
    defaultReps: '45-60 seg',
    defaultRestSec: 60,
    rpe: 7.5,
    instructions: 'Retroversión pélvica activa, ombligo hacia la columna, glúteos apretados.',
  },
  {
    id: 'ex_cor_2',
    name: 'Pallof Press con Banda / Polea',
    movementPattern: 'core',
    equipmentRequired: 'dumbbells',
    jointStressTags: [],
    defaultSets: 3,
    defaultReps: '12 por lado',
    defaultRestSec: 45,
    rpe: 7,
    instructions: 'Anti-rotación del core. Excelente para estabilización lumbar.',
  },
];

/**
 * Determine workout split based on weekly training frequency.
 */
export function determineSplitByDays(daysPerWeek: number): WorkoutSplit {
  if (daysPerWeek >= 5) {
    return 'push_pull_legs';
  }
  if (daysPerWeek === 4) {
    return 'upper_lower';
  }
  return 'full_body';
}

/**
 * Filter exercises based on available equipment and clinical joint injuries.
 */
export function filterSafeExercises(
  catalog: ExerciseDefinition[],
  equipment: EquipmentType[],
  clinicalFlags: ClinicalFlag[]
): ExerciseDefinition[] {
  const hasKneeInjury = clinicalFlags.includes('knee_injury');
  const hasShoulderInjury = clinicalFlags.includes('shoulder_injury');
  const hasBackInjury = clinicalFlags.includes('lower_back_injury');

  const allowedEquipment = new Set(equipment);
  allowedEquipment.add('bodyweight'); // always available

  return catalog.filter((exercise) => {
    // Check equipment
    const equipOk =
      allowedEquipment.has(exercise.equipmentRequired) ||
      allowedEquipment.has('gym'); // if gym, has all equipment

    if (!equipOk) return false;

    // Check joint stress
    if (hasKneeInjury && exercise.jointStressTags.includes('knee')) {
      return false;
    }
    if (hasShoulderInjury && exercise.jointStressTags.includes('shoulder')) {
      return false;
    }
    if (hasBackInjury && exercise.jointStressTags.includes('lower_back')) {
      return false;
    }

    return true;
  });
}

/**
 * Generate complete workout routine according to the decision tree.
 */
export function buildWorkoutRoutine(params: {
  trainingDays: number;
  equipment: EquipmentType[];
  clinicalFlags: ClinicalFlag[];
}): { split: WorkoutSplit; routine: WorkoutDayPlan[] } {
  const { trainingDays, equipment, clinicalFlags } = params;
  const split = determineSplitByDays(trainingDays);
  const safeExercises = filterSafeExercises(EXERCISE_DATABASE, equipment, clinicalFlags);

  const getExercise = (pattern: ExerciseDefinition['movementPattern']): ExercisePrescription => {
    const found =
      safeExercises.find((e) => e.movementPattern === pattern) ||
      safeExercises.find((e) => e.jointStressTags.length === 0) ||
      safeExercises[0] ||
      EXERCISE_DATABASE[0];

    return {
      id: found.id,
      name: found.name,
      movementPattern: found.movementPattern,
      equipment: found.equipmentRequired,
      jointStressTags: found.jointStressTags,
      sets: found.defaultSets,
      reps: found.defaultReps,
      restSec: found.defaultRestSec,
      rpe: found.rpe,
      notes: found.instructions,
    };
  };

  const days: WorkoutDayPlan[] = [];

  if (split === 'full_body') {
    // Full body A and Full body B
    days.push({
      dayName: 'Día 1 - Full Body (Énfasis Empuje/Cuádriceps)',
      focus: 'Patrones fundamentales cuerpo completo',
      exercises: [
        getExercise('squat'),
        getExercise('push_h'),
        getExercise('pull_h'),
        getExercise('core'),
      ],
    });
    days.push({
      dayName: 'Día 2 - Full Body (Énfasis Cadena Posterior/Tracción)',
      focus: 'Bisagra de cadera y tracciones verticales',
      exercises: [
        getExercise('hinge'),
        getExercise('pull_v'),
        getExercise('push_v'),
        getExercise('core'),
      ],
    });
    if (trainingDays >= 3) {
      days.push({
        dayName: 'Día 3 - Full Body (Recomposición & Potencia)',
        focus: 'Densidad metabólica y simetría',
        exercises: [
          getExercise('squat'),
          getExercise('push_h'),
          getExercise('pull_h'),
          getExercise('hinge'),
        ],
      });
    }
  } else if (split === 'upper_lower') {
    days.push({
      dayName: 'Día 1 - Torso A (Fuerza Horizontal)',
      focus: 'Pectoral, dorsal y estabilizadores de hombro',
      exercises: [
        getExercise('push_h'),
        getExercise('pull_h'),
        getExercise('push_v'),
        getExercise('core'),
      ],
    });
    days.push({
      dayName: 'Día 2 - Pierna A (Cuádriceps Dominante)',
      focus: 'Sentadilla, prensa y gemelos',
      exercises: [
        getExercise('squat'),
        getExercise('hinge'),
        getExercise('core'),
      ],
    });
    days.push({
      dayName: 'Día 3 - Torso B (Fuerza Vertical & Hipertrofia)',
      focus: 'Jalones polea alta y deltoides',
      exercises: [
        getExercise('pull_v'),
        getExercise('push_v'),
        getExercise('pull_h'),
        getExercise('core'),
      ],
    });
    days.push({
      dayName: 'Día 4 - Pierna B (Cadena Posterior & Glúteo)',
      focus: 'Bisagra de cadera, femoral y zancadas',
      exercises: [
        getExercise('hinge'),
        getExercise('squat'),
        getExercise('core'),
      ],
    });
  } else {
    // Push / Pull / Legs
    days.push({
      dayName: 'Día 1 - Push (Empuje Pectoral, Deltoides, Tríceps)',
      focus: 'Press plano, press hombro y tríceps',
      exercises: [
        getExercise('push_h'),
        getExercise('push_v'),
        getExercise('core'),
      ],
    });
    days.push({
      dayName: 'Día 2 - Pull (Tracción Dorsal, Trapecio, Bíceps)',
      focus: 'Jalones verticales y remos horizontales',
      exercises: [
        getExercise('pull_v'),
        getExercise('pull_h'),
        getExercise('core'),
      ],
    });
    days.push({
      dayName: 'Día 3 - Legs (Pierna Completa & Core)',
      focus: 'Sentadilla, femoral y glúteos',
      exercises: [
        getExercise('squat'),
        getExercise('hinge'),
        getExercise('core'),
      ],
    });
  }

  return { split, routine: days };
}
