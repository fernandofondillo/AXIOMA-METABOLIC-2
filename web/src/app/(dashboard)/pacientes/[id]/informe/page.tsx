import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Printer, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// This is a Server Component - no 'use client' needed
// All data is fetched on the server for a fast, SEO-friendly, print-ready page.

function getStatusColor(label: string, value: number): { color: string, bg: string, status: string } {
    if (label === 'IMC') {
        if (value < 25) return { color: 'text-emerald-700', bg: 'bg-emerald-50', status: 'Saludable' };
        if (value < 30) return { color: 'text-amber-600', bg: 'bg-amber-50', status: 'Alerta' };
        return { color: 'text-red-600', bg: 'bg-red-50', status: 'Crítico' };
    }
    if (label === 'HOMA-IR') {
        if (value < 2.0) return { color: 'text-emerald-700', bg: 'bg-emerald-50', status: 'Normal' };
        if (value < 2.5) return { color: 'text-amber-600', bg: 'bg-amber-50', status: 'Alerta' };
        return { color: 'text-red-600', bg: 'bg-red-50', status: 'Resistencia' };
    }
    if (label === 'RCA') {
        if (value < 0.5) return { color: 'text-emerald-700', bg: 'bg-emerald-50', status: 'Saludable' };
        return { color: 'text-red-600', bg: 'bg-red-50', status: '⚠ Riesgo Alto' };
    }
    if (label === 'Grasa Visceral') {
        if (value <= 9) return { color: 'text-emerald-700', bg: 'bg-emerald-50', status: 'Saludable' };
        if (value <= 12) return { color: 'text-amber-600', bg: 'bg-amber-50', status: 'Alerta' };
        return { color: 'text-red-600', bg: 'bg-red-50', status: '🔥 Riesgo Inflamatorio' };
    }
    return { color: 'text-slate-700', bg: 'bg-slate-50', status: 'Dato disponible' };
}

function getPhenotypeDescription(phenotype: string | null): string {
    const descriptions: Record<string, string> = {
        'Inflamatorio': 'Se detecta un perfil inflamatorio sistémico. La acumulación de grasa abdominal y el estrés crónico elevan marcadores de inflamación y aumentan el riesgo cardiovascular. La prioridad es reducir inflamación mediante hábitos anti-inflamatorios.',
        'Resistencia a Insulina': 'Se detecta un patrón de dificultad para procesar azúcares eficientemente. Esto favorece el almacenamiento de grasa abdominal, genera picos de fatiga post-comida y aumenta el riesgo de Diabetes Tipo 2 a largo plazo. La prioridad es mejorar la sensibilidad a la insulina.',
        'Comedor Emocional': 'Se identifica una fuerte conexión emocional con la ingesta alimentaria. Los antojos no responden a hambre fisiológica sino a estados emocionales como estrés, ansiedad o aburrimiento. La prioridad es desarrollar herramientas de gestión emocional.',
        'Riesgo Mixto': 'Se detecta una combinación de factores de riesgo inflamatorios y metabólicos que requieren una intervención integral. El abordaje debe ser multidisciplinar para maximizar la efectividad.',
        'Metabólicamente Estable': 'Los indicadores actuales muestran un perfil metabólico dentro de rangos de seguridad. El objetivo es consolidar los hábitos actuales y prevenir recaídas con micro-cambios de mantenimiento.',
    };
    if (!phenotype) return 'No se ha generado un perfil fenotípico para este paciente aún.';
    // Handle phenotype with flags like "Resistencia a Insulina (Riesgo Inflamatorio)"
    const basePhenotype = phenotype.split(' (')[0] as keyof typeof descriptions;
    return descriptions[basePhenotype] ?? 'Perfil fenotípico identificado. Revise con el especialista las recomendaciones específicas.';
}

