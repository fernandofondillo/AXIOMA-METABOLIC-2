import { getPatientsAction } from '@/app/actions/patients';
import PatientListClient from './PatientListClient';

export default async function PatientListPage() {
    const { patients } = await getPatientsAction();

    return <PatientListClient initialPatients={patients || []} />;
}

