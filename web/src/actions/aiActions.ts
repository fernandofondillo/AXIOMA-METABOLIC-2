'use server'

import { createClient } from '@/lib/supabase/server'
import { generateText, embed } from 'ai'
import { openai } from '@ai-sdk/openai'

// Verificador de estado de la IA
export async function checkAIAvailability() {
    return !!process.env.OPENAI_API_KEY;
}

// 1. Guardar Vectores (Embeddings) de Hábitos
export async function saveHabitVector(patientId: string, interviewId: string, habitLog: string, isHighRisk: boolean = false) {
    if (!process.env.OPENAI_API_KEY) {
        return { success: false, error: 'Módulo de IA no configurado por el administrador' };
    }

    const supabase = await createClient();

    try {
        const { embedding } = await embed({
            model: openai.embedding('text-embedding-3-small'),
            value: habitLog,
        });

        const { error } = await supabase.from('habit_vectors').insert({
            patient_id: patientId,
            interview_id: interviewId,
            habit_log: habitLog,
            embedding: embedding,
            is_high_risk: isHighRisk
        });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error saving habit vector:', error);
        return { success: false, error: 'Failed to save habit vector' };
    }
}

// 2. Similitud de Coseno para Memoria de Patrones
export async function checkPatternRisk(patientId: string, habitLog: string) {
    if (!process.env.OPENAI_API_KEY) {
        return { hasRisk: false, error: 'Módulo de IA no configurado por el administrador' };
    }

    const supabase = await createClient();

    try {
        const { embedding } = await embed({
            model: openai.embedding('text-embedding-3-small'),
            value: habitLog,
        });

        // Llamar a la funcion SQL match_patient_patterns
        const { data, error } = await supabase.rpc('match_patient_patterns', {
            query_embedding: embedding,
            match_threshold: 0.80,
            match_count: 5,
            p_id: patientId
        });

        if (error) throw error;

        if (data && data.length > 0) {
            return { hasRisk: true, patterns: data };
        }

        return { hasRisk: false };

    } catch (error) {
        console.error('Error checking vector pattern risk:', error);
        return { hasRisk: false, error: 'Failed to verify patterns' };
    }
}

// 3. Generación del Análisis Clínico con IA
export async function analyzeCaseWithAI(patientId: string) {
    if (!process.env.OPENAI_API_KEY) {
        return { success: false, error: 'Módulo de IA no configurado por el administrador' };
    }

    const supabase = await createClient();

    // Fetching real context data
    const { data: metrics } = await supabase
        .from('metabolic_metrics')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    const { data: interviews } = await supabase
        .from('interviews')
        .select('data, professional_notes')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(3);

    // Reglas de Razonamiento
    const systemPrompt = `Tu rol es ayudar al profesional a conectar puntos invisibles. 
Si detectas riesgo de TCA (Trastorno de Conducta Alimentaria), tu primera frase DEBE ser una alerta roja de derivación. 
Sugiere micro-cambios basados en la relacion con la comida, no solo restriccion calorica.
Se preciso, conciso y util.`

    // Context Engineering usando etiquetas XML
    const promptContext = `
Analiza el siguiente caso clinico:

<perfil_metabolico>
${metrics ? JSON.stringify(metrics, null, 2) : 'No hay datos metabolicos registrados.'}
</perfil_metabolico>

<historial_reciente>
${interviews ? JSON.stringify(interviews, null, 2) : 'No hay entrevistas recientes.'}
</historial_reciente>

<alertas_actuales>
- Se calculan alertas si el paciente excede IMC de 30 o HOMA-IR alto relativo a la insulina.
- Evalua el nivel de estres de su perfil y propon cambios practicos.
</alertas_actuales>

Por favor, proporciona tu analisis clinico para el profesional considerando este historial.
`;

    try {
        const { text } = await generateText({
            model: openai('gpt-4-turbo'),
            system: systemPrompt,
            prompt: promptContext,
        });

        return { success: true, analysis: text };
    } catch (error) {
        console.error('Error with AI analysis', error);
        return { success: false, error: 'Hubo un error al generar el analisis con IA. Verifica tu API Key.' };
    }
}
