import { createClient } from '@/lib/supabase/server';
import { Menu } from 'lucide-react';

export async function Header() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Use user metadata name if available, otherwise email, otherwise fallback
    const mockOrgName = 'Centro Médico Reforma';
    const mockProfessional = user?.user_metadata?.full_name || user?.email || 'Dr. Profesional';

    // Create initials from the display name
    const initials = mockProfessional
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <button className="md:hidden p-2 text-slate-500 hover:text-primary transition-colors">
                    <Menu className="w-6 h-6" />
                </button>
                <span className="font-semibold text-slate-800 text-lg hidden sm:block">
                    {mockOrgName}
                </span>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-800 truncate max-w-[200px]">{mockProfessional}</p>
                    <p className="text-xs text-emerald-600 font-medium">Médico Especialista</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold select-none cursor-pointer">
                    {initials || 'JP'}
                </div>
            </div>
        </header>
    );
}
