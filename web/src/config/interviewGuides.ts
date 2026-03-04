export type QuestionOption = {
    label: string;
    value: string;
    requiresDetails?: boolean;
};

export type InterviewQuestion = {
    id: string;
    label: string;
    type: 'select' | 'multiselect' | 'text' | 'number';
    options?: QuestionOption[];
    required?: boolean;
};

export type InterviewBlock = {
    id: string;
    title: string;
    description?: string;
    questions: InterviewQuestion[];
};

export type InterviewGuide = {
    type: 'inicial' | 'seguimiento';
    blocks: InterviewBlock[];
};

// Configuración base de la Guía de Entrevista
export const interviewConfig: Record<'inicial' | 'seguimiento', InterviewGuide> = {
    inicial: {
        type: 'inicial',
        blocks: [
            {
                id: 'b1_disruptores',
                title: 'Bloque 1: Disruptores Metabólicos',
                questions: [
                    {
                        id: 'disruptores_principales',
                        label: 'Identifique los disruptores metabólicos principales',
                        type: 'multiselect',
                        required: true,
                        options: [
                            { label: 'Estrés', value: 'estres' },
                            { label: 'Falta de sueño', value: 'falta_sueno' },
                            { label: 'Sedentarismo', value: 'sedentarismo' },
                            { label: 'Fármacos', value: 'farmacos', requiresDetails: true },
                            { label: 'Otros', value: 'otros', requiresDetails: true },
                        ],
                    },
                ],
            },
            {
                id: 'b2_emocionales',
                title: 'Bloque 2: Disparadores Emocionales',
                questions: [
                    {
                        id: 'disparadores_emocionales',
                        label: 'Seleccione los disparadores emocionales recurrentes',
                        type: 'multiselect',
                        required: true,
                        options: [
                            { label: 'Aburrimiento', value: 'aburrimiento' },
                            { label: 'Ansiedad laboral', value: 'ansiedad_laboral' },
                            { label: 'Soledad', value: 'soledad' },
                            { label: 'Recompensa', value: 'recompensa' },
                            { label: 'Otros', value: 'otros', requiresDetails: true },
                        ],
                    },
                ],
            },
            {
                id: 'b3_dietetico',
                title: 'Bloque 3: Historial Dietético',
                questions: [
                    {
                        id: 'historial_dietetico',
                        label: 'Indique características del historial dietético previo',
                        type: 'multiselect',
                        required: true,
                        options: [
                            { label: 'Dieta Keto previa', value: 'keto_previa' },
                            { label: 'Ayuno', value: 'ayuno' },
                            { label: 'Restricción severa', value: 'restriccion_severa' },
                            { label: 'Crónica de efecto rebote', value: 'efecto_rebote' },
                            { label: 'Otros', value: 'otros', requiresDetails: true },
                        ],
                    },
                ],
            },
        ],
    },
    seguimiento: {
        type: 'seguimiento',
        blocks: [
            {
                id: 'b1_progreso',
                title: 'Bloque 1: Revisión de Progreso',
                questions: [
                    {
                        id: 'adherencia_plan',
                        label: 'Nivel de adherencia al plan',
                        type: 'select',
                        required: true,
                        options: [
                            { label: 'Alto', value: 'alto' },
                            { label: 'Medio', value: 'medio' },
                            { label: 'Bajo', value: 'bajo' },
                        ],
                    },
                    {
                        id: 'nuevos_disruptores',
                        label: '¿Nuevos disruptores detectados?',
                        type: 'multiselect',
                        options: [
                            { label: 'Estrés reciente', value: 'estres_reciente' },
                            { label: 'Cambio de medicación', value: 'cambio_medicacion', requiresDetails: true },
                            { label: 'Otros', value: 'otros', requiresDetails: true },
                        ],
                    },
                ],
            },
        ],
    },
};
