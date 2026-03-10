import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import VideoCard from '../components/VideoCard';

export default function SearchPage() {
  const router = useRouter();
  const { q } = router.query;

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const search = useCallback(async (query, pageNum, append = false) => {
    if (!query) return;
    if (!append) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=${pageNum}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const newVideos = data.videos || [];
      if (append) {
        setVideos(prev => [...prev, ...newVideos]);
      } else {
        setVideos(newVideos);
      }
      setHasMore(newVideos.length >= 10);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (q) {
      setPage(1);
      setHasMore(true);
      search(q, 1, false);
    }
  }, [q, search]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    search(q, nextPage, true);
  };

  return (
    <>
      <Head>
        <title>{q ? `"${q}" — freeTube` : 'Busca — freeTube'}</title>
      </Head>

      <div className="page-container" style={{ paddingTop: 24, paddingBottom: 48 }}>
        {/* Header */}
        <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
          {q ? (
            <>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Resultados para</p>
              <h1 style={{ fontSize: 22, fontWeight: 700 }}>"{q}"</h1>
              {!loading && videos.length > 0 && (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  {videos.length} vídeos encontrados
                </p>
              )}
            </>
          ) : (
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-muted)' }}>
              Digite algo para buscar
            </h1>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {Array.from({ length: 8 }).map((_, i) => (
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
            <h2>Erro na busca</h2>
            <p>{error}</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="empty-state">
            <h2>Nenhum resultado</h2>
            <p>Tente termos diferentes</p>
          </div>
        ) : (
          <>
            <div className="video-grid">
              {videos.map((video, i) => (
                <VideoCard key={`${video.videoId}-${i}`} video={video} index={i % 20} />
              ))}
            </div>

            {hasMore && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 36 }}>
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  style={{
                    background: loadingMore ? 'var(--bg-hover)' : 'var(--accent)',
                    color: '#fff',
                    padding: '11px 32px',
                    borderRadius: 8,
                    fontFamily: 'Outfit', fontSize: 14, fontWeight: 600,
                    transition: 'all 0.2s',
                    opacity: loadingMore ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  {loadingMore ? (
                    <>
                      <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                      Carregando...
                    </>
                  ) : 'Carregar mais'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
