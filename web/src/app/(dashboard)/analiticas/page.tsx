import { createClient } from '@/lib/supabase/server';
import { AnalyticsDashboardClient } from './AnalyticsDashboardClient';

export default async function AnaliticasPage() {
    const supabase = await createClient();

    // 1. Fetch all patients for the selector
    const { data: patients } = await supabase
        .from('patients_identity')
        .select('id, full_name')
        .order('full_name', { ascending: true });

    // 2. Fetch metrics for ALL patients (will be filtered client-side)
    const { data: metrics } = await supabase
        .from('metabolic_metrics')
        .select('patient_id, peso, grasa_visceral, glucosa, insulina, imc, recorded_at')
        .order('recorded_at', { ascending: true });

    // 3. Fetch daily_logs for correlation map
    const { data: dailyLogs } = await supabase
        .from('daily_logs')
        .select('patient_id, stress_level, craving_intensity, emotion_tag, log_date')
        .order('log_date', { ascending: true });

    return (
        <AnalyticsDashboardClient
            patients={patients ?? []}
            allMetrics={metrics ?? []}
            allDailyLogs={dailyLogs ?? []}
        />
    );
}
