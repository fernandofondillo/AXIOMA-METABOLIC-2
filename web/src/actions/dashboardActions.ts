'use server';

import { createClient } from '@/lib/supabase/server';

export type EvolutionChartData = {
    date: string;
    peso: number | null;
    porcentaje_grasa: number | null;
    insulina: number | null;
    glucosa: number | null;
};

/**
 * Obtiene el histórico métrico y lo formatea para la librería Recharts
 */
export async function getDashboardEvolutionData(patientId: string): Promise<EvolutionChartData[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('metabolic_metrics')
        .select('created_at, peso, porcentaje_grasa, insulina, glucosa')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: true });

    if (error || !data) {
        console.error('Error fetching dashboard data:', error);
        return [];
    }

    // Mapeamos directo para Recharts
    return data.map((row) => ({
        date: new Date(row.created_at).toLocaleDateString(),
        peso: row.peso,
        porcentaje_grasa: row.porcentaje_grasa,
        insulina: row.insulina,
        glucosa: row.glucosa,
    }));
}

/**
 * Extrae un "Nivel de Ansiedad" simulado en base a los datos de la tabla "interviews",
 * o cualquier otro parseo de métricas cualitativas para graficar.
 */
export async function getAnxietyEvolutionData(patientId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('interviews')
        .select('created_at, data')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: true });

    if (error || !data) {
        return [];
    }

    // Ejemplo de parseo: Supongamos que en data guardamos "nivel_ansiedad" (1-10) 
    // en el bloque 2 de emociones. Aquí extraemos si existe para graficar.
    return data.map((row) => {
        const chartData = {
            date: new Date(row.created_at).toLocaleDateString(),
            nivel_ansiedad: row.data?.nivel_ansiedad ? Number(row.data.nivel_ansiedad) : null,
        };
        return chartData;
    }).filter(item => item.nivel_ansiedad !== null); // Filtramos nulos para no romper el gráfico
}
