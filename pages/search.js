import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import VideoCard from '../components/VideoCard';
import GridSkeleton from '../components/GridSkeleton';

export default function SearchPage() {
  const router = useRouter();
  const { q }  = router.query;

  const [videos,  setVideos]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [nextpage, setNextpage] = useState(null);
  const [loadingMore, setLM]  = useState(false);
  const abortRef = useRef(null);

  const search = useCallback(async (query, np, append = false) => {
    if (!query) return;
    // Cancel previous request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    if (!append) setLoading(true);
    else setLM(true);
    setError(null);

    try {
      let url = `/api/search?q=${encodeURIComponent(query)}`;
      if (np) url += `&nextpage=${encodeURIComponent(np)}`;

      const res  = await fetch(url, { signal: abortRef.current.signal });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setNextpage(data.nextpage || null);
      if (append) setVideos(prev => [...prev, ...(data.videos || [])]);
      else        setVideos(data.videos || []);
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message);
    } finally {
      setLoading(false);
      setLM(false);
    }
  }, []);

  useEffect(() => {
    if (q) {
      setVideos([]);
      setNextpage(null);
      search(q, null, false);
    }
  }, [q, search]);

  const loadMore = () => search(q, nextpage, true);

  const title = q ? `"${q}" — RubiTube` : 'Busca — RubiTube';

  return (
    <>
      <Head><title>{title}</title></Head>
      <main className="wrap">
        {/* Header */}
        <div className="search-hdr">
          {q ? (
            <>
              <p className="search-hdr__hint">Resultados para</p>
              <h1 className="search-hdr__q">"{q}"</h1>
              {!loading && videos.length > 0 && (
                <p className="search-hdr__count">{videos.length} vídeos</p>
              )}
            </>
          ) : (
            <h1 className="search-hdr__q" style={{ color: 'var(--text2)' }}>
              Digite algo para buscar
            </h1>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <GridSkeleton count={10} />
        ) : error ? (
          <div className="error-state">
            <h2>Erro na busca</h2>
            <p style={{ fontSize: 12, maxWidth: 480, margin: '8px auto' }}>{error}</p>
            <button className="retry-btn" onClick={() => search(q, null, false)}>
              ↺ Tentar novamente
            </button>
          </div>
        ) : videos.length === 0 && q ? (
          <div className="empty-state">
            <h2>Nenhum resultado</h2>
            <p>Tente outros termos de busca</p>
          </div>
        ) : (
          <>
            <div className="grid">
              {videos.map((v, i) => <VideoCard key={`${v.videoId}-${i}`} video={v} index={i % 20} />)}
            </div>

            {nextpage && (
              <div className="load-more-wrap">
                <button className="load-more" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? (
                    <>
                      <div style={{
                        width: 15, height: 15,
                        border: '2px solid rgba(255,255,255,.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin .7s linear infinite',
                      }}/>
                      Carregando...
                    </>
                  ) : 'Carregar mais'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
