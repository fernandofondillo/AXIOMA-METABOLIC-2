'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { interviewConfig, InterviewGuide } from '@/config/interviewGuides';
import { getPatientPhenotype, suggestMicroChanges, PatientMetrics, PatientTriggers, MicroChange } from '@/lib/clinicalEngine';
import { saveInterviewData } from '@/app/actions/interview';
import { useRouter } from 'next/navigation';

export function InterviewWizard() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const [guide] = useState<InterviewGuide>(interviewConfig['inicial']);

    // States for Step 1 (Bio-Metrics)
    const [peso, setPeso] = useState<string>('');
    const [altura, setAltura] = useState<string>('');
    const [cintura, setCintura] = useState<string>('');
    const [cadera, setCadera] = useState<string>('');
    const [grasaVisceral, setGrasaVisceral] = useState<string>('');

    let imc: number | null = null;
    const p = parseFloat(peso);
    const a = parseFloat(altura); // assumes meters
    const cin = parseFloat(cintura);
    const cad = parseFloat(cadera);
    const gv = parseFloat(grasaVisceral);

    if (p > 0 && a > 0) {
        imc = parseFloat((p / (a * a)).toFixed(2));
    }

    let rca: number | null = null;
    if (cin > 0 && a > 0) {
        rca = parseFloat((cin / (a * 100)).toFixed(2));
    }

    let rcc: number | null = null;
    if (cin > 0 && cad > 0) {
        rcc = parseFloat((cin / cad).toFixed(2));
    }

    // States for Step 2 (Dynamic Questions)
    // Mapping questionId -> value (array of strings if multiselect)
    const [answers, setAnswers] = useState<Record<string, string[]>>({});
    // Mapping questionId -> "Otros" text value
    const [otherDetails, setOtherDetails] = useState<Record<string, string>>({});

    // States for Step 3 (Action Plan)
    const [recommendations, setRecommendations] = useState('');
    const [generatedPhenotype, setGeneratedPhenotype] = useState<string | null>(null);
    const [microChanges, setMicroChanges] = useState<{ id: string, label: string, checked: boolean }[]>([]);

    const handleMultiselectChange = (questionId: string, optionValue: string) => {
        setAnswers(prev => {
            const current = prev[questionId] || [];
            if (current.includes(optionValue)) {
                return { ...prev, [questionId]: current.filter(v => v !== optionValue) };
            }
            return { ...prev, [questionId]: [...current, optionValue] };
        });
    };

    const isOtherSelected = (questionId: string) => {
        return (answers[questionId] || []).includes('otros');
    };

    const handleNextToStep3 = () => {
        if (microChanges.length === 0) {
            // Determine Triggers based on answers map (mocking mapping assuming some known IDs if present)
            // Ideally we'd map specific questions to these, let's just make a generic extraction
            // and use the clinicalEngine.
            const hasStress = Object.values(answers).some(ans => ans.includes('estres') || ans.includes('ansiedad'));
            const hasCravings = Object.values(answers).some(ans => ans.includes('dulces') || ans.includes('antojos'));

            const triggers: PatientTriggers = {
                nivelEstres: hasStress ? 'Alto' : 'Medio',
                intensidadAntojos: hasCravings ? 'Alta' : 'Baja',
                disparadoresEmocionales: hasStress ? ['Estrés crónico'] : []
            };

            const metrics: PatientMetrics = {
                peso: p || undefined,
                altura: a || undefined,
                perimetroCintura: cin || undefined,
                perimetroCadera: cad || undefined,
                grasaVisceral: gv || undefined,
                imc: imc || undefined
            };

            const phenotype = getPatientPhenotype(metrics, triggers);
            setGeneratedPhenotype(phenotype);

            const suggestions = suggestMicroChanges(phenotype, 3);
            setMicroChanges(suggestions.map(s => ({ id: s.id, label: s.title + ': ' + s.description, checked: true })));
        }
        setStep(3);
    };

    const nextStep = () => {
        if (step === 2) {
            handleNextToStep3();
        } else {
            setStep(s => Math.min(s + 1, 3));
        }
    };
    const prevStep = () => setStep(s => Math.max(s - 1, 1));
    const submit = async () => {
        setIsSubmitting(true);
        // Mock Patient ID for now
        const patientId = 'P-9842';

        const metricsData = {
            peso: p || null,
            altura: a || null,
            perimetro_cintura: cin || null,
            perimetro_cadera: cad || null,
            grasa_visceral: gv || null,
            imc: imc || null
        };

        const interviewData = {
            answers,
            otherDetails,
            recommendations,
            phenotype: generatedPhenotype,
            selected_micro_changes: microChanges.filter(mc => mc.checked)
        };

        try {
            const result = await saveInterviewData(patientId, interviewData, metricsData);
            if (result.success) {
                // Redirect to the printable report 
                router.push(`/pacientes/${patientId}/informe`);
            } else {
                console.error("Error saving:", result.error);
                alert("Error al guardar la entrevista: " + result.error);
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("Ocurrió un error inesperado al guardar.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="max-w-4xl mx-auto shadow-md border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6 rounded-t-xl">
                <div className="flex justify-between items-center mb-2">
                    <CardTitle className="text-2xl text-primary font-bold">Asistente Clínico Inteligente</CardTitle>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-2.5 w-8 rounded-full ${step >= i ? 'bg-primary' : 'bg-slate-200'}`} />
                        ))}
                    </div>
                </div>
                <CardDescription className="text-slate-500 font-medium">
                    {step === 1 && "Paso 1: Bio-Métricas Fundamentales"}
                    {step === 2 && "Paso 2: Cuestionario Dinámico de Factores"}
                    {step === 3 && "Paso 3: Plan de Acción y Micro-Cambios"}
                </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 min-h-[400px]">

                {/* STEP 1: Bio-Metrics */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="peso" className="text-slate-700">Peso (kg)</Label>
                                <Input
                                    id="peso" type="number" step="0.1"
                                    value={peso} onChange={e => setPeso(e.target.value)}
                                    placeholder="Ej: 75.5" className="border-slate-300 focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="altura" className="text-slate-700">Altura (m)</Label>
                                <Input
                                    id="altura" type="number" step="0.01"
                                    value={altura} onChange={e => setAltura(e.target.value)}
                                    placeholder="Ej: 1.75" className="border-slate-300 focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cintura" className="text-slate-700">Perímetro Cintura (cm)</Label>
                                <Input
                                    id="cintura" type="number" step="0.1"
                                    value={cintura} onChange={e => setCintura(e.target.value)}
                                    placeholder="Ej: 85" className="border-slate-300 focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cadera" className="text-slate-700">Perímetro Cadera (cm)</Label>
                                <Input
                                    id="cadera" type="number" step="0.1"
                                    value={cadera} onChange={e => setCadera(e.target.value)}
                                    placeholder="Ej: 100" className="border-slate-300 focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="grasa" className="text-slate-700">Grasa Visceral (1-59)</Label>
                                <Input
                                    id="grasa" type="number"
                                    value={grasaVisceral} onChange={e => setGrasaVisceral(e.target.value)}
                                    placeholder="Ej: 10" className="border-slate-300 focus-visible:ring-primary"
                                />
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex flex-col items-center justify-center text-center">
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">IMC</p>
                                <span className="text-2xl font-bold text-slate-700">{imc ? imc : '--'}</span>
                            </div>

                            <div className={`p-4 border rounded-lg flex flex-col items-center justify-center text-center transition-colors ${!rca ? 'bg-slate-50 border-slate-100' : rca > 0.5 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${!rca ? 'text-slate-500' : rca > 0.5 ? 'text-red-600' : 'text-emerald-600'}`}>RCA</p>
                                <span className="text-2xl font-bold">{rca ? rca : '--'}</span>
                                {rca && <span className="text-[10px] mt-1 opacity-80">{rca > 0.5 ? 'Riesgo Cardiometabólico' : 'Saludable'}</span>}
                            </div>

                            <div className={`p-4 border rounded-lg flex flex-col items-center justify-center text-center transition-colors ${!rcc ? 'bg-slate-50 border-slate-100' : rcc > 0.85 ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${!rcc ? 'text-slate-500' : rcc > 0.85 ? 'text-orange-600' : 'text-emerald-600'}`}>RCC</p>
                                <span className="text-2xl font-bold">{rcc ? rcc : '--'}</span>
                                {rcc && <span className="text-[10px] mt-1 opacity-80">{rcc > 0.85 ? 'Alerta' : 'Saludable'}</span>}
                            </div>

                            <div className={`p-4 border rounded-lg flex flex-col items-center justify-center text-center transition-colors ${!gv ? 'bg-slate-50 border-slate-100' : gv > 12 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${!gv ? 'text-slate-500' : gv > 12 ? 'text-red-600' : 'text-emerald-600'}`}>Visceral</p>
                                <span className="text-2xl font-bold">{gv ? gv : '--'}</span>
                                {gv > 0 && <span className="text-[10px] mt-1 opacity-80">{gv > 12 ? 'Exceso Peligroso' : 'Saludable'}</span>}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: Dynamic JSON Forms */}
                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {guide.blocks.map(block => (
                            <div key={block.id} className="p-5 border border-slate-100 rounded-lg bg-white shadow-sm">
                                <h3 className="font-semibold text-lg text-primary mb-4">{block.title}</h3>

                                {block.questions.map(q => (
                                    <div key={q.id} className="mb-6 last:mb-0">
                                        <Label className="text-slate-700 font-medium mb-3 block">{q.label} {q.required && <span className="text-red-500">*</span>}</Label>

                                        {q.type === 'multiselect' && q.options && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {q.options.map(opt => (
                                                    <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${(answers[q.id] || []).includes(opt.value)
                                                        ? 'bg-emerald-50 border-emerald-200'
                                                        : 'bg-white border-slate-200 hover:bg-slate-50'
                                                        }`}>
                                                        <input
                                                            type="checkbox"
                                                            className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                                            checked={(answers[q.id] || []).includes(opt.value)}
                                                            onChange={() => handleMultiselectChange(q.id, opt.value)}
                                                        />
                                                        <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        {/* Conditional TextField for "Otros" */}
                                        {isOtherSelected(q.id) && (
                                            <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                                                <Input
                                                    placeholder="Especifique detalles..."
                                                    value={otherDetails[q.id] || ''}
                                                    onChange={e => setOtherDetails(prev => ({ ...prev, [q.id]: e.target.value }))}
                                                    className="border-slate-300 focus-visible:ring-emerald-500"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}

                {/* STEP 3: Action Plan & Micro-changes */}
                {step === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-3">
                            <Label className="text-lg font-semibold text-primary">Recomendaciones del Profesional</Label>
                            <Textarea
                                placeholder="Escriba las indicaciones médicas, observaciones y plan principal..."
                                className="min-h-[150px] border-slate-300 focus-visible:ring-primary resize-none"
                                value={recommendations}
                                onChange={e => setRecommendations(e.target.value)}
                            />
                        </div>

                        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-5">
                            <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-emerald-800 font-semibold text-lg flex items-center gap-2">
                                        <span className="text-xl">✨</span> Sugerencias de Micro-Cambios
                                    </h3>
                                    <p className="text-emerald-600/80 text-sm font-medium">Basado en Inteligencia Clínica</p>
                                </div>
                                {generatedPhenotype && (
                                    <div className="bg-emerald-100 text-emerald-800 text-sm px-3 py-1.5 rounded-full font-medium inline-flex self-start">
                                        Fenotipo: {generatedPhenotype}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                {microChanges.length > 0 ? microChanges.map((mc, idx) => (
                                    <label key={mc.id} className="flex items-start gap-3 p-3 bg-white rounded-md border border-emerald-200/50 cursor-pointer hover:bg-emerald-50/50 transition-colors">
                                        <input
                                            type="checkbox"
                                            className="mt-0.5 h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                            checked={mc.checked}
                                            onChange={() => {
                                                const newMc = [...microChanges];
                                                newMc[idx].checked = !newMc[idx].checked;
                                                setMicroChanges(newMc);
                                            }}
                                        />
                                        <span className="font-medium text-slate-700 leading-snug">{mc.label}</span>
                                    </label>
                                )) : (
                                    <p className="text-sm text-emerald-700">Calculando sugerencias...</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </CardContent>

            <CardFooter className="bg-slate-50 border-t border-slate-100 py-4 px-6 flex justify-between rounded-b-xl">
                <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={step === 1 || isSubmitting}
                    className="border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                    Atrás
                </Button>
                <Button
                    onClick={step === 3 ? submit : nextStep}
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90 text-white font-medium"
                >
                    {isSubmitting ? 'Guardando...' : (step === 3 ? 'Guardar Entrevista' : 'Continuar')}
                </Button>
            </CardFooter>
        </Card>
    );
}
