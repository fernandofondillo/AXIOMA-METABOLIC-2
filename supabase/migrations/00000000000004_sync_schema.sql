-- ==========================================
-- 04_SYNC_SCHEMA.sql
-- SINCRONIZACIÓN TOTAL (ANTIGRAVITY <-> SUPABASE)
-- ==========================================

-- 1. ASEGURAR COLUMNAS EN PROFILES (Para Configuración)
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS specialty TEXT,
  ADD COLUMN IF NOT EXISTS medical_center TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT;

-- 2. ASEGURAR COLUMNAS EN PATIENTS (Para Nuevo Paciente)
ALTER TABLE public.patients_identity
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS professional_id UUID REFERENCES auth.users(id);

-- 3. ASEGURAR PERMISOS DE ESCRITURA (RLS)
-- Borramos la política vieja si existe y creamos la nueva de actualización
DROP POLICY IF EXISTS "Professionals can update own profile" ON public.profiles;
CREATE POLICY "Professionals can update own profile" 
  ON public.profiles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- 4. ASEGURAR EL TRIGGER DE AUTOCREACIÓN
-- Este robot crea tu fila en 'profiles' en cuanto te registras
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, organization_id)
  VALUES (new.id, new.email, 'professional', (SELECT id FROM public.organizations LIMIT 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. LIMPIEZA DE PERMISOS: Asegurar que tu usuario actual tenga una organización
INSERT INTO public.organizations (name) VALUES ('Mi Clínica Axioma') ON CONFLICT DO NOTHING;
UPDATE public.profiles SET organization_id = (SELECT id FROM public.organizations LIMIT 1) WHERE organization_id IS NULL;
