-- Habilitar la extension pgvector si no existe
CREATE EXTENSION IF NOT EXISTS vector
WITH SCHEMA extensions;

-- Crear tabla para almacenar vectores de habitos por paciente o entrevista
CREATE TABLE habit_vectors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES patients_identity(id) ON DELETE CASCADE,
    interview_id uuid REFERENCES interviews(id) ON DELETE SET NULL,
    embedding vector(1536), -- Asumiendo dimension tipica de OpenAI text-embedding-ada-002 o text-embedding-3-small
    habit_log text NOT NULL, -- El texto crudo que genero este vector
    is_high_risk boolean DEFAULT false, -- Flag manual/historico si este habito resulto en recaida
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security para habit_vectors
ALTER TABLE habit_vectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can access habit vectors in their org"
  ON habit_vectors
  FOR ALL
  USING (
    (SELECT organization_id FROM patients_identity WHERE patients_identity.id = habit_vectors.patient_id) = 
    (SELECT organization_id FROM profiles WHERE profiles.id = auth.uid()) AND
    (SELECT role FROM profiles WHERE profiles.id = auth.uid()) = 'professional'
  );

-- Funcion para buscar patrones de alto riesgo (> 80% similitud)
-- Comparamos usando la distancia de coseno (1 - cosine_distance)
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
    AND hv.is_high_risk = true -- Solo queremos alertar si se parece a patrones de DIFICULTAD
    AND 1 - (hv.embedding <=> query_embedding) > match_threshold
  ORDER BY hv.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
