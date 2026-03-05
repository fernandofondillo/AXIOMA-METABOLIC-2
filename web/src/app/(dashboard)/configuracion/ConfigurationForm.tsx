'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { updateProfileAction, ProfileData } from '@/app/actions/profile';
import { toast } from 'sonner';
import { Save, CheckCircle } from 'lucide-react';

interface Props {
    initialData: ProfileData;
}

export function ConfigurationForm({ initialData }: Props) {
    const [fullName, setFullName] = useState(initialData.full_name ?? '');
    const [specialty, setSpecialty] = useState(initialData.specialty ?? '');
    const [medicalCenter, setMedicalCenter] = useState(initialData.medical_center ?? '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const result = await updateProfileAction({
                full_name: fullName,
                specialty,
                medical_center: medicalCenter,
            });

            if (result.success) {
                toast.success('Perfil actualizado correctamente. Los cambios se verán en el informe del paciente.');
            } else {
                toast.error('Error al guardar: ' + (result.error ?? 'Inténtalo de nuevo.'));
            }
        } catch {
            toast.error('Ocurrió un error inesperado.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <Card className="border-slate-200">
                <CardHeader>
                    <CardTitle className="text-base font-semibold text-slate-800">Datos Profesionales</CardTitle>
                    <CardDescription>Esta información aparecerá en la cabecera de los informes de pacientes y en el encabezado de la plataforma.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="full-name" className="text-slate-700">Nombre Completo</Label>
                        <Input
                            id="full-name"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            placeholder="Ej: Dra. María García López"
                            className="border-slate-300 focus-visible:ring-primary"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="specialty" className="text-slate-700">Especialidad / Título</Label>
                        <Input
                            id="specialty"
                            value={specialty}
                            onChange={e => setSpecialty(e.target.value)}
                            placeholder="Ej: Nutricionista Clínica, Endocrinóloga..."
                            className="border-slate-300 focus-visible:ring-primary"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="medical-center" className="text-slate-700">Centro / Clínica</Label>
                        <Input
                            id="medical-center"
                            value={medicalCenter}
                            onChange={e => setMedicalCenter(e.target.value)}
                            placeholder="Ej: Centro de Salud Metabólica Madrid"
                            className="border-slate-300 focus-visible:ring-primary"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary/90 text-white px-8"
                >
                    {isSaving ? (
                        <><Save className="w-4 h-4 mr-2 animate-pulse" /> Guardando...</>
                    ) : (
                        <><CheckCircle className="w-4 h-4 mr-2" /> Guardar Cambios</>
                    )}
                </Button>
            </div>
        </form>
    );
}
