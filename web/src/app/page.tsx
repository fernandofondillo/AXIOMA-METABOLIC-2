import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col gap-6">
        <h1 className="text-4xl font-bold text-slate-900">Axioma Metabolic</h1>
        <p className="text-lg text-slate-600 mb-8">Bienvenido al sistema de seguimiento metabólico.</p>

        <Link
          href="/pacientes"
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Entrar al Dashboard
        </Link>
      </div>
    </main>
  );
}
