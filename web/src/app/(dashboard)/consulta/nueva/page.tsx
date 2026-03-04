import { InterviewWizard } from '@/components/interview/InterviewWizard';

export default function NewConsultationPage() {
    return (
        <div className="max-w-5xl mx-auto py-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Nueva Consulta Asistida</h2>
                <p className="text-slate-500 mt-1">Completa los pasos para registrar la evolución y obtener el plan sugerido por el Asistente Axioma.</p>
            </div>

            <InterviewWizard />
        </div>
    );
}
