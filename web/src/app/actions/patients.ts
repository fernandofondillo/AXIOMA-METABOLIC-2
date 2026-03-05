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
        // 1. Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: 'No autenticado.' };
        }

        // 2. Fetch the user's organization_id from their profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single();

        if (profileError || !profile?.organization_id) {
            console.error('Organization ID not found for professional:', user.id);
            return {
                success: false,
                error: 'No se encontró una organización vinculada a tu perfil. Por favor, contacta a soporte o revisa tu configuración.'
            };
        }

        // 3. Build full_name for easier queries later
        const fullName = `${patientData.nombre} ${patientData.apellidos || ''}`.trim();

        // 4. Insert patient with mandatory organization context
        const { data, error } = await supabase
            .from('patients_identity')
            .insert([
                {
                    nombre: patientData.nombre,
                    apellidos: patientData.apellidos,
                    full_name: fullName,
                    email: patientData.email || null,
                    telefono: patientData.telefono || null,
                    fecha_nacimiento: patientData.fechaNacimiento || null,
                    date_of_birth: patientData.fechaNacimiento || null,
                    organization_id: profile.organization_id,
                    professional_id: user.id,
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
        const { data: { user } } = await supabase.auth.getUser();

        // Build query — filter by professional_id if column exists, otherwise get all
        const { data, error } = await supabase
            .from('patients_identity')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching patients:', error);
            return { success: false, patients: [] };
        }

        return { success: true, patients: data || [] };
    } catch (err: any) {
        return { success: false, patients: [] };
    }
}
