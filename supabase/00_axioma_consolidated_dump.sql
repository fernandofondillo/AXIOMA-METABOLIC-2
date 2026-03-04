-- =====================================================================================
-- AXIOMA METABOLIC: CONSOLIDATED SCHEMA FOR SUPABASE CLOUD (DEPLOYMENT READY)
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- PART 1: INIT SCHEMA (00000000000000_init_schema.sql)
-- -------------------------------------------------------------------------------------

-- 1. Enable pgvector extension
create extension if not exists vector;

-- 2. Create organizations table (multi-centro)
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create profiles table (links auth.users with app logic)
-- Role enum: admin, professional, patient
create type user_role as enum ('admin', 'professional', 'patient');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role user_role not null default 'patient',
  organization_id uuid references organizations(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. PII-Vault Architecture
-- Tabla: patients_identity
create table patients_identity (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  contact text,
  organization_id uuid not null references organizations(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla: metabolic_profiles
create table metabolic_profiles (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients_identity(id) on delete cascade,
  birth_year integer,
  gender text,
  metabolic_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla: metabolic_metrics
create table metabolic_metrics (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients_identity(id) on delete cascade,
  glucosa numeric,
  insulina numeric,
  cortisol numeric,
  hba1c numeric,
  pcr numeric,
  homa_ir numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Row Level Security (RLS)
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table patients_identity enable row level security;
alter table metabolic_profiles enable row level security;
alter table metabolic_metrics enable row level security;

create policy "Organizations visible to its own members and admins"
  on organizations for select using (
    id = (select organization_id from profiles where profiles.id = auth.uid()) OR
    (select role from profiles where profiles.id = auth.uid()) = 'admin'
  );

create policy "Users can read profiles in their org or if they are admin"
  on profiles for select using (
    organization_id = (select organization_id from profiles where profiles.id = auth.uid()) OR
    id = auth.uid() OR
    (select role from profiles where profiles.id = auth.uid()) = 'admin'
  );

create policy "Professionals can access patients in their org"
  on patients_identity for all using (
    organization_id = (select organization_id from profiles where profiles.id = auth.uid()) AND
    (select role from profiles where profiles.id = auth.uid()) = 'professional'
  );

create policy "Professionals can access metabolic profiles in their org"
  on metabolic_profiles for all using (
    (select organization_id from patients_identity where patients_identity.id = metabolic_profiles.patient_id) = 
    (select organization_id from profiles where profiles.id = auth.uid()) AND
    (select role from profiles where profiles.id = auth.uid()) = 'professional'
  );

create policy "Professionals can access metabolic metrics in their org"
  on metabolic_metrics for all using (
    (select organization_id from patients_identity where patients_identity.id = metabolic_metrics.patient_id) = 
    (select organization_id from profiles where profiles.id = auth.uid()) AND
    (select role from profiles where profiles.id = auth.uid()) = 'professional'
  );


-- -------------------------------------------------------------------------------------
-- PART 2: INTERVIEW ENGINE (00000000000001_interview_engine.sql)
-- -------------------------------------------------------------------------------------

ALTER TABLE metabolic_metrics
ADD COLUMN peso numeric,
ADD COLUMN altura numeric,
ADD COLUMN perimetro_cintura numeric,
ADD COLUMN imc numeric,
ADD COLUMN porcentaje_grasa numeric,
ADD COLUMN edad integer,
ADD COLUMN sexo text;

CREATE TABLE medical_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES patients_identity(id) ON DELETE CASCADE,
    patologias_asociadas jsonb DEFAULT '[]'::jsonb,
    tratamientos_actuales jsonb DEFAULT '[]'::jsonb,
    antecedentes_familiares jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TYPE interview_type AS ENUM ('inicial', 'seguimiento');

CREATE TABLE interviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES patients_identity(id) ON DELETE CASCADE,
    type interview_type NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    professional_notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Algoritmos de Calculo Automatico
CREATE OR REPLACE FUNCTION trigger_calculate_metabolic_indices()
RETURNS trigger AS $$
BEGIN
    IF NEW.peso IS NOT NULL AND NEW.altura IS NOT NULL AND NEW.altura > 0 THEN
        NEW.imc := round((NEW.peso / (NEW.altura * NEW.altura))::numeric, 2);
    END IF;

    IF NEW.glucosa IS NOT NULL AND NEW.insulina IS NOT NULL THEN
        NEW.homa_ir := round(((NEW.glucosa * NEW.insulina) / 405)::numeric, 2);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_metabolic_indices_trigger
BEFORE INSERT OR UPDATE ON metabolic_metrics
FOR EACH ROW
EXECUTE FUNCTION trigger_calculate_metabolic_indices();

-- RLS
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can access medical history in their org"
  ON medical_history FOR ALL USING (
    (SELECT organization_id FROM patients_identity WHERE patients_identity.id = medical_history.patient_id) = 
    (SELECT organization_id FROM profiles WHERE profiles.id = auth.uid()) AND
    (SELECT role FROM profiles WHERE profiles.id = auth.uid()) = 'professional'
  );

CREATE POLICY "Professionals can access interviews in their org"
  ON interviews FOR ALL USING (
    (SELECT organization_id FROM patients_identity WHERE patients_identity.id = interviews.patient_id) = 
    (SELECT organization_id FROM profiles WHERE profiles.id = auth.uid()) AND
    (SELECT role FROM profiles WHERE profiles.id = auth.uid()) = 'professional'
  );

-- -------------------------------------------------------------------------------------
-- PART 3: PATTERN MEMORY (00000000000002_pattern_memory.sql)
-- -------------------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

CREATE TABLE habit_vectors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES patients_identity(id) ON DELETE CASCADE,
    interview_id uuid REFERENCES interviews(id) ON DELETE SET NULL,
    embedding vector(1536),
    habit_log text NOT NULL,
    is_high_risk boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE habit_vectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can access habit vectors in their org"
  ON habit_vectors FOR ALL USING (
    (SELECT organization_id FROM patients_identity WHERE patients_identity.id = habit_vectors.patient_id) = 
    (SELECT organization_id FROM profiles WHERE profiles.id = auth.uid()) AND
    (SELECT role FROM profiles WHERE profiles.id = auth.uid()) = 'professional'
  );

CREATE OR REPLACE FUNCTION match_patient_patterns(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_id uuid
)
RETURNS TABLE (
  id uuid,
  habit_log text,
  similarity float,
  is_high_risk boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    hv.id,
    hv.habit_log,
    1 - (hv.embedding <=> query_embedding) AS similarity,
    hv.is_high_risk
  FROM habit_vectors hv
  WHERE hv.patient_id = p_id
    AND hv.is_high_risk = true
    AND 1 - (hv.embedding <=> query_embedding) > match_threshold
  ORDER BY hv.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;


-- -------------------------------------------------------------------------------------
-- PART 4: PATIENT TRACKING (00000000000003_patient_tracking.sql)
-- -------------------------------------------------------------------------------------

CREATE TABLE daily_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES patients_identity(id) ON DELETE CASCADE,
    hunger_pre integer CHECK (hunger_pre BETWEEN 1 AND 10),
    satiety_post integer CHECK (satiety_post BETWEEN 1 AND 10),
    associated_emotion text,
    stress_level integer CHECK (stress_level BETWEEN 1 AND 10),
    craving_intensity integer CHECK (craving_intensity BETWEEN 1 AND 10),
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE micro_goals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES patients_identity(id) ON DELETE CASCADE,
    description text NOT NULL,
    status text DEFAULT 'active',
    prescription_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by_professional_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE micro_goal_completions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id uuid NOT NULL REFERENCES micro_goals(id) ON DELETE CASCADE,
    completed_date date NOT NULL DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(goal_id, completed_date)
);

ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_goal_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can access daily logs in org"
  ON daily_logs FOR ALL USING (
    (SELECT organization_id FROM patients_identity WHERE patients_identity.id = daily_logs.patient_id) = 
    (SELECT organization_id FROM profiles WHERE profiles.id = auth.uid()) AND
    (SELECT role FROM profiles WHERE profiles.id = auth.uid()) = 'professional'
  );

CREATE POLICY "Professionals can access micro goals in org"
  ON micro_goals FOR ALL USING (
    (SELECT organization_id FROM patients_identity WHERE patients_identity.id = micro_goals.patient_id) = 
    (SELECT organization_id FROM profiles WHERE profiles.id = auth.uid()) AND
    (SELECT role FROM profiles WHERE profiles.id = auth.uid()) = 'professional'
  );

CREATE POLICY "Professionals can access micro goals completions in org"
  ON micro_goal_completions FOR ALL USING (
    (SELECT organization_id FROM patients_identity p
     JOIN micro_goals g ON g.patient_id = p.id
     WHERE g.id = micro_goal_completions.goal_id) = 
    (SELECT organization_id FROM profiles WHERE profiles.id = auth.uid()) AND
    (SELECT role FROM profiles WHERE profiles.id = auth.uid()) = 'professional'
  );
