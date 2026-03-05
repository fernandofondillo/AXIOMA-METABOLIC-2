'use client';

import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart2, TrendingUp, Brain } from 'lucide-react';

interface Patient {
    id: string;
    full_name: string;
}

interface MetricRow {
    patient_id: string;
    peso: number | null;
    grasa_visceral: number | null;
    glucosa: number | null;
    insulina: number | null;
    imc: number | null;
    recorded_at: string;
}

interface DailyLogRow {
    patient_id: string;
    stress_level: number | null;
    craving_intensity: number | null;
    emotion_tag: string | null;
    log_date: string;
}

interface Props {
    patients: Patient[];
    allMetrics: MetricRow[];
    allDailyLogs: DailyLogRow[];
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

export function AnalyticsDashboardClient({ patients, allMetrics, allDailyLogs }: Props) {
    const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id ?? '');

    const patientMetrics = useMemo(() =>
        allMetrics
            .filter(m => m.patient_id === selectedPatientId)
            .map(m => ({
                date: formatDate(m.recorded_at),
                Peso: m.peso ?? undefined,
                'Grasa Visceral': m.grasa_visceral ?? undefined,
                Glucosa: m.glucosa ?? undefined,
                Insulina: m.insulina ?? undefined,
                IMC: m.imc ?? undefined,
            })),
        [allMetrics, selectedPatientId]
    );

    const correlationData = useMemo(() =>
        allDailyLogs
            .filter(l => l.patient_id === selectedPatientId && l.stress_level != null && l.craving_intensity != null)
            .map(l => ({
                x: l.stress_level!,
                y: l.craving_intensity!,
                z: 1,
                date: formatDate(l.log_date),
                emotion: l.emotion_tag ?? '—',
            })),
        [allDailyLogs, selectedPatientId]
    );

    const selectedPatient = patients.find(p => p.id === selectedPatientId);

    if (patients.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4 space-y-4">
                <BarChart2 className="w-12 h-12 text-slate-300" />
                <h1 className="text-2xl font-bold text-slate-700">Sin Pacientes Registrados</h1>
                <p className="text-slate-500 max-w-md">Añade tu primer paciente y registra su primera consulta para ver aquí la evolución metabólica y los mapas de correlación.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-primary" />
                        Analíticas Clínicas
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Evolución real de indicadores metabólicos por paciente.</p>
                </div>
                <div>
                    <label htmlFor="patient-selector" className="text-xs font-medium text-slate-500 block mb-1 uppercase tracking-wider">Paciente</label>
                    <select
                        id="patient-selector"
                        className="border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        value={selectedPatientId}
                        onChange={e => setSelectedPatientId(e.target.value)}
                    >
                        {patients.map(p => (
                            <option key={p.id} value={p.id}>{p.full_name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {patientMetrics.length === 0 ? (
                <div className="py-20 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">Sin datos de evolución para {selectedPatient?.full_name}.</p>
                    <p className="text-sm mt-1">Registra la primera consulta clínica para ver las gráficas.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Weight & Visceral Fat Chart */}
                    <Card className="border-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold text-slate-800">Peso & Grasa Visceral</CardTitle>
                            <CardDescription>Evolución temporal (kg / unidades)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={240}>
                                <LineChart data={patientMetrics}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="Peso" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                                    <Line type="monotone" dataKey="Grasa Visceral" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Glucose & Insulin Chart */}
                    <Card className="border-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold text-slate-800">Glucosa & Insulina</CardTitle>
                            <CardDescription>Evolución temporal (mg/dL y µUI/mL)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={240}>
                                <LineChart data={patientMetrics}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="Glucosa" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                                    <Line type="monotone" dataKey="Insulina" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Correlation Map */}
            <Card className="border-slate-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-500" />
                        Mapa de Correlación: Estrés vs. Antojos
                    </CardTitle>
                    <CardDescription>Cada punto representa un registro diario del paciente. Correlación entre nivel de estrés e intensidad de antojos.</CardDescription>
                </CardHeader>
                <CardContent>
                    {correlationData.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-sm">
                            <p>Sin registros de seguimiento diario para {selectedPatient?.full_name}.</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <ScatterChart>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" dataKey="x" name="Estrés" domain={[0, 10]} tick={{ fontSize: 11 }} label={{ value: 'Nivel de Estrés', position: 'insideBottom', offset: -5, fontSize: 11 }} />
                                <YAxis type="number" dataKey="y" name="Antojo" domain={[0, 10]} tick={{ fontSize: 11 }} label={{ value: 'Intensidad Antojo', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                                <ZAxis type="number" dataKey="z" range={[40, 80]} />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const d = payload[0].payload;
                                            return (
                                                <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs shadow-md">
                                                    <p className="font-semibold">{d.date}</p>
                                                    <p>Estrés: <span className="font-medium">{d.x}/10</span></p>
                                                    <p>Antojo: <span className="font-medium">{d.y}/10</span></p>
                                                    {d.emotion && <p>Emoción: <span className="font-medium text-purple-600">{d.emotion}</span></p>}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Scatter name="Registros" data={correlationData} fill="#8b5cf6" opacity={0.75} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
