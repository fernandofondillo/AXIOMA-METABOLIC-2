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

-- Enable RLS on all tables
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table patients_identity enable row level security;
alter table metabolic_profiles enable row level security;
alter table metabolic_metrics enable row level security;

-- Organizations RLS
create policy "Organizations visible to its own members and admins"
  on organizations
  for select
  using (
    id = (select organization_id from profiles where profiles.id = auth.uid()) OR
    (select role from profiles where profiles.id = auth.uid()) = 'admin'
  );

-- Profiles RLS
create policy "Users can read profiles in their org or if they are admin"
  on profiles
  for select
  using (
    organization_id = (select organization_id from profiles where profiles.id = auth.uid()) OR
    id = auth.uid() OR
    (select role from profiles where profiles.id = auth.uid()) = 'admin'
  );

-- Patients Identity RLS (Only professionals in the same org can read)
create policy "Professionals can access patients in their org"
  on patients_identity
  for all
  using (
    organization_id = (select organization_id from profiles where profiles.id = auth.uid()) AND
    (select role from profiles where profiles.id = auth.uid()) = 'professional'
  );

-- Metabolic Profiles RLS (Inherit org through patient_identity)
create policy "Professionals can access metabolic profiles in their org"
  on metabolic_profiles
  for all
  using (
    (select organization_id from patients_identity where patients_identity.id = metabolic_profiles.patient_id) = 
    (select organization_id from profiles where profiles.id = auth.uid()) AND
    (select role from profiles where profiles.id = auth.uid()) = 'professional'
  );

-- Metabolic Metrics RLS (Inherit org through patient_identity)
create policy "Professionals can access metabolic metrics in their org"
  on metabolic_metrics
  for all
  using (
    (select organization_id from patients_identity where patients_identity.id = metabolic_metrics.patient_id) = 
    (select organization_id from profiles where profiles.id = auth.uid()) AND
    (select role from profiles where profiles.id = auth.uid()) = 'professional'
  );

-- Note: Policies above manage 'for all', meaning they apply to select, insert, update, delete.
-- The using clause applies to select, update, delete and the with check gets derived from using for inserts/updates natively.
