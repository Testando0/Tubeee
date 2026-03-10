import { useState, useEffect } from 'react';
import Head from 'next/head';
import VideoCard from '../components/VideoCard';

const CATEGORIES = [
  { label: 'Música', type: 'music' },
  { label: 'Jogos', type: 'gaming' },
  { label: 'Filmes', type: 'movies' },
  { label: 'Tecnologia', type: 'default' },
];

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(0);

  const loadTrending = async (idx) => {
    setLoading(true);
    setError(null);
    try {
      const { type } = CATEGORIES[idx];
      const res = await fetch(`/api/trending?type=${type}&region=BR`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setVideos(data.videos || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTrending(activeCategory); }, [activeCategory]);

  return (
    <>
      <Head>
        <title>freeTube — Sem anúncios</title>
      </Head>

      <div className="page-container" style={{ paddingTop: 28 }}>
        {/* Hero */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontSize: 'clamp(24px, 4vw, 38px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
            marginBottom: 8,
            background: 'linear-gradient(135deg, #f0f0f5 0%, #888899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Assista YouTube
            <br/>
            <span style={{ background: 'linear-gradient(135deg, #ff3d3d, #ff7043)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              sem interrupções.
            </span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Nenhum anúncio. Nenhum rastreamento. Só o conteúdo.
          </p>
        </div>

        {/* Categories */}
        <div className="chips-row">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.type}
              className={`chip ${activeCategory === i ? 'active' : ''}`}
              onClick={() => setActiveCategory(i)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, paddingBottom: 48 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div className="skeleton" style={{ aspectRatio: '16/9' }} />
                <div style={{ padding: '12px 14px', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="skeleton" style={{ height: 14, width: '90%' }} />
                  <div className="skeleton" style={{ height: 12, width: '60%' }} />
                  <div className="skeleton" style={{ height: 11, width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="error-state">
            <h2>Erro ao carregar vídeos</h2>
            <p style={{ marginBottom: 18 }}>{error}</p>
            <button
              onClick={() => loadTrending(activeCategory)}
              style={{
                background: 'var(--accent)', color: '#fff',
                padding: '10px 24px', borderRadius: 8, fontFamily: 'Outfit', fontSize: 14, fontWeight: 600,
              }}
            >Tentar novamente</button>
          </div>
        ) : videos.length === 0 ? (
          <div className="empty-state">
            <h2>Nenhum vídeo encontrado</h2>
            <p>Tente outra categoria</p>
          </div>
        ) : (
          <div className="video-grid" style={{ paddingBottom: 48 }}>
            {videos.map((video, i) => (
              <VideoCard key={video.videoId} video={video} index={i} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
