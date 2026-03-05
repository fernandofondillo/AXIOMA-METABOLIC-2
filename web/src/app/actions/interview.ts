'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveInterviewData(patientId: string, interviewData: any, metricsData: any) {
    const supabase = await createClient();

    try {
        // 1. Insert into interviews table with JSON payload
        const { data: interviewResult, error: interviewError } = await supabase
            .from('interviews')
            .insert([
                {
                    patient_id: patientId,
                    interview_data: interviewData,
                    recorded_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (interviewError) {
            console.error('Error saving interview:', interviewError);
            throw new Error('No se pudo guardar la entrevista');
        }

        // 2. Insert into metabolic_metrics table if we have metrics
        if (metricsData && Object.keys(metricsData).length > 0) {
            const { error: metricsError } = await supabase
                .from('metabolic_metrics')
                .insert([
                    {
                        patient_id: patientId,
                        interview_id: interviewResult.id,
                        ...metricsData, // peso, altura, perimetro_cintura, perimetro_cadera, grasa_visceral, etc.
                        recorded_at: new Date().toISOString()
                    }
                ]);

            if (metricsError) {
                console.error('Error saving metrics:', metricsError);
                throw new Error('Entrevista guardada, pero hubo un error con las métricas');
            }
        }

        revalidatePath(`/pacientes/${patientId}`);
        return { success: true, interviewId: interviewResult.id };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
