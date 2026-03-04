import Link from 'next/link';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-24">
            <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 flex flex-col items-center gap-6">
                <h1 className="text-2xl font-bold text-slate-900">Acceso Profesional</h1>
                <p className="text-slate-500 text-center text-sm">Inicia sesión para acceder al panel de control de Axioma Metabolic.</p>

                <Link
                    href="/pacientes"
                    className="w-full bg-primary text-primary-foreground text-center px-4 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    Simular Login
                </Link>
                <Link
                    href="/"
                    className="text-sm text-slate-500 hover:text-slate-900"
                >
                    Volver al inicio
                </Link>
            </div>
        </div>
    );
}
