'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface ProfileData {
    full_name: string;
    specialty: string;
    medical_center: string;
}

export async function updateProfileAction(data: ProfileData): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'No autenticado.' };
    }

    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            full_name: data.full_name,
            specialty: data.specialty,
            medical_center: data.medical_center,
            updated_at: new Date().toISOString(),
        });

    if (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/configuracion');
    return { success: true };
}
