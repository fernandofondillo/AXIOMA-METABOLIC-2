// src/lib/clinicalEngine.ts

export type Phenotype = 'Inflamatorio' | 'Resistencia a Insulina' | 'Comedor Emocional' | 'Metabólicamente Estable' | 'Riesgo Mixto';

export interface MicroChange {
    id: string;
    category: 'Nutrición' | 'Antojos' | 'Hábitos' | 'Psicología';
    title: string;
    description: string;
    targetPhenotypes: Phenotype[];
}

export const MICRO_CHANGES_LIBRARY: MicroChange[] = [
    // Nutrición
    { id: 'n1', category: 'Nutrición', title: 'Regla del 10%', description: 'Retirar el 10% de la porción servida antes de empezar a comer.', targetPhenotypes: ['Resistencia a Insulina', 'Riesgo Mixto'] },
    { id: 'n2', category: 'Nutrición', title: 'Orden de Ingesta', description: 'Comenzar siempre por la fibra (verduras), luego proteína y grasas, y dejar los almidones/azúcares para el final.', targetPhenotypes: ['Resistencia a Insulina', 'Inflamatorio', 'Riesgo Mixto'] },
    { id: 'n3', category: 'Nutrición', title: 'Efecto Delboeuf', description: 'Servir las comidas principales en platos de 20cm de diámetro para engaño visual cognitivo.', targetPhenotypes: ['Comedor Emocional', 'Riesgo Mixto'] },
    { id: 'n4', category: 'Nutrición', title: 'Ayuno Intermitente Suave (12/12)', description: 'Cenar temprano y dejar 12 horas de reposo digestivo nocturno.', targetPhenotypes: ['Resistencia a Insulina', 'Inflamatorio'] },
    { id: 'n5', category: 'Nutrición', title: 'Ventana de Carbohidratos', description: 'Concentrar la ingesta de hidratos de carbono densos en la comida post-entrenamiento.', targetPhenotypes: ['Resistencia a Insulina'] },
    { id: 'n6', category: 'Nutrición', title: 'Masticación Consciente (20x)', description: 'Masticar cada bocado un mínimo de 20 veces, posando los cubiertos entre bocados.', targetPhenotypes: ['Comedor Emocional', 'Inflamatorio'] },

    // Antojos
    { id: 'a1', category: 'Antojos', title: 'Puente de los 15 min', description: 'Ante un antojo impulsivo, beber un vaso grande de agua y esperar 15 minutos exactos de reloj antes de decidir.', targetPhenotypes: ['Comedor Emocional', 'Riesgo Mixto'] },
    { id: 'a2', category: 'Antojos', title: 'Snack de Emergencia Proteico', description: 'Tener siempre a mano un bloque de proteína (ej. huevo duro, rollito de pavo, edamames) para frenar picos de hambre aguda.', targetPhenotypes: ['Resistencia a Insulina', 'Comedor Emocional'] },
    { id: 'a3', category: 'Antojos', title: 'Sustitución Sensorial', description: 'Cambiar el antojo dulce por un estímulo fuerte alternativo: infusión muy caliente de menta, chicle de clorofila fuerte, o cepillado de dientes.', targetPhenotypes: ['Comedor Emocional'] },
    { id: 'a4', category: 'Antojos', title: 'Desconexión Visual', description: 'Retirar bowls de comida, galletas y snacks de la vista en la cocina y mesa de trabajo.', targetPhenotypes: ['Comedor Emocional'] },
    { id: 'a5', category: 'Antojos', title: 'Micro-Dosis de Chocolate Noir', description: 'Permitir 1 onza de chocolate >85% cacao al final de la comida si hay necesidad imperiosa de dulce, nunca aislado.', targetPhenotypes: ['Resistencia a Insulina', 'Comedor Emocional'] },

    // Hábitos
    { id: 'h1', category: 'Hábitos', title: 'Caminata Post-prandial', description: 'Caminar 10-15 minutos a paso ligero inmediatamente después de la comida más fuerte del día.', targetPhenotypes: ['Resistencia a Insulina', 'Riesgo Mixto'] },
    { id: 'h2', category: 'Hábitos', title: 'Higiene de Luz Azul', description: 'Apagar pantallas y reducir luces artificiales 30-60 minutos antes de dormir.', targetPhenotypes: ['Inflamatorio', 'Comedor Emocional'] },
    { id: 'h3', category: 'Hábitos', title: 'Regla del 1x1 Activo', description: 'Por cada hora de sedestación, levantarse y hacer 1 minuto de sentadillas al aire o estiramientos activos.', targetPhenotypes: ['Resistencia a Insulina', 'Inflamatorio'] },
    { id: 'h4', category: 'Hábitos', title: 'Baño de Bosque/Naturaleza', description: 'Exposición semanal deliberada a un entorno natural (parque grande, campo, playa) sin auriculares para reducir cortisol.', targetPhenotypes: ['Inflamatorio', 'Comedor Emocional'] },
    { id: 'h5', category: 'Hábitos', title: 'Ducha de Contraste', description: 'Terminar la ducha matutina con 30-60 segundos de agua completamente fría para estimulación vagal.', targetPhenotypes: ['Inflamatorio', 'Resistencia a Insulina'] },

    // Psicología
    { id: 'p1', category: 'Psicología', title: 'Respiración 4-7-8', description: 'Practicar 4 ciclos de respiración profunda (inhalar 4s, retener 7s, exhalar 8s) justo al sentarse a la mesa antes de comer.', targetPhenotypes: ['Comedor Emocional', 'Inflamatorio'] },
    { id: 'p2', category: 'Psicología', title: 'Check-in Hambre Física vs Emocional', description: 'Preguntarse: "¿Estaría dispuesto/a a comerme una manzana o un filete de pescado ahora mismo?". Si es no, es hambre emocional.', targetPhenotypes: ['Comedor Emocional'] },
    { id: 'p3', category: 'Psicología', title: 'Diario de Gratitud Express', description: 'Escribir 3 cosas positivas del día antes de dormir para reducir la rumiación nocturna y el cortisol.', targetPhenotypes: ['Inflamatorio', 'Comedor Emocional'] },
    { id: 'p4', category: 'Psicología', title: 'Etiquetado Emocional (Naming)', description: 'Cuando aparezca la urgencia por comer, verbalizar en voz alta "Siento ansiedad" o "Siento aburrimiento", sacando la emoción de la amígdala.', targetPhenotypes: ['Comedor Emocional'] },
    { id: 'p5', category: 'Psicología', title: 'Bolsa de Recompensas No-Alimentarias', description: 'Crear una lista de 5 actividades placenteras (leer, masaje, baño, llamar a amigo) y recurrir a ella cuando haya un logro, en lugar de celebrarlo con comida.', targetPhenotypes: ['Comedor Emocional', 'Riesgo Mixto'] },
];

