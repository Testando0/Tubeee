import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import VideoCard from '../components/VideoCard';
import GridSkeleton from '../components/GridSkeleton';

const TABS = [
  { label: '🔥 Agora',    tab: 0 },
  { label: '🎵 Música',   tab: 1 },
  { label: '🎮 Games',    tab: 2 },
  { label: '🎬 Filmes',   tab: 3 },
];

export default function Home() {
  const [videos,  setVideos]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [active,  setActive]  = useState(0);

  const load = useCallback(async (tabIdx) => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/trending?tab=${TABS[tabIdx].tab}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setVideos(data.videos || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(active); }, [active, load]);

  return (
    <>
      <Head>
        <title>RubiTube — Vídeos sem anúncios</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <main className="page" role="main">
        {/* Hero */}
        <section className="hero" aria-label="Bem-vindo">
          <div className="hero__eyebrow">
            <span className="hero__pill">
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', display:'inline-block' }}/>
              Sem anúncios
            </span>
          </div>
          <h1 className="hero__title">
            Seu streaming.
            <span className="hero__ruby">Sem interrupções.</span>
          </h1>
          <p className="hero__sub">Zero rastreamento · Zero propagandas · 100% conteúdo</p>
        </section>

        {/* Category tabs */}
        <div className="chips" role="tablist" aria-label="Categorias em alta">
          {TABS.map((t, i) => (
            <button
              key={t.tab}
              className={`chip${active === i ? ' on' : ''}`}
              onClick={() => setActive(i)}
              role="tab"
              aria-selected={active === i}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <GridSkeleton n={15} />
        ) : error ? (
          <div className="state" role="alert">
            <h2>Falha ao carregar</h2>
            <p>{error}</p>
            <button className="btn-retry" onClick={() => load(active)}>
              ↺ Tentar novamente
            </button>
          </div>
        ) : videos.length === 0 ? (
          <div className="state">
            <h2>Sem vídeos</h2>
            <p>Tente outra categoria</p>
          </div>
        ) : (
          <div className="grid" role="list">
            {videos.map((v, i) => (
              <div role="listitem" key={v.videoId}>
                <VideoCard video={v} index={i} />
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
