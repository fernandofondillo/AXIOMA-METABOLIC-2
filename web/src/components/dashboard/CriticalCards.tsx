import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Droplet, Flame, BrainCircuit } from 'lucide-react';

export type CriticalMetricsProps = {
    imc: number;
    homaIr: number;
    pcr: number; // Nivel de inflamación
    stressLevel: 'Bajo' | 'Moderado' | 'Alto' | 'Crítico';
};

export function CriticalStateCards({ metrics }: { metrics: CriticalMetricsProps }) {

    // Logic for IMC coloration
    const getImcStatus = (imc: number) => {
        if (imc < 18.5) return { label: 'Bajo', color: 'text-orange-600', bg: 'bg-orange-100' };
        if (imc >= 18.5 && imc < 25) return { label: 'Normal', color: 'text-emerald-600', bg: 'bg-emerald-100' };
        if (imc >= 25 && imc < 30) return { label: 'Sobrepeso', color: 'text-orange-600', bg: 'bg-orange-100' };
        return { label: 'Obesidad', color: 'text-red-600', bg: 'bg-red-100' };
    };

    const imcStatus = getImcStatus(metrics.imc);

    // Logic for HOMA-IR coloration (Cutoff ~ 2.5 for resistance depending on lab, assuming general clinical)
    const isHomaResistant = metrics.homaIr >= 2.5;

    // Logic for Inflammation (PCR) - e.g. < 1.0 Low risk, 1.0 - 3.0 average, > 3.0 high risk
    const getPcrStatus = (pcr: number) => {
        if (pcr < 1.0) return { label: 'Riesgo Bajo', color: 'text-emerald-600' };
        if (pcr <= 3.0) return { label: 'Riesgo Moderado', color: 'text-orange-600' };
        return { label: 'Riesgo Alto', color: 'text-red-600' };
    };
    const pcrStatus = getPcrStatus(metrics.pcr);

    // Logic for Stress
    const getStressColor = (level: string) => {
        switch (level) {
            case 'Bajo': return 'text-emerald-600';
            case 'Moderado': return 'text-orange-500';
            case 'Alto': return 'text-orange-600';
            case 'Crítico': return 'text-red-600';
            default: return 'text-slate-600';
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

            {/* IMC Card */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">IMC (Índice Masa Corporal)</CardTitle>
                    <Activity className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline space-x-2">
                        <div className={`text-2xl font-bold ${imcStatus.color}`}>{metrics.imc}</div>
                        <Badge variant="secondary" className={`${imcStatus.bg} ${imcStatus.color} border-none`}>
                            {imcStatus.label}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* HOMA-IR Card */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">HOMA-IR</CardTitle>
                    <Droplet className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline space-x-2">
                        <div className={`text-2xl font-bold ${isHomaResistant ? 'text-red-600' : 'text-emerald-600'}`}>
                            {metrics.homaIr}
                        </div>
                        <Badge variant={isHomaResistant ? "destructive" : "secondary"} className={!isHomaResistant ? "bg-emerald-100 text-emerald-700 border-none" : ""}>
                            {isHomaResistant ? 'Resistencia' : 'Sensibilidad'}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Inflamacion Card */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Inflamación (PCR)</CardTitle>
                    <Flame className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-800">{metrics.pcr} <span className="text-sm font-normal text-slate-500">mg/L</span></div>
                    <p className={`text-xs mt-1 font-medium ${pcrStatus.color}`}>{pcrStatus.label}</p>
                </CardContent>
            </Card>

            {/* Carga de Estres Card */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Carga de Estrés</CardTitle>
                    <BrainCircuit className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${getStressColor(metrics.stressLevel)}`}>
                        {metrics.stressLevel}
                    </div>
                    <p className="text-xs mt-1 text-slate-500">Evaluación combinada de cortisol y clínica</p>
                </CardContent>
            </Card>

        </div>
    );
}