export default async function PatientReportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Fetch patient identity
    const { data: patient, error: patientError } = await supabase
        .from('patients_identity')
        .select('full_name, created_at')
        .eq('id', id)
        .single();

    if (patientError || !patient) {
        notFound();
    }

    // 2. Fetch latest metabolic metrics
    const { data: metrics } = await supabase
        .from('metabolic_metrics')
        .select('imc, grasa_visceral, perimetro_cintura, altura, glucosa, insulina, recorded_at')
        .eq('patient_id', id)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

    // 3. Fetch latest interview for phenotype and micro-changes
    const { data: interview } = await supabase
        .from('interviews')
        .select('interview_data, recorded_at')
        .eq('patient_id', id)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

    // 4. Fetch professional profile for the report header
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = user ? await supabase
        .from('profiles')
        .select('full_name, specialty, medical_center')
        .eq('id', user.id)
        .single() : { data: null };

    // Build derived values
    const reportDate = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    const phenotype = interview?.interview_data?.phenotype ?? null;
    const microChanges: Array<{ title: string; description?: string }> = interview?.interview_data?.selected_micro_changes ?? [];

    // Build semaphore items from real metrics
    const semaphoreItems = [];
    if (metrics?.imc) {
        const s = getStatusColor('IMC', metrics.imc);
        semaphoreItems.push({ label: 'IMC', value: metrics.imc.toFixed(1), ...s });
    }
    if (metrics?.glucosa && metrics?.insulina) {
        const homaIr = parseFloat(((metrics.glucosa * metrics.insulina) / 405).toFixed(2));
        const s = getStatusColor('HOMA-IR', homaIr);
        semaphoreItems.push({ label: 'HOMA-IR', value: String(homaIr), ...s });
    }
    if (metrics?.perimetro_cintura && metrics?.altura) {
        const rca = parseFloat((metrics.perimetro_cintura / (metrics.altura * 100)).toFixed(2));
        const s = getStatusColor('RCA', rca);
        semaphoreItems.push({ label: 'RCA (Cintura/Altura)', value: String(rca), ...s });
    }
    if (metrics?.grasa_visceral) {
        const s = getStatusColor('Grasa Visceral', metrics.grasa_visceral);
        semaphoreItems.push({ label: 'Grasa Visceral', value: String(metrics.grasa_visceral), ...s });
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Action Bar - Hidden on Print */}
            <div className="flex items-center justify-between print:hidden mb-6">
                <Link href={`/pacientes/${id}`}>
                    <Button variant="outline" className="text-slate-600 bg-white">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Volver al Perfil
                    </Button>
                </Link>
                {/* Print button needs client-side JS, use a simple button form */}
                <form action="#">
                    <Button
                        type="button"
                        onClick={() => { if (typeof window !== 'undefined') window.print(); }}
                        className="bg-primary hover:bg-primary/90 text-white"
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimir / Guardar PDF
                    </Button>
                </form>
            </div>

            {/* A4 Printable Sheet */}
            <div className="bg-white p-10 sm:p-14 shadow-md rounded-xl border border-slate-200 print:shadow-none print:border-none print:p-0">
                {/* Header */}
                <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AXIOMA METABOLIC</h1>
                        <p className="text-slate-500 font-medium mt-1">Informe Clínico de Evolución</p>
                        {profile && (
                            <p className="text-slate-500 text-sm mt-1">{profile.full_name}{profile.specialty ? ` · ${profile.specialty}` : ''}{profile.medical_center ? ` · ${profile.medical_center}` : ''}</p>
                        )}
                    </div>
                    <div className="text-right text-sm text-slate-600 space-y-1">
                        <p><span className="font-medium text-slate-800">Fecha:</span> {reportDate}</p>
                        <p><span className="font-medium text-slate-800">Paciente:</span> {patient.full_name}</p>
                        <p><span className="font-medium text-slate-800">ID:</span> {id}</p>
                    </div>
                </div>

                {/* Phenotype Diagnosis */}
                <div className="mb-10">
                    <h2 className="text-xl font-bold text-slate-800 mb-3 border-l-4 border-primary pl-3">Diagnóstico Fenotípico</h2>
                    <div className="bg-slate-50 p-5 rounded-lg border border-slate-100">
                        <p className="text-lg font-semibold text-primary mb-2">{phenotype ?? 'Pendiente de entrevista'}</p>
                        <p className="text-slate-700 leading-relaxed">{getPhenotypeDescription(phenotype)}</p>
                    </div>
                </div>

                {/* Metabolic Semaphore */}
                {semaphoreItems.length > 0 ? (
                    <div className="mb-10">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 border-l-4 border-primary pl-3">Semáforo Metabólico</h2>
                        <div className={`grid grid-cols-2 ${semaphoreItems.length >= 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-4`}>
                            {semaphoreItems.map((item, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${item.bg} border-white/50`}>
                                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">{item.label}</p>
                                    <span className={`text-3xl font-black ${item.color} mb-1`}>{item.value}</span>
                                    <span className={`text-xs font-bold uppercase tracking-widest ${item.color}`}>{item.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="mb-10 p-5 bg-slate-50 rounded-lg border border-slate-100 text-center text-slate-500">
                        <p>No hay métricas registradas aún. Complete la primera entrevista para ver el semáforo metabólico.</p>
                    </div>
                )}

                {/* Commitments (Micro-changes) */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-5 border-l-4 border-emerald-500 pl-3">Tus 3 Compromisos de la Semana</h2>
                    {microChanges.length > 0 ? (
                        <div className="space-y-4">
                            {microChanges.slice(0, 3).map((mc, idx) => {
                                const parts = mc.label ? mc.label.split(': ') : [mc.title, mc.description ?? ''];
                                const title = parts[0];
                                const desc = parts.slice(1).join(': ');
                                return (
                                    <div key={idx} className="flex gap-4 p-5 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
                                            {desc && <p className="text-slate-600 mt-1 leading-relaxed">{desc}</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-lg text-slate-500 text-sm text-center">
                            <p>Los compromisos se generarán automáticamente tras completar la primera consulta clínica.</p>
                        </div>
                    )}
                </div>

                {/* Signature Area */}
                <div className="mt-14 pt-6 border-t border-slate-200 flex justify-between items-end">
                    <div className="text-sm text-slate-500">
                        <p>Este informe es una guía clínica de apoyo y no sustituye</p>
                        <p>la supervisión médica presencial continuada.</p>
                    </div>
                    <div className="text-right text-sm text-slate-600">
                        <div className="w-48 border-b border-slate-400 mb-2"></div>
                        <p className="font-medium">{profile?.full_name ?? 'Firma del Profesional'}</p>
                        {profile?.specialty && <p className="text-xs text-slate-400">{profile.specialty}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
