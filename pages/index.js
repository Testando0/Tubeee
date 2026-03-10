import { useState, useEffect } from 'react';
import Head from 'next/head';
import VideoCard from '../components/VideoCard';
import GridSkeleton from '../components/GridSkeleton';

const CATS = [
  { label: '🔥 Brasil',   region: 'BR' },
  { label: '🌍 Global',   region: 'US' },
  { label: '🇯🇵 Japão',   region: 'JP' },
  { label: '🇰🇷 Coreia',  region: 'KR' },
  { label: '🇬🇧 UK',      region: 'GB' },
];

export default function Home() {
  const [videos, setVideos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [cat, setCat]         = useState(0);

  const load = async (idx) => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/trending?region=${CATS[idx].region}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setVideos(data.videos || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(cat); }, [cat]);

  return (
    <>
      <Head><title>RubiTube — YouTube Sem Anúncios</title></Head>
      <main className="wrap">
        {/* Hero */}
        <div className="hero">
          <h1 className="hero__title">
            YouTube<br/>
            <span className="grad-text">sem anúncios.</span>
          </h1>
          <p className="hero__sub">Zero rastreamento. Zero interrupções. Só o conteúdo.</p>
        </div>

        {/* Category chips */}
        <div className="chips">
          {CATS.map((c, i) => (
            <button
              key={c.region}
              className={`chip${cat === i ? ' on' : ''}`}
              onClick={() => setCat(i)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <GridSkeleton count={12} />
        ) : error ? (
          <div className="error-state">
            <h2>Falha ao carregar</h2>
            <p style={{ fontSize: 12, color: 'var(--text3)', maxWidth: 480, margin: '8px auto' }}>{error}</p>
            <button className="retry-btn" onClick={() => load(cat)}>
              ↺ Tentar novamente
            </button>
          </div>
        ) : videos.length === 0 ? (
          <div className="empty-state">
            <h2>Nenhum vídeo</h2>
            <p>Tente outra região</p>
          </div>
        ) : (
          <div className="grid">
            {videos.map((v, i) => <VideoCard key={v.videoId} video={v} index={i} />)}
          </div>
        )}
      </main>
    </>
  );
}
