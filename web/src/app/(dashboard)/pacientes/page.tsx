import { CriticalStateCards } from '@/components/dashboard/CriticalCards';
import { EvolutionCharts } from '@/components/dashboard/EvolutionCharts';
import { AISidebar } from '@/components/dashboard/AISidebar';
import { CorrelationMap } from '@/components/dashboard/CorrelationMap';
import { Button } from '@/components/ui/button';
import { FilePlus, MessageSquareWarning, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function PatientProfilePage() {

    // Mock Data for frontend visualization
    const mockPatientId = 'P-9842';
    const mockMetrics = {
        imc: 27.5,
        homaIr: 3.2, // Resistant
        pcr: 1.5, // Inflamacion Moderada
        stressLevel: 'Alto' as const,
    };

    const mockEvolutionData = [
        { date: '01/Oct', peso: 85, porcentaje_grasa: 32, glucosa: 105, insulina: 12 },
        { date: '15/Oct', peso: 84, porcentaje_grasa: 31, glucosa: 102, insulina: 11 },
        { date: '01/Nov', peso: 82.5, porcentaje_grasa: 30, glucosa: 98, insulina: 9 },
        { date: '15/Nov', peso: 81, porcentaje_grasa: 28, glucosa: 95, insulina: 8.5 },
    ];

    const mockCorrelationData = [
        { stress_level: 8, craving_intensity: 9, date: '16/Nov', emotion: 'Ansiedad' },
        { stress_level: 6, craving_intensity: 5, date: '15/Nov', emotion: 'Aburrimiento' },
        { stress_level: 9, craving_intensity: 10, date: '14/Nov', emotion: 'Tristeza' },
        { stress_level: 3, craving_intensity: 2, date: '12/Nov', emotion: 'Hambre real' },
        { stress_level: 7, craving_intensity: 8, date: '10/Nov', emotion: 'Ansiedad' },
    ];

    // Mocked prediction banner control
    const hasRiskPattern = true;

    return (
        <div className="space-y-6">

            {/* AI Pattern Detection Banner */}
            {hasRiskPattern && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md flex items-start gap-4 shadow-sm">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-amber-800 font-semibold text-sm">IA: Patrón detectado</h4>
                        <p className="text-amber-700 text-sm mt-1">
                            El registro reciente de hábitos tiene una correlación {'>'} 80% con episodios pasados de alto riesgo o estancamiento. Sugerimos analizar el caso para anticipar intervención.
                        </p>
                    </div>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Carlos Mendoza</h2>
                    <p className="text-slate-500">ID: {mockPatientId} • 45 Años • Perfil: Resistencia a la Insulina</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-slate-300 text-slate-700 bg-white">
                        <MessageSquareWarning className="w-4 h-4 mr-2" />
                        Notas Clínicas
                    </Button>

                    <AISidebar patientId={mockPatientId} />

                    <Link href="/consulta/nueva">
                        <Button className="bg-primary hover:bg-primary/90 text-white">
                            <FilePlus className="w-4 h-4 mr-2" />
                            Nueva Consulta
                        </Button>
                    </Link>
                </div>
            </div>

            <hr className="border-slate-200" />

            {/* 360 Profile Dashboard */}
            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Estado Crítico Actual</h3>
                <CriticalStateCards metrics={mockMetrics} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Evolución Metabólica</h3>
                    <EvolutionCharts data={mockEvolutionData} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Comportamiento (Últimos 7 días)</h3>
                    <CorrelationMap data={mockCorrelationData} />
                </div>
            </div>

        </div>
    );
}
