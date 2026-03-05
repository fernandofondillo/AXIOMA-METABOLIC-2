'use client';

import { use } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function PatientReportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    // Mock data for the printable report based on the patient's ID
    const mockData = {
        patientName: 'Carlos Mendoza',
        patientId: id,
        date: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
        phenotype: 'Resistencia a la Insulina',
        phenotypeDesc: 'Se detecta un patrón de alto riesgo asociado a dificultad para procesar azúcares, lo que favorece el almacenamiento de grasa abdominal y genera picos de fatiga post-comida.',
        metrics: [
            { label: 'IMC', value: '27.5', status: 'Alerta', color: 'text-amber-600', bg: 'bg-amber-100' },
            { label: 'HOMA-IR', value: '3.2', status: 'Crítico', color: 'text-red-600', bg: 'bg-red-100' },
            { label: 'RCA (Cintura/Altura)', value: '0.54', status: 'Crítico', color: 'text-red-600', bg: 'bg-red-100' },
        ],
        commitments: [
            { title: 'Regla del 10%', description: 'Retirar el 10% de la porción servida antes de empezar a comer.' },
            { title: 'Orden de Ingesta', description: 'Comenzar siempre por la fibra (verduras), luego proteína y grasas, y dejar los almidones/azúcares para el final.' },
            { title: 'Caminata Post-prandial', description: 'Caminar 10-15 minutos a paso ligero inmediatamente después de la comida más fuerte del día.' }
        ]
    };

    const handlePrint = () => {
        window.print();
    };

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
                <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-white">
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir Informe
                </Button>
            </div>

            {/* A4 Printable Sheet */}
            <div className="bg-white p-10 sm:p-14 shadow-md rounded-xl border border-slate-200 print:shadow-none print:border-none print:p-0">
                {/* Header */}
                <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AXIOMA METABOLIC</h1>
                        <p className="text-slate-500 font-medium mt-1">Informe Clínico de Evolución</p>
                    </div>
                    <div className="text-right text-sm text-slate-600 space-y-1">
                        <p><span className="font-medium text-slate-800">Fecha:</span> {mockData.date}</p>
                        <p><span className="font-medium text-slate-800">Paciente:</span> {mockData.patientName}</p>
                        <p><span className="font-medium text-slate-800">ID:</span> {mockData.patientId}</p>
                    </div>
                </div>

                {/* Phenotype Diagnosis */}
                <div className="mb-10">
                    <h2 className="text-xl font-bold text-slate-800 mb-3 border-l-4 border-primary pl-3">Diagnóstico Fenotípico</h2>
                    <div className="bg-slate-50 p-5 rounded-lg border border-slate-100">
                        <p className="text-lg font-semibold text-primary mb-2">{mockData.phenotype}</p>
                        <p className="text-slate-700 leading-relaxed">{mockData.phenotypeDesc}</p>
                    </div>
                </div>

                {/* Metabolic Semaphore */}
                <div className="mb-10">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 border-l-4 border-primary pl-3">Semáforo Metabólico</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {mockData.metrics.map((metric, idx) => (
                            <div key={idx} className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${metric.bg} border-white/50 backdrop-blur-sm`}>
                                <p className="text-sm font-semibold text-slate-700 opacity-80 mb-2 uppercase tracking-wide">{metric.label}</p>
                                <span className={`text-4xl font-black ${metric.color} mb-1 drop-shadow-sm`}>{metric.value}</span>
                                <span className={`text-sm font-bold uppercase tracking-widest ${metric.color}`}>{metric.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Commitments (Micro-changes) */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-5 border-l-4 border-emerald-500 pl-3">Tus 3 Compromisos de la Semana</h2>
                    <div className="space-y-4">
                        {mockData.commitments.map((commitment, idx) => (
                            <div key={idx} className="flex gap-4 p-5 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                    {idx + 1}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">{commitment.title}</h3>
                                    <p className="text-slate-600 mt-1 leading-relaxed">{commitment.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="mt-14 pt-6 border-t border-slate-200 text-center">
                    <p className="text-slate-500 text-sm">Este informe es una guía clínica de apoyo y no sustituye la supervisión médica presencial continuada.</p>
                </div>
            </div>
        </div>
    );
}
