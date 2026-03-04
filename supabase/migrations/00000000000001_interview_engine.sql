-- 1. Ampliacion del Esquema SQL (Bio-Metricas)

-- Modificar metabolic_metrics para incluir nuevos campos
ALTER TABLE metabolic_metrics
ADD COLUMN peso numeric,
ADD COLUMN altura numeric,
ADD COLUMN perimetro_cintura numeric,
ADD COLUMN imc numeric,
ADD COLUMN porcentaje_grasa numeric,
ADD COLUMN edad integer,
ADD COLUMN sexo text;

-- Crear tabla medical_history
CREATE TABLE medical_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES patients_identity(id) ON DELETE CASCADE,
    patologias_asociadas jsonb DEFAULT '[]'::jsonb,
    tratamientos_actuales jsonb DEFAULT '[]'::jsonb,
    antecedentes_familiares jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla interviews
CREATE TYPE interview_type AS ENUM ('inicial', 'seguimiento');

CREATE TABLE interviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES patients_identity(id) ON DELETE CASCADE,
    type interview_type NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    professional_notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Algoritmos de Calculo Automatico (Triggers/Functions)

-- Funcion para calcular automatismos antes de insertar o actualizar en metabolic_metrics
CREATE OR REPLACE FUNCTION trigger_calculate_metabolic_indices()
RETURNS trigger AS $$
BEGIN
    -- Calcular IMC si peso y altura (en metros) estan presentes
    IF NEW.peso IS NOT NULL AND NEW.altura IS NOT NULL AND NEW.altura > 0 THEN
        NEW.imc := round((NEW.peso / (NEW.altura * NEW.altura))::numeric, 2);
    END IF;

    -- Calcular HOMA-IR si glucosa e insulina estan presentes
    IF NEW.glucosa IS NOT NULL AND NEW.insulina IS NOT NULL THEN
        NEW.homa_ir := round(((NEW.glucosa * NEW.insulina) / 405)::numeric, 2);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Asignar el Trigger a metabolic_metrics
CREATE TRIGGER calculate_metabolic_indices_trigger
BEFORE INSERT OR UPDATE ON metabolic_metrics
FOR EACH ROW
EXECUTE FUNCTION trigger_calculate_metabolic_indices();


-- 3. Row Level Security para Nuevas Tablas

ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Medical History RLS
CREATE POLICY "Professionals can access medical history in their org"
  ON medical_history
  FOR ALL
  USING (
    (SELECT organization_id FROM patients_identity WHERE patients_identity.id = medical_history.patient_id) = 
    (SELECT organization_id FROM profiles WHERE profiles.id = auth.uid()) AND
    (SELECT role FROM profiles WHERE profiles.id = auth.uid()) = 'professional'
  );

-- Interviews RLS
CREATE POLICY "Professionals can access interviews in their org"
  ON interviews
  FOR ALL
  USING (
    (SELECT organization_id FROM patients_identity WHERE patients_identity.id = interviews.patient_id) = 
    (SELECT organization_id FROM profiles WHERE profiles.id = auth.uid()) AND
    (SELECT role FROM profiles WHERE profiles.id = auth.uid()) = 'professional'
  );

