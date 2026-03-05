import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Droplet, Flame, BrainCircuit } from 'lucide-react';

export type CriticalMetricsProps = {
    imc?: number | null;
    homaIr?: number | null;
    pcr?: number | null;
    stressLevel?: 'Bajo' | 'Moderado' | 'Medio' | 'Alto' | 'Crítico' | null;
};

export function CriticalStateCards({ metrics }: { metrics: CriticalMetricsProps }) {

    const getImcStatus = (imc: number) => {
        if (imc < 18.5) return { label: 'Bajo Peso', color: 'text-orange-600', bg: 'bg-orange-100' };
        if (imc >= 18.5 && imc < 25) return { label: 'Normal', color: 'text-emerald-600', bg: 'bg-emerald-100' };
        if (imc >= 25 && imc < 30) return { label: 'Sobrepeso', color: 'text-orange-600', bg: 'bg-orange-100' };
        return { label: 'Obesidad', color: 'text-red-600', bg: 'bg-red-100' };
    };

    const getPcrStatus = (pcr: number) => {
        if (pcr < 1.0) return { label: 'Riesgo Bajo', color: 'text-emerald-600' };
        if (pcr <= 3.0) return { label: 'Riesgo Moderado', color: 'text-orange-600' };
        return { label: 'Riesgo Alto', color: 'text-red-600' };
    };

    const getStressColor = (level: string) => {
        switch (level) {
            case 'Bajo': return 'text-emerald-600';
            case 'Moderado': case 'Medio': return 'text-orange-500';
            case 'Alto': return 'text-orange-600';
            case 'Crítico': return 'text-red-600';
            default: return 'text-slate-600';
        }
    };

    const noData = (label: string) => (
        <div className="text-xl font-bold text-slate-300">—</div>
    );

    const imcStatus = metrics.imc ? getImcStatus(metrics.imc) : null;
    const isHomaResistant = metrics.homaIr != null && metrics.homaIr >= 2.5;
    const pcrStatus = metrics.pcr != null ? getPcrStatus(metrics.pcr) : null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

            {/* IMC Card */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">IMC</CardTitle>
                    <Activity className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                    {metrics.imc != null && imcStatus ? (
                        <div className="flex items-baseline space-x-2">
                            <div className={`text-2xl font-bold ${imcStatus.color}`}>{metrics.imc.toFixed(1)}</div>
                            <Badge variant="secondary" className={`${imcStatus.bg} ${imcStatus.color} border-none`}>
                                {imcStatus.label}
                            </Badge>
                        </div>
                    ) : noData('IMC')}
                    <p className="text-xs mt-1 text-slate-400">Índice Masa Corporal</p>
                </CardContent>
            </Card>

            {/* HOMA-IR Card */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">HOMA-IR</CardTitle>
                    <Droplet className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                    {metrics.homaIr != null ? (
                        <div className="flex items-baseline space-x-2">
                            <div className={`text-2xl font-bold ${isHomaResistant ? 'text-red-600' : 'text-emerald-600'}`}>
                                {metrics.homaIr.toFixed(2)}
                            </div>
                            <Badge variant={isHomaResistant ? "destructive" : "secondary"} className={!isHomaResistant ? "bg-emerald-100 text-emerald-700 border-none" : ""}>
                                {isHomaResistant ? 'Resistencia' : 'Normal'}
                            </Badge>
                        </div>
                    ) : noData('HOMA-IR')}
                    <p className="text-xs mt-1 text-slate-400">Sensibilidad a la insulina</p>
                </CardContent>
            </Card>

            {/* Inflamación (PCR) Card */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Inflamación (PCR)</CardTitle>
                    <Flame className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                    {metrics.pcr != null && pcrStatus ? (
                        <>
                            <div className="text-2xl font-bold text-slate-800">{metrics.pcr} <span className="text-sm font-normal text-slate-500">mg/L</span></div>
                            <p className={`text-xs mt-1 font-medium ${pcrStatus.color}`}>{pcrStatus.label}</p>
                        </>
                    ) : (
                        <>
                            {noData('PCR')}
                            <p className="text-xs mt-1 text-slate-400">Requiere analítica de laboratorio</p>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Carga de Estrés Card */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Carga de Estrés</CardTitle>
                    <BrainCircuit className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                    {metrics.stressLevel ? (
                        <div className={`text-2xl font-bold ${getStressColor(metrics.stressLevel)}`}>
                            {metrics.stressLevel}
                        </div>
                    ) : noData('Estrés')}
                    <p className="text-xs mt-1 text-slate-400">Evaluación clínica combinada</p>
                </CardContent>
            </Card>

        </div>
    );
}
