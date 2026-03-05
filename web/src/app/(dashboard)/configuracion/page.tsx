import { createClient } from '@/lib/supabase/server';
import { ConfigurationForm } from './ConfigurationForm';
import { Settings } from 'lucide-react';

export default async function ConfiguracionPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    // Fetch existing profile data if any
    let profileData = { full_name: '', specialty: '', medical_center: '', bio: '' };
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, specialty, medical_center, bio')
            .eq('id', user.id)
            .single();

        if (profile) {
            profileData = {
                full_name: profile.full_name ?? '',
                specialty: profile.specialty ?? '',
                medical_center: profile.medical_center ?? '',
                bio: profile.bio ?? '',
            };
        }
    }


    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Configuración</h1>
                    <p className="text-slate-500 text-sm">Gestiona tu perfil profesional y la información que aparece en los informes.</p>
                </div>
            </div>

            <ConfigurationForm initialData={profileData} />
        </div>
    );
}
