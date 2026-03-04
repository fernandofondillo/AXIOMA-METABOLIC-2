'use server';

import { createClient } from '@/lib/supabase/server';
import { interviewConfig, InterviewGuide } from '@/config/interviewGuides';

/**
 * Retorna la definición de la entrevista según sea inicial o seguimiento
 */
export async function getInterviewFormDef(type: 'inicial' | 'seguimiento'): Promise<InterviewGuide | null> {
    try {
        return interviewConfig[type];
    } catch (error) {
        console.error('Error fetching interview config:', error);
        return null;
    }
}

/**
 * Guarda las respuestas de la entrevista.
 * Retorna un objeto simulado de "evolution_delta" para comparar con entrevistas previas
 * si es una entrevista de seguimiento.
 */
export async function submitInterview(patientId: string, type: 'inicial' | 'seguimiento', data: Record<string, unknown>, professionalNotes: string = '') {
    const supabase = await createClient();

    // 1. Guardar la nueva entrevista
    const { data: newInterview, error } = await supabase
        .from('interviews')
        .insert({
            patient_id: patientId,
            type,
            data,
            professional_notes: professionalNotes
        })
        .select()
        .single();

    if (error) {
        console.error('Error submitting interview:', error);
        throw new Error('No se pudo guardar la entrevista.');
    }

    // 2. Si es seguimiento, comparamos con la entrevista inicial (lógica simulada básica de delta)
    let evolution_delta = '';

    if (type === 'seguimiento') {
        // Buscar la última entrevista inicial
        const { data: previousInterviews } = await supabase
            .from('interviews')
            .select('data')
            .eq('patient_id', patientId)
            .eq('type', 'inicial')
            .order('created_at', { ascending: false })
            .limit(1);

        if (previousInterviews && previousInterviews.length > 0) {
            // const pastData = previousInterviews[0].data;

            // Ejemplo simplificado de comparador
            evolution_delta = 'La evolución indica una mejor respuesta del paciente. (Lógica de comparación detallada pendiente)';

            // TODO: Implementar lógica profunda usando comparaciones reales de JSONB si fuera necesario en la UI
        }
    }

    return {
        success: true,
        interview: newInterview,
        evolution_delta,
    };
}
