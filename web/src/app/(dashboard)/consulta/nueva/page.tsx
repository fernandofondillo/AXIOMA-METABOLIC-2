import { InterviewWizard } from '@/components/interview/InterviewWizard';

export default async function NewConsultationPage({ searchParams }: { searchParams: Promise<{ patientId?: string }> }) {
    const resolvedSearchParams = await searchParams;
    const patientId = resolvedSearchParams.patientId;

    if (!patientId) {
        return <div className="p-8 text-center text-red-500">Error: No se especificó el paciente para la consulta.</div>;
    }

    return (
        <div className="max-w-5xl mx-auto py-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Nueva Consulta Asistida</h2>
                <p className="text-slate-500 mt-1">Completa los pasos para registrar la evolución y obtener el plan sugerido por el Asistente Axioma.</p>
            </div>

            <InterviewWizard patientId={patientId} />
        </div>
    );
}
