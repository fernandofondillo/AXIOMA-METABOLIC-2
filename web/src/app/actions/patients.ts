'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createPatientAction(patientData: {
    nombre: string;
    apellidos: string;
    email: string;
    telefono: string;
    fechaNacimiento: string;
}) {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('patients_identity')
            .insert([
                {
                    nombre: patientData.nombre,
                    apellidos: patientData.apellidos,
                    email: patientData.email,
                    telefono: patientData.telefono,
                    fecha_nacimiento: patientData.fechaNacimiento || null,
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating patient:', error);
            throw new Error(error.message || 'Error al guardar el paciente');
        }

        revalidatePath('/pacientes');
        return { success: true, patient: data };
    } catch (err: any) {
        return { success: false, error: err.message || 'Error desconocido' };
    }
}

export async function getPatientsAction() {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('patients_identity')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching patients:', error);
            // Return empty list on error for now, maybe throw later
            return { success: false, patients: [] };
        }

        return { success: true, patients: data || [] };
    } catch (err: any) {
        return { success: false, patients: [] };
    }
}
