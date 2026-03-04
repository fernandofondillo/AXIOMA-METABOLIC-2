'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitDailyLog(patientId: string, formData: FormData) {
    const supabase = await createClient()

    // Extract from form data
    const hungerPre = parseInt(formData.get('hungerPre') as string)
    const satietyPost = parseInt(formData.get('satietyPost') as string)
    const associatedEmotion = formData.get('associatedEmotion') as string
    const stressLevel = parseInt(formData.get('stressLevel') as string)
    const cravingIntensity = parseInt(formData.get('cravingIntensity') as string)
    const notes = formData.get('notes') as string

    const { error } = await supabase.from('daily_logs').insert({
        patient_id: patientId,
        hunger_pre: hungerPre,
        satiety_post: satietyPost,
        associated_emotion: associatedEmotion,
        stress_level: stressLevel,
        craving_intensity: cravingIntensity,
        notes: notes,
    })

    if (error) {
        console.error('Failed to submit daily log', error)
        return { success: false, error: 'Hubo un problema registrando tu diario.' }
    }

    revalidatePath('/daily-log')
    return { success: true }
}

export async function toggleMicroGoalCompletion(goalId: string, isCompleted: boolean) {
    const supabase = await createClient()

    try {
        if (isCompleted) {
            // Mark as completed for today
            const { error } = await supabase.from('micro_goal_completions').insert({
                goal_id: goalId,
                // completed_date uses default current_date
            })
            if (error && error.code !== '23505') throw error // Ignore unique violation if already checked
        } else {
            // Unmark completion for today
            const { error } = await supabase.from('micro_goal_completions')
                .delete()
                .eq('goal_id', goalId)
                .eq('completed_date', new Date().toISOString().split('T')[0])

            if (error) throw error
        }

        revalidatePath('/daily-log')
        return { success: true }
    } catch (error) {
        console.error('Failed to toggle micro goal', error)
        return { success: false, error: 'Error actualizando tu meta.' }
    }
}

export async function prescribeMicroGoal(patientId: string, description: string) {
    const supabase = await createClient()

    // Needs auth check in real app. Assuming professional context here.
    const { data: userData } = await supabase.auth.getUser()

    const { error } = await supabase.from('micro_goals').insert({
        patient_id: patientId,
        description: description,
        created_by_professional_id: userData?.user?.id,
        status: 'active'
    })

    if (error) {
        console.error('Failed to prescribe micro goal', error)
        return { success: false, error: 'Error al prescribir meta.' }
    }

    revalidatePath(`/pacientes/${patientId}`)
    return { success: true }
}
