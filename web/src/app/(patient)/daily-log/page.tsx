import { HungerScale } from '@/components/patient/HungerScale';
import { MicroGoalTracker } from '@/components/patient/MicroGoalTracker';
import { Toaster } from '@/components/ui/sonner';

export default async function DailyLogPage() {
    // En una app real, PatientId vendría de la sesión (Supabase Auth)
    const mockPatientId = 'P-MOBILE-123';

    // Mock initial goals 
    const initialGoals = [
        { id: 'goal-1', description: 'Beber 2L de agua hoy', isCompletedToday: false },
        { id: 'goal-2', description: 'Caminar 10 min tras comer', isCompletedToday: true },
        { id: 'goal-3', description: 'Dejar el móvil 30 min antes de dormir', isCompletedToday: false },
    ];

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
            {/* Simple Mobile Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-center sticky top-0 z-10 shadow-sm">
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">
                    Axioma Patient
                </h1>
            </header>

            <div className="max-w-md mx-auto px-4 pt-6 space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Hola Carlos!</h2>
                    <p className="text-slate-500">¿Cómo te sientes hoy? Hagamos tu check-in rápido.</p>
                </div>

                {/* 1. Hunger Scale Component */}
                <section>
                    <HungerScale patientId={mockPatientId} />
                </section>

                {/* 2. Micro Goals Checker */}
                <section>
                    <MicroGoalTracker initialGoals={initialGoals} />
                </section>
            </div>

            <Toaster position="bottom-center" />
        </main>
    );
}
