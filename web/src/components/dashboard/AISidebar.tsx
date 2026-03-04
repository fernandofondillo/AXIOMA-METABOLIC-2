'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { analyzeCaseWithAI, checkAIAvailability } from '@/actions/aiActions';
import { BrainCircuit, Loader2 } from 'lucide-react';

interface AISidebarProps {
    patientId: string;
}

export function AISidebar({ patientId }: AISidebarProps) {
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isAIAvailable, setIsAIAvailable] = useState<boolean>(true);

    useEffect(() => {
        checkAIAvailability().then(setIsAIAvailable);
    }, []);

    const handleAnalyze = async () => {
        setLoading(true);
        setAnalysis(null);
        try {
            const result = await analyzeCaseWithAI(patientId);
            if (result.success && result.analysis) {
                setAnalysis(result.analysis);
            } else {
                setAnalysis(result.error || 'Error desconocido.');
            }
        } catch {
            setAnalysis('Ocurrió un error al contactar al asistente IA.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-1">
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        onClick={handleAnalyze}
                        disabled={!isAIAvailable}
                        className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-300 disabled:text-slate-500"
                    >
                        <BrainCircuit className="w-4 h-4" />
                        Analizar Caso con IA
                    </Button>
                </SheetTrigger>

                <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="flex items-center gap-2 text-indigo-900">
                            <BrainCircuit className="w-5 h-5 text-indigo-600" />
                            Consultoría Axioma IA
                        </SheetTitle>
                        <SheetDescription>
                            Obtén un análisis basado en el historial y métricas del paciente.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex flex-col gap-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                                <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
                                <p>Analizando perfil metabólico y patrones recientes...</p>
                            </div>
                        ) : analysis ? (
                            <div className="prose prose-sm text-slate-700 dark:prose-invert">
                                {/* Note: In a real app we'd use react-markdown to parse this nicely */}
                                {analysis.split('\n').map((paragraph, index) => (
                                    <p key={index} className="mb-2 leading-relaxed">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </SheetContent>
            </Sheet>
            {!isAIAvailable && (
                <span className="text-xs text-rose-500 font-medium tracking-tight">Módulo de IA no configurado por el administrador</span>
            )}
        </div>
    );
}
