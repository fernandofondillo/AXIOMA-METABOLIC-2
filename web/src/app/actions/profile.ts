'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface ProfileData {
    full_name: string;
    specialty: string;
    medical_center: string;
    bio: string;
    organization_id?: string;
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
            bio: data.bio,
            updated_at: new Date().toISOString(),
        });

    if (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/configuracion');
    revalidatePath('/'); // Revalidate header too
    return { success: true };
}

export async function getProfileAction(): Promise<ProfileData | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
        .from('profiles')
        .select('full_name, specialty, medical_center, bio, organization_id')
        .eq('id', user.id)
        .single();

    return data ? {
        full_name: data.full_name ?? '',
        specialty: data.specialty ?? '',
        medical_center: data.medical_center ?? '',
        bio: data.bio ?? '',
        organization_id: data.organization_id ?? undefined,
    } : null;
}
