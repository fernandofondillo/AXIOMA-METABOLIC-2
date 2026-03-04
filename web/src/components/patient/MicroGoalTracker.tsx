'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toggleMicroGoalCompletion } from '@/actions/trackingActions';
import { toast } from 'sonner';
import { Target } from 'lucide-react';

interface Goal {
    id: string;
    description: string;
    isCompletedToday: boolean;
}

interface MicroGoalTrackerProps {
    initialGoals: Goal[];
}

export function MicroGoalTracker({ initialGoals }: MicroGoalTrackerProps) {
    const [goals, setGoals] = useState<Goal[]>(initialGoals);

    const handleToggle = async (goalId: string, checked: boolean) => {
        // Optimistic UI Update
        setGoals(prev => prev.map(g => g.id === goalId ? { ...g, isCompletedToday: checked } : g));

        const result = await toggleMicroGoalCompletion(goalId, checked);

        if (result.success) {
            if (checked) toast.success('¡Micro-objetivo logrado! 🎉');
        } else {
            toast.error(result.error);
            // Revert UI if error
            setGoals(prev => prev.map(g => g.id === goalId ? { ...g, isCompletedToday: !checked } : g));
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-sm border-slate-200">
            <CardHeader className="bg-emerald-50 border-b border-emerald-100 pb-4">
                <CardTitle className="text-xl text-emerald-900 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Micro-Objetivos
                </CardTitle>
                <CardDescription className="text-emerald-700">Tus metas de esta semana. Pequeños pasos, grandes resultados.</CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
                {goals.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">No tienes objetivos activos esta semana.</p>
                ) : (
                    <div className="space-y-4">
                        {goals.map(goal => (
                            <div key={goal.id} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                                <Checkbox
                                    id={goal.id}
                                    checked={goal.isCompletedToday}
                                    onCheckedChange={(checked) => handleToggle(goal.id, checked as boolean)}
                                    className="w-6 h-6 border-slate-300 rounded-full data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                />
                                <label
                                    htmlFor={goal.id}
                                    className={`text-base font-medium leading-none cursor-pointer flex-1 select-none ${goal.isCompletedToday ? 'text-slate-400 line-through' : 'text-slate-700'}`}
                                >
                                    {goal.description}
                                </label>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
