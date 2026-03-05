import { createClient } from '@/lib/supabase/server';
import { Menu, Bell } from 'lucide-react';

export async function Header() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch professional profile from profiles table
    let displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Dr. Profesional';
    let specialty = 'Especialista Clínico';
    let orgName = 'Axioma Metabolic';

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, specialty, medical_center')
            .eq('id', user.id)
            .single();

        if (profile) {
            if (profile.full_name) displayName = profile.full_name;
            if (profile.specialty) specialty = profile.specialty;
            if (profile.medical_center) orgName = profile.medical_center;
        }
    }

    // Create initials from the display name
    const initials = displayName
        .split(' ')
        .map((n: string) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'AM';

    return (
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <button className="md:hidden p-2 text-slate-500 hover:text-primary transition-colors">
                    <Menu className="w-6 h-6" />
                </button>
                <span className="font-semibold text-slate-800 text-lg hidden sm:block">
                    {orgName}
                </span>
            </div>

            <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
                    <Bell className="w-5 h-5" />
                </button>

                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-800 truncate max-w-[200px]">{displayName}</p>
                    <p className="text-xs text-emerald-600 font-medium">{specialty}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold select-none cursor-pointer">
                    {initials}
                </div>
            </div>
        </header>
    );
}
