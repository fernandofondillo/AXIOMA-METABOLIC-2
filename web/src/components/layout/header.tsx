'use server';

import { Menu } from 'lucide-react';

export async function Header() {
    // In a real app we would fetch the user and organization name from Supabase Context / DB
    const mockOrgName = 'Centro Médico Reforma';
    const mockProfessional = 'Dr. Juan Pérez';

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
                    <p className="text-sm font-medium text-slate-800">{mockProfessional}</p>
                    <p className="text-xs text-emerald-600 font-medium">Médico Especialista</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold select-none cursor-pointer">
                    JP
                </div>
            </div>
        </header>
    );
}
