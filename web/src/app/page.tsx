import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Axioma Metabolic Online</h1>
      <Link href="/login" style={{ color: 'blue', textDecoration: 'underline' }}>
        Ir a Login
      </Link>
    </main>
  );
}
