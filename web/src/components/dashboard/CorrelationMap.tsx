'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle } from "lucide-react";

interface CorrelationMapProps {
    data: Array<{ stress_level: number; craving_intensity: number; date: string, emotion: string }>;
}

const CustomTooltip = ({ active, payload }: { active?: boolean, payload?: Array<Record<string, unknown>> }) => {
    if (active && payload && payload.length) {
        const p = payload[0].payload;
        return (
            <div className="bg-white border border-slate-200 p-3 shadow-lg rounded-md text-sm">
                <p className="font-semibold text-slate-700">{p.date}</p>
                <p className="text-indigo-600"><span className="font-medium">Emoción:</span> {p.emotion}</p>
                <p className="text-slate-600">Estrés: {p.stress_level} / 10</p>
                <p className="text-amber-600">Antojo: {p.craving_intensity} / 10</p>
            </div>
        );
    }
    return null;
};

export function CorrelationMap({ data }: CorrelationMapProps) {

    return (
        <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-slate-800 flex items-center gap-2">
                            Mapa de Correlación
                        </CardTitle>
                        <CardDescription>Estrés vs Intensidad de Antojos</CardDescription>
                    </div>
                    <div className="p-2 bg-indigo-50 text-indigo-500 rounded-md">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis
                                type="number"
                                dataKey="craving_intensity"
                                name="Antojo"
                                domain={[0, 10]}
                                tickCount={6}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                label={{ value: 'Intensidad de Antojo', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 12 }}
                            />
                            <YAxis
                                type="number"
                                dataKey="stress_level"
                                name="Estrés"
                                domain={[0, 10]}
                                tickCount={6}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                label={{ value: 'Nivel de Estrés', angle: -90, position: 'insideLeft', offset: 0, fill: '#64748b', fontSize: 12 }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

                            {/* Quadrant color representation could be added via Cell, for now keeping it simple with a single scatter color based on stress */}
                            <Scatter name="Registros Diarios" data={data} fill="#8b5cf6" opacity={0.7} />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-600">
                    <p><strong>Insight Visual:</strong> Registros en el <em>cuadrante superior derecho</em> (alto estrés + alto antojo) indican hambre puramente emocional. Usa estos datos para guiar al paciente.</p>
                </div>
            </CardContent>
        </Card>
    );
}
