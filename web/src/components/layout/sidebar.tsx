'use server';

import Link from 'next/link';
import { Users, FilePlus, Activity, Settings } from 'lucide-react';

export async function Sidebar() {
    const navItems = [
        { label: 'Lista de Pacientes', href: '/pacientes', icon: Users },
        { label: 'Nueva Consulta', href: '/consulta/nueva', icon: FilePlus },
        { label: 'Analíticas', href: '/analiticas', icon: Activity },
        { label: 'Configuración', href: '/configuracion', icon: Settings },
    ];

    return (
        <aside className="w-64 bg-slate-50 border-r border-slate-200 hidden md:flex flex-col h-full sticky top-0">
            <div className="p-6">
                <h1 className="text-xl font-bold text-primary">Axioma Metabolic</h1>
                <p className="text-sm text-slate-500 mt-1">Precisión Clínica</p>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-md transition-colors"
                    >
                        <item.icon className="w-5 h-5 text-slate-400" />
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-200 text-xs text-slate-400 text-center">
                v1.0.0
            </div>
        </aside>
    );
}