export interface PatientMetrics {
    peso?: number;
    altura?: number;
    perimetroCintura?: number;
    perimetroCadera?: number;
    grasaVisceral?: number; // 1-59
    glucosa?: number;
    insulina?: number;
    pcr?: number;
    imc?: number; // Calculado preventivamente
}

export interface PatientTriggers {
    nivelEstres?: 'Bajo' | 'Medio' | 'Alto';
    intensidadAntojos?: 'Baja' | 'Media' | 'Alta';
    disparadoresEmocionales?: string[]; // Ej: ['Soledad', 'Aburrimiento', 'Recompensa', 'Ansiedad']
}

export function calculateAlertState(value: number, threshold1: number, threshold2: number, lowerIsBetter: boolean = true) {
    if (lowerIsBetter) {
        if (value <= threshold1) return 'safe'; // Verde
        if (value > threshold1 && value < threshold2) return 'warning'; // Amarillo
        return 'danger'; // Rojo
    } else {
        // Para cosas donde estar más alto es mejor, ejemplo músculo, aunque aquí no lo usamos aún.
        if (value >= threshold2) return 'safe';
        if (value < threshold2 && value > threshold1) return 'warning';
        return 'danger';
    }
}

export function getPatientPhenotype(metrics: PatientMetrics, triggers: PatientTriggers): Phenotype {
    const {
        perimetroCintura,
        altura,
        pcr,
        glucosa,
        insulina,
        grasaVisceral,
        imc
    } = metrics;

    const {
        nivelEstres,
        intensidadAntojos,
        disparadoresEmocionales = []
    } = triggers;

    // Cálculos auxiliares si los datos están disponibles
    const rca = (perimetroCintura && altura) ? (perimetroCintura / (altura * 100)) : null; // Asumiendo altura en metros
    const homaIR = (glucosa && insulina) ? ((glucosa * insulina) / 405) : null;
    const isHighStress = nivelEstres === 'Alto';
    const hasEmotionalTriggers = disparadoresEmocionales.some(t => ['Soledad', 'Recompensa', 'Ansiedad', 'Aburrimiento', 'Estrés crónico'].includes(t));
    const hasHighCravings = intensidadAntojos === 'Alta';

    let riskFactors = {
        inflamacion: 0,
        resistencia: 0,
        emocional: 0
    };

    // 1. Evaluar Perfil Inflamatorio
    if (pcr && pcr > 3) riskFactors.inflamacion += 2;
    else if (pcr && pcr > 1) riskFactors.inflamacion += 1;

    if (rca && rca > 0.5) riskFactors.inflamacion += 1;
    if (grasaVisceral && grasaVisceral > 12) riskFactors.inflamacion += 1;
    if (isHighStress) riskFactors.inflamacion += 1;

    // 2. Evaluar Resistencia a la Insulina
    if (homaIR && homaIR > 2.5) riskFactors.resistencia += 2;
    else if (homaIR && homaIR > 1.9) riskFactors.resistencia += 1;
    else if (!homaIR && imc && imc > 28) riskFactors.resistencia += 1; // Estimación cruda si no hay analítica

    if (rca && rca > 0.53) riskFactors.resistencia += 1;
    if (grasaVisceral && grasaVisceral > 14) riskFactors.resistencia += 1;

    // 3. Evaluar Comedor Emocional
    if (hasHighCravings) riskFactors.emocional += 2;
    if (hasEmotionalTriggers) riskFactors.emocional += 2;
    if (isHighStress) riskFactors.emocional += 1;

    // Determinar Fenotipo Predominante
    if (riskFactors.inflamacion >= 3 && riskFactors.resistencia >= 2) return 'Riesgo Mixto';

    const maxRisk = Math.max(riskFactors.inflamacion, riskFactors.resistencia, riskFactors.emocional);

    if (maxRisk === 0) return 'Metabólicamente Estable';

    if (maxRisk === riskFactors.emocional && riskFactors.emocional >= 3) return 'Comedor Emocional';
    if (maxRisk === riskFactors.resistencia && riskFactors.resistencia >= 2) return 'Resistencia a Insulina';
    if (maxRisk === riskFactors.inflamacion && riskFactors.inflamacion >= 2) return 'Inflamatorio';

    return 'Riesgo Mixto'; // Fallback si no hay claro predominio pero hay riesgos
}

export function suggestMicroChanges(phenotype: Phenotype, count: number = 3): MicroChange[] {
    // Filtrar la biblioteca por cambios que apliquen al fenotipo detectado
    let pool = MICRO_CHANGES_LIBRARY.filter(mc => mc.targetPhenotypes.includes(phenotype));

    // Si no hay suficientes, coger los genéricos o buscar Riesgo Mixto
    if (pool.length < count) {
        const mixedPool = MICRO_CHANGES_LIBRARY.filter(mc => mc.targetPhenotypes.includes('Riesgo Mixto') && !pool.includes(mc));
        pool = [...pool, ...mixedPool];
    }

    // Si sigue habiendo muy pocos (estable), dar recomendaciones generales aleatorias (en producción usar Fisher-Yates shuffle)
    if (pool.length === 0) {
        pool = [...MICRO_CHANGES_LIBRARY];
    }

    // Shuffle simple y retornar
    const shuffled = pool.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}
