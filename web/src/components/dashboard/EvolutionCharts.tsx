'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Usaremos un tipo inferido simulado para desarrollo del front
export type EvolutionDataPoint = {
    date: string;
    peso?: number | null;
    porcentaje_grasa?: number | null;
    glucosa?: number | null;
    insulina?: number | null;
};

export function EvolutionCharts({ data }: { data: EvolutionDataPoint[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {['Composición Corporal', 'Metabolismo Glucídico'].map(title => (
                    <div key={title} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center min-h-[250px] text-center">
                        <div className="text-slate-300 text-4xl mb-3">📊</div>
                        <p className="text-sm font-medium text-slate-500">{title}</p>
                        <p className="text-xs text-slate-400 mt-1">Realiza tu primera consulta para ver la evolución</p>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* Chart 1: Peso vs Grasa */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle className="text-lg text-slate-700">Composición Corporal</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '14px', fontWeight: 500 }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />

                                <Line yAxisId="left" type="monotone" dataKey="peso" name="Peso (kg)" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                <Line yAxisId="right" type="monotone" dataKey="porcentaje_grasa" name="Grasa (%)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Chart 2: Glucosa vs Insulina */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle className="text-lg text-slate-700">Metabolismo Glucídico</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '14px', fontWeight: 500 }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />

                                <Line type="monotone" dataKey="glucosa" name="Glucosa" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="insulina" name="Insulina" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
