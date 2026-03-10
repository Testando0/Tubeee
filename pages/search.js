import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import VideoCard from '../components/VideoCard';
import GridSkeleton from '../components/GridSkeleton';

export default function SearchPage() {
  const router = useRouter();
  const { q }  = router.query;

  const [videos,   setVideos]   = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [cont,     setCont]     = useState(null);
  const [loadMore, setLoadMore] = useState(false);
  const abort = useRef(null);

  const doSearch = useCallback(async (query, continuation, append) => {
    abort.current?.abort();
    abort.current = new AbortController();

    if (!append) setLoading(true); else setLoadMore(true);
    setError(null);

    try {
      let url = `/api/search?q=${encodeURIComponent(query)}`;
      if (continuation) url += `&continuation=${encodeURIComponent(continuation)}`;
      const res  = await fetch(url, { signal: abort.current.signal });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCont(data.nextContinuation || null);
      setVideos(prev => append ? [...prev, ...(data.videos||[])] : (data.videos||[]));
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message);
    } finally {
      setLoading(false);
      setLoadMore(false);
    }
  }, []);

  useEffect(() => {
    if (!q) return;
    setVideos([]); setCont(null);
    doSearch(q, null, false);
  }, [q, doSearch]);

  return (
    <>
      <Head>
        <title>{q ? `"${q}" — RubiTube` : 'Busca — RubiTube'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <main className="page" role="main">
        {/* Header */}
        <div className="s-hdr">
          {q ? (
            <>
              <p className="s-hdr__hint">Resultados para</p>
              <h1 className="s-hdr__query">"{q}"</h1>
              {!loading && videos.length > 0 && (
                <p className="s-hdr__count">{videos.length} vídeos encontrados</p>
              )}
            </>
          ) : (
            <h1 className="s-hdr__query" style={{ color: 'var(--text-700)' }}>
              Busque algo acima
            </h1>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <GridSkeleton n={10} />
        ) : error ? (
          <div className="state" role="alert">
            <h2>Erro na busca</h2>
            <p>{error}</p>
            <button className="btn-retry" onClick={() => doSearch(q, null, false)}>
              ↺ Tentar novamente
            </button>
          </div>
        ) : videos.length === 0 && q ? (
          <div className="state">
            <h2>Sem resultados</h2>
            <p>Tente termos diferentes</p>
          </div>
        ) : (
          <>
            <div className="grid" role="list">
              {videos.map((v, i) => (
                <div role="listitem" key={`${v.videoId}-${i}`}>
                  <VideoCard video={v} index={i % 20} />
                </div>
              ))}
            </div>

            {cont && (
              <div className="load-more">
                <button
                  className="btn-more"
                  onClick={() => doSearch(q, cont, true)}
                  disabled={loadMore}
                >
                  {loadMore ? (
                    <>
                      <span className="spinner" style={{ width:16,height:16,border:'2.5px solid rgba(255,255,255,.3)',borderTopColor:'#fff' }}/>
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
