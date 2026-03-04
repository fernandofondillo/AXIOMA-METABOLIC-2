'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { interviewConfig, InterviewGuide } from '@/config/interviewGuides';

export function InterviewWizard() {
    const [step, setStep] = useState(1);
    const [guide] = useState<InterviewGuide>(interviewConfig['inicial']);

    // States for Step 1 (Bio-Metrics)
    const [peso, setPeso] = useState<string>('');
    const [altura, setAltura] = useState<string>('');

    let imc: number | null = null;
    const p = parseFloat(peso);
    const a = parseFloat(altura); // assumes meters
    if (p > 0 && a > 0) {
        imc = parseFloat((p / (a * a)).toFixed(2));
    }

    // States for Step 2 (Dynamic Questions)
    // Mapping questionId -> value (array of strings if multiselect)
    const [answers, setAnswers] = useState<Record<string, string[]>>({});
    // Mapping questionId -> "Otros" text value
    const [otherDetails, setOtherDetails] = useState<Record<string, string>>({});

    // States for Step 3 (Action Plan)
    const [recommendations, setRecommendations] = useState('');
    const [microChanges, setMicroChanges] = useState<{ label: string, checked: boolean }[]>([
        { label: 'Beber 2 litros de agua', checked: false },
        { label: 'Caminata 15 min post-comida', checked: false },
        { label: 'Apagar pantallas 1h antes de dormir', checked: false }
    ]);

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

    const nextStep = () => setStep(s => Math.min(s + 1, 3));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));
    const submit = () => {
        console.log("Submit logic pending integration with server actions");
        // Form data would map to submitInterview()
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
                        </div>

                        <div className="mt-8 p-6 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
                            <div>
                                <h3 className="text-slate-700 font-medium">Cálculo en Tiempo Real</h3>
                                <p className="text-sm text-slate-500">Índice de Masa Corporal (IMC)</p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-primary">
                                    {imc ? imc : '--'}
                                </span>
                                <span className="text-slate-400 font-medium ml-1">kg/m²</span>
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
                            <div className="mb-4">
                                <h3 className="text-emerald-800 font-semibold text-lg flex items-center gap-2">
                                    <span className="text-xl">✨</span> Sugerencias de Micro-Cambios
                                </h3>
                                <p className="text-emerald-600/80 text-sm font-medium">Basado en algoritmos analíticos (Mock)</p>
                            </div>

                            <div className="space-y-3">
                                {microChanges.map((mc, idx) => (
                                    <label key={idx} className="flex items-center gap-3 p-3 bg-white rounded-md border border-emerald-200/50 cursor-pointer hover:bg-emerald-50/50 transition-colors">
                                        <input
                                            type="checkbox"
                                            className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                            checked={mc.checked}
                                            onChange={() => {
                                                const newMc = [...microChanges];
                                                newMc[idx].checked = !newMc[idx].checked;
                                                setMicroChanges(newMc);
                                            }}
                                        />
                                        <span className="font-medium text-slate-700">{mc.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </CardContent>

            <CardFooter className="bg-slate-50 border-t border-slate-100 py-4 px-6 flex justify-between rounded-b-xl">
                <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={step === 1}
                    className="border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                    Atrás
                </Button>
                <Button
                    onClick={step === 3 ? submit : nextStep}
                    className="bg-primary hover:bg-primary/90 text-white font-medium"
                >
                    {step === 3 ? 'Guardar Entrevista' : 'Continuar'}
                </Button>
            </CardFooter>
        </Card>
    );
}
