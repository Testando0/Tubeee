import Head from 'next/head';
import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <Head><title>404 — RubiTube</title></Head>
      <div className="state" style={{ paddingTop: 100 }}>
        <div style={{ fontSize:56, marginBottom:16 }} aria-hidden="true">📺</div>
        <h2>Página não encontrada</h2>
        <p>O endereço que você procura não existe.</p>
        <Link href="/" className="btn-retry" style={{ display:'inline-flex', marginTop:20 }}>
          ← Início
        </Link>
      </div>
    </>
  );
}
