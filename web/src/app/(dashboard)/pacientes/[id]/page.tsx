import { CriticalStateCards } from '@/components/dashboard/CriticalCards';
import { EvolutionCharts } from '@/components/dashboard/EvolutionCharts';
import { AISidebar } from '@/components/dashboard/AISidebar';
import { CorrelationMap } from '@/components/dashboard/CorrelationMap';
import { Button } from '@/components/ui/button';
import { FilePlus, MessageSquareWarning, FileText } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const patientId = resolvedParams.id;

    const supabase = await createClient();

    // Fetch real patient data
    const { data: patient, error } = await supabase
        .from('patients_identity')
        .select('full_name, date_of_birth')
        .eq('id', patientId)
        .single();

    if (error || !patient) notFound();

    // Fetch latest metrics
    const { data: latestMetric } = await supabase
        .from('metabolic_metrics')
        .select('imc, glucosa, insulina')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

    // Fetch latest phenotype from interview
    const { data: latestInterview } = await supabase
        .from('interviews')
        .select('interview_data')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

    const phenotype = latestInterview?.interview_data?.phenotype ?? 'Pendiente de entrevista';

    const homaIr = (latestMetric?.glucosa && latestMetric?.insulina)
        ? parseFloat(((latestMetric.glucosa * latestMetric.insulina) / 405).toFixed(2))
        : undefined;

    const metricsForCards = {
        imc: latestMetric?.imc ?? undefined,
        homaIr: homaIr,
        pcr: undefined as number | undefined,
        stressLevel: 'Medio' as const,
    };

    // Fetch evolution data for charts
    const { data: evolutionData } = await supabase
        .from('metabolic_metrics')
        .select('peso, porcentaje_grasa, glucosa, insulina, recorded_at')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: true })
        .limit(10);

    const chartData = (evolutionData ?? []).map(m => ({
        date: new Date(m.recorded_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        peso: m.peso,
        porcentaje_grasa: m.porcentaje_grasa,
        glucosa: m.glucosa,
        insulina: m.insulina,
    }));

    // Fetch daily logs for correlation map
    const { data: dailyLogs } = await supabase
        .from('daily_logs')
        .select('stress_level, craving_intensity, log_date, emotion_tag')
        .eq('patient_id', patientId)
        .order('log_date', { ascending: false })
        .limit(14);

    const correlationData = (dailyLogs ?? []).map(l => ({
        stress_level: l.stress_level,
        craving_intensity: l.craving_intensity,
        date: new Date(l.log_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        emotion: l.emotion_tag ?? '—',
    }));

    const age = patient.date_of_birth
        ? Math.floor((new Date().getTime() - new Date(patient.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
        : null;

    return (
        <div className="space-y-6">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{patient.full_name}</h2>
                    <p className="text-slate-500">ID: {patientId}{age ? ` • ${age} Años` : ''} • Fenotipo: {phenotype}</p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href={`/pacientes/${patientId}/informe`}>
                        <Button variant="outline" className="border-slate-300 text-slate-700 bg-white">
                            <FileText className="w-4 h-4 mr-2" />
                            Ver Informe
                        </Button>
                    </Link>
                    <Button variant="outline" className="border-slate-300 text-slate-700 bg-white">
                        <MessageSquareWarning className="w-4 h-4 mr-2" />
                        Notas Clínicas
                    </Button>

                    <AISidebar patientId={patientId} />

                    <Link href={`/consulta/nueva?patientId=${patientId}`}>
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
                <CriticalStateCards metrics={metricsForCards} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Evolución Metabólica</h3>
                    <EvolutionCharts data={chartData} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Comportamiento (Últimos 14 días)</h3>
                    <CorrelationMap data={correlationData} />
                </div>
            </div>

        </div>
    );
}
