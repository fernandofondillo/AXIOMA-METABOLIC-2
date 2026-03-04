-- Tabla para registro de diarios emocionales/hambre del paciente
CREATE TABLE daily_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES patients_identity(id) ON DELETE CASCADE,
    hunger_pre integer CHECK (hunger_pre BETWEEN 1 AND 10),
    satiety_post integer CHECK (satiety_post BETWEEN 1 AND 10),
    associated_emotion text, -- 'Ansiedad', 'Aburrimiento', 'Hambre real', 'Ganas de premiarme'
    stress_level integer CHECK (stress_level BETWEEN 1 AND 10),
    craving_intensity integer CHECK (craving_intensity BETWEEN 1 AND 10),
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla para prescribir micro-objetivos por parte del profesional
CREATE TABLE micro_goals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES patients_identity(id) ON DELETE CASCADE,
    description text NOT NULL,
    status text DEFAULT 'active', -- 'active', 'archived'
    prescription_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by_professional_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Tabla para el tracking diario (check-ins) de los micro-objetivos
CREATE TABLE micro_goal_completions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id uuid NOT NULL REFERENCES micro_goals(id) ON DELETE CASCADE,
    completed_date date NOT NULL DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(goal_id, completed_date) -- Evitar multiples completados el mismo dia
);

-- Row Level Security
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_goal_completions ENABLE ROW LEVEL SECURITY;

-- Nota: Como esto es un MVP, estamos dando acceso total en la organizacion al profesional,
-- y en el futuro limitaremos el "insert" al propio paciente.
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
