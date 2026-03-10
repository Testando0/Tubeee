import Head from 'next/head';
import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <Head><title>404 — freeTube</title></Head>
      <div style={{ textAlign: 'center', padding: '120px 20px' }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>📺</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Página não encontrada</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>O endereço que você procura não existe.</p>
        <Link href="/" style={{
          background: 'var(--accent)', color: '#fff',
          padding: '12px 28px', borderRadius: 8,
          fontWeight: 600, fontSize: 14, display: 'inline-block',
        }}>
          Voltar ao início
        </Link>
      </div>
    </>
  );
}
