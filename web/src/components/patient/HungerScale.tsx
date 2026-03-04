'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { submitDailyLog } from '@/actions/trackingActions';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const EMOTIONS = [
    'Hambre real',
    'Ansiedad',
    'Aburrimiento',
    'Ganas de premiarme',
    'Tristeza',
    'Cansancio'
];

interface HungerScaleProps {
    patientId: string;
}

export function HungerScale({ patientId }: HungerScaleProps) {
    const [hungerPre, setHungerPre] = useState([5]);
    const [satietyPost, setSatietyPost] = useState([5]);
    const [emotion, setEmotion] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!emotion) {
            toast.error('Por favor selecciona una emoción asociada.');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('hungerPre', hungerPre[0].toString());
        formData.append('satietyPost', satietyPost[0].toString());
        formData.append('associatedEmotion', emotion);
        formData.append('stressLevel', '5'); // Simplified for this view
        formData.append('cravingIntensity', emotion !== 'Hambre real' ? '8' : '2'); // Example logic
        formData.append('notes', 'Logged via Mobile App');

        const result = await submitDailyLog(patientId, formData);

        setLoading(false);
        if (result.success) {
            toast.success('Registro guardado correctamente. ¡Buen trabajo!');
            setEmotion('');
            setHungerPre([5]);
            setSatietyPost([5]);
        } else {
            toast.error(result.error || 'Error al guardar el registro.');
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-xl text-slate-800">Check-in de Comida</CardTitle>
                <CardDescription>Escucha a tu cuerpo antes y después de comer.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 pt-6">

                {/* Hambre Pre */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label className="text-base font-semibold text-slate-700">Hambre antes de comer</Label>
                        <span className="text-indigo-600 font-bold bg-indigo-50 px-2 rounded-md">{hungerPre[0]}/10</span>
                    </div>
                    <Slider
                        value={hungerPre}
                        onValueChange={setHungerPre}
                        max={10} min={1} step={1}
                        className="py-2"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Nada (1)</span>
                        <span>Voraz (10)</span>
                    </div>
                </div>

                {/* Saciedad Post */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label className="text-base font-semibold text-slate-700">Saciedad después de comer</Label>
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-2 rounded-md">{satietyPost[0]}/10</span>
                    </div>
                    <Slider
                        value={satietyPost}
                        onValueChange={setSatietyPost}
                        max={10} min={1} step={1}
                        className="py-2"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Aún con hambre (1)</span>
                        <span>Demasiado lleno (10)</span>
                    </div>
                </div>

                {/* Emociones */}
                <div className="space-y-3">
                    <Label className="text-base font-semibold text-slate-700">Emoción principal asociada</Label>
                    <div className="flex flex-wrap gap-2">
                        {EMOTIONS.map(e => (
                            <Button
                                key={e}
                                type="button"
                                variant={emotion === e ? 'default' : 'outline'}
                                onClick={() => setEmotion(e)}
                                className={`rounded-full ${emotion === e ? 'bg-indigo-600 hover:bg-indigo-700' : 'text-slate-600 border-slate-300'}`}
                                size="sm"
                            >
                                {e}
                            </Button>
                        ))}
                    </div>
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={loading || !emotion}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 text-lg"
                >
                    {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                    Guardar Registro
                </Button>

            </CardContent>
        </Card>
    );
}
