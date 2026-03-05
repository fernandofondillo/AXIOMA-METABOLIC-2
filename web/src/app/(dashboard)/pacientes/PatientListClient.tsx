'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Plus, UserPlus, X, ChevronRight } from 'lucide-react';
import { createPatientAction } from '@/app/actions/patients';
import { toast } from 'sonner';

export default function PatientListClient({ initialPatients }: { initialPatients: any[] }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // New patient form state
    const [newPatient, setNewPatient] = useState({
        nombre: '',
        apellidos: '',
        email: '',
        telefono: '',
        fechaNacimiento: '',
    });

    // We map real patients to the expected format if needed, 
    // or just display them as is.
    const mappedPatients = initialPatients.map(p => ({
        id: p.id,
        name: `${p.nombre} ${p.apellidos || ''}`.trim(),
        age: p.fecha_nacimiento ? Math.floor((new Date().getTime() - new Date(p.fecha_nacimiento).getTime()) / 31557600000) : 'N/A', // approximate age
        phenotype: 'Evaluación Pendiente', // Can be updated if we join with metabolic_metrics
        lastVisit: new Date(p.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'Estable'
    }));

    const filteredPatients = mappedPatients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreatePatient = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const formData = {
                nombre: newPatient.nombre,
                apellidos: newPatient.apellidos,
                email: newPatient.email,
                telefono: newPatient.telefono,
                fechaNacimiento: newPatient.fechaNacimiento,
            };
            const result = await createPatientAction(formData);

            if (result.success) {
                toast.success('✅ Expediente creado con éxito. Ya aparece en la lista.');
                setIsModalOpen(false);
                setNewPatient({
                    nombre: '',
                    apellidos: '',
                    email: '',
                    telefono: '',
                    fechaNacimiento: '',
                });
                // Refresh the Server Component data so the new patient appears immediately
                router.refresh();
            } else {
                toast.error(result.error || 'Oops! Hubo un problema al crear el expediente.');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Error inesperado al crear el paciente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Directorio de Pacientes</h2>
                    <p className="text-slate-500">Gestiona y monitoriza a tus pacientes activos.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 text-white">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Nuevo Paciente
                </Button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    type="text"
                    placeholder="Buscar por nombre o ID..."
                    className="pl-10 border-slate-300 focus-visible:ring-primary w-full md:max-w-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Patient List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                            <tr>
                                <th className="px-6 py-4">Paciente</th>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Fenotipo Principal</th>
                                <th className="px-6 py-4">Última Visita</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPatients.map((patient) => (
                                <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-800">{patient.name}</div>
                                        <div className="text-slate-500 text-xs">{patient.age} años</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">{patient.id}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                            {patient.phenotype}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{patient.lastVisit}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${patient.status === 'Riesgo' ? 'bg-amber-100 text-amber-800' :
                                            patient.status === 'Mejorando' ? 'bg-blue-100 text-blue-800' :
                                                'bg-emerald-100 text-emerald-800'
                                            }`}>
                                            {patient.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/pacientes/${patient.id}`}>
                                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Ver Perfil
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {filteredPatients.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No se encontraron pacientes con ese criterio de búsqueda. {initialPatients.length === 0 && "Comienza añadiendo a tu primer paciente."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal "Nuevo Paciente" */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div>
                                <h3 className="text-xl font-semibold text-slate-800">Registrar Nuevo Paciente</h3>
                                <p className="text-sm text-slate-500 mt-1">Ingresa los datos básicos para crear su expediente.</p>
                            </div>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 rounded-full" onClick={() => setIsModalOpen(false)} disabled={isLoading}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <form onSubmit={handleCreatePatient} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="nombre" required
                                        value={newPatient.nombre} onChange={e => setNewPatient({ ...newPatient, nombre: e.target.value })}
                                        className="border-slate-300 focus-visible:ring-primary"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="apellidos">Apellidos</Label>
                                    <Input
                                        id="apellidos"
                                        value={newPatient.apellidos} onChange={e => setNewPatient({ ...newPatient, apellidos: e.target.value })}
                                        className="border-slate-300 focus-visible:ring-primary"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="email">Correo Electrónico (Opcional)</Label>
                                    <Input
                                        id="email" type="email" placeholder="paciente@correo.com"
                                        value={newPatient.email} onChange={e => setNewPatient({ ...newPatient, email: e.target.value })}
                                        className="border-slate-300 focus-visible:ring-primary"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="telefono">Teléfono</Label>
                                    <Input
                                        id="telefono" type="tel"
                                        value={newPatient.telefono} onChange={e => setNewPatient({ ...newPatient, telefono: e.target.value })}
                                        className="border-slate-300 focus-visible:ring-primary"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                                    <Input
                                        id="fechaNacimiento" type="date"
                                        value={newPatient.fechaNacimiento} onChange={e => setNewPatient({ ...newPatient, fechaNacimiento: e.target.value })}
                                        className="border-slate-300 focus-visible:ring-primary"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-slate-300 text-slate-700" disabled={isLoading}>
                                    Cancelar
                                </Button>
                                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
                                    {isLoading ? 'Creando...' : (
                                        <>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Crear Expediente
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
