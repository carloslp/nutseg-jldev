-- ============================================================================
-- NutSeg (BioMetrix Pro) - Schema Inicial PostgreSQL para Supabase
-- Diseñado siguiendo las mejores prácticas de supabase-postgres-best-practices
-- ============================================================================

-- Habilitar extensión pgcrypto para UUIDs si no está habilitada
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. TABLA: clients (Expediente base e inmutable del paciente)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
    height_cm NUMERIC(5, 2) NOT NULL CHECK (height_cm > 50 AND height_cm < 260),
    phone_whatsapp TEXT,
    email TEXT,
    clinical_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
    allergies JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 2. TABLA: biometric_logs (Histórico de métricas antropométricas y check-ins)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.biometric_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
    weight_kg NUMERIC(5, 2) NOT NULL CHECK (weight_kg > 20 AND weight_kg < 350),
    body_fat_pct NUMERIC(4, 2) CHECK (body_fat_pct IS NULL OR (body_fat_pct >= 2 AND body_fat_pct <= 70)),
    muscle_mass_kg NUMERIC(5, 2),
    waist_cm NUMERIC(5, 2),
    hip_cm NUMERIC(5, 2),
    abdomen_cm NUMERIC(5, 2),
    arm_relaxed_cm NUMERIC(5, 2),
    arm_contracted_cm NUMERIC(5, 2),
    thigh_cm NUMERIC(5, 2),
    activity_factor NUMERIC(3, 2) NOT NULL DEFAULT 1.2 CHECK (activity_factor >= 1.2 AND activity_factor <= 2.2),
    training_days INTEGER NOT NULL DEFAULT 3 CHECK (training_days >= 0 AND training_days <= 7),
    equipment_available TEXT[] NOT NULL DEFAULT ARRAY['gym']::text[],
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 3. TABLA: plans (Prescripción generada por el motor algorítmico y guardada)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    biometric_log_id UUID REFERENCES public.biometric_logs(id) ON DELETE SET NULL,
    formula_used TEXT NOT NULL CHECK (formula_used IN ('mifflin_st_jeor', 'katch_mcardle')),
    lbm_kg NUMERIC(5, 2),
    tmb_kcal NUMERIC(6, 1) NOT NULL,
    getd_kcal NUMERIC(6, 1) NOT NULL,
    goal TEXT NOT NULL CHECK (goal IN ('deficit_aggressive', 'deficit_moderate', 'maintenance', 'surplus_lean', 'surplus_aggressive', 'custom')),
    goal_adjustment_pct NUMERIC(5, 2) NOT NULL DEFAULT 0,
    target_kcal NUMERIC(6, 1) NOT NULL,
    caloric_floor_min NUMERIC(6, 1) NOT NULL,
    caloric_floor_override BOOLEAN NOT NULL DEFAULT false,
    bmi NUMERIC(4, 2) NOT NULL,
    is_obese BOOLEAN NOT NULL DEFAULT false,
    adjusted_weight_kg NUMERIC(5, 2),
    protein_g NUMERIC(5, 1) NOT NULL,
    protein_ratio_g_kg NUMERIC(3, 2) NOT NULL,
    fat_g NUMERIC(5, 1) NOT NULL,
    fat_ratio_g_kg NUMERIC(3, 2) NOT NULL,
    carbs_g NUMERIC(5, 1) NOT NULL,
    meal_count INTEGER NOT NULL DEFAULT 4,
    meal_structure JSONB NOT NULL DEFAULT '{}'::jsonb,
    workout_split TEXT NOT NULL DEFAULT 'full_body',
    workout_structure JSONB NOT NULL DEFAULT '{}'::jsonb,
    clinical_alert_notes TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 4. TABLA: permalinks (Control de acceso seguro del enlace único del paciente)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.permalinks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    current_plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
    slug_token TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    password_hint_admin TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    access_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 5. TABLA: food_catalog (Catálogo de alimentos equivalentes tipo SMAE)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.food_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    smae_group TEXT NOT NULL,
    portion_qty NUMERIC(5, 2) NOT NULL DEFAULT 1,
    portion_unit TEXT NOT NULL DEFAULT 'pieza',
    grams_net NUMERIC(6, 1) NOT NULL DEFAULT 100,
    kcal NUMERIC(6, 1) NOT NULL,
    protein_g NUMERIC(5, 1) NOT NULL DEFAULT 0,
    fat_g NUMERIC(5, 1) NOT NULL DEFAULT 0,
    carbs_g NUMERIC(5, 1) NOT NULL DEFAULT 0,
    allergen_tags TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 6. TABLA: exercise_catalog (Catálogo biomecánico de ejercicios)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exercise_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    movement_pattern TEXT NOT NULL, -- squat, hinge, push_h, push_v, pull_h, pull_v, core, isolation
    equipment_required TEXT NOT NULL, -- gym, dumbbells, bodyweight, machine
    joint_stress_tags TEXT[] NOT NULL DEFAULT ARRAY[]::text[], -- knee, shoulder, lower_back
    instructions TEXT,
    video_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- ÍNDICES (supabase-postgres-best-practices: Index Foreign Keys & Slugs)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_biometric_logs_client_id ON public.biometric_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_biometric_logs_recorded_at ON public.biometric_logs(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_plans_client_id ON public.plans(client_id);
CREATE INDEX IF NOT EXISTS idx_plans_biometric_log_id ON public.plans(biometric_log_id);
CREATE INDEX IF NOT EXISTS idx_permalinks_client_id ON public.permalinks(client_id);
CREATE INDEX IF NOT EXISTS idx_permalinks_slug_token ON public.permalinks(slug_token);
CREATE INDEX IF NOT EXISTS idx_food_catalog_smae_group ON public.food_catalog(smae_group);
CREATE INDEX IF NOT EXISTS idx_exercise_catalog_pattern ON public.exercise_catalog(movement_pattern);

-- ----------------------------------------------------------------------------
-- SEGURIDAD: ROW LEVEL SECURITY (RLS) EN TODAS LAS TABLAS
-- ----------------------------------------------------------------------------
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometric_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permalinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_catalog ENABLE ROW LEVEL SECURITY;

-- Políticas para Admin / Usuarios Autenticados
CREATE POLICY "Admin full access to clients"
    ON public.clients TO authenticated
    USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to biometric_logs"
    ON public.biometric_logs TO authenticated
    USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to plans"
    ON public.plans TO authenticated
    USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to permalinks"
    ON public.permalinks TO authenticated
    USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to food_catalog"
    ON public.food_catalog TO authenticated
    USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to exercise_catalog"
    ON public.exercise_catalog TO authenticated
    USING (true) WITH CHECK (true);

-- Catálogos de lectura pública (alimentos y ejercicios)
CREATE POLICY "Public read food_catalog"
    ON public.food_catalog FOR SELECT TO anon
    USING (is_active = true);

CREATE POLICY "Public read exercise_catalog"
    ON public.exercise_catalog FOR SELECT TO anon
    USING (is_active = true);

-- Trigger de updated_at para clients y permalinks
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER tr_permalinks_updated_at
    BEFORE UPDATE ON public.permalinks
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
