import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

/* ── Skeleton ────────────────────────────────────────────────────── */
function WatchSkeleton() {
  const rel = Array.from({ length: 7 });
  return (
    <div className="watch-layout" aria-hidden="true">
      <div>
        <div className="sk" style={{ aspectRatio:'16/9', borderRadius:14, background:'var(--obs-800)' }}/>
        <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:10 }}>
          <div className="sk" style={{ height:22, width:'72%' }}/>
          <div className="sk" style={{ height:14, width:'45%' }}/>
          <div style={{ display:'flex', gap:12, paddingTop:14 }}>
            <div className="sk" style={{ width:42, height:42, borderRadius:'50%', flexShrink:0 }}/>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:7 }}>
              <div className="sk" style={{ height:13, width:'38%' }}/>
              <div className="sk" style={{ height:10, width:'24%' }}/>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {rel.map((_,i) => (
          <div key={i} style={{ display:'flex', gap:10, padding:10, background:'var(--obs-900)', borderRadius:9, border:'1px solid var(--border-subtle)' }}>
            <div className="sk" style={{ width:140, minWidth:140, aspectRatio:'16/9', borderRadius:7 }}/>
            <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap:6 }}>
              <div className="sk" style={{ height:11, width:'88%' }}/>
              <div className="sk" style={{ height:10, width:'55%' }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────── */
export default function WatchPage() {
  const router = useRouter();
  const { id } = router.query;

  const [video,    setVideo]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [liked,    setLiked]    = useState(false);
  const iframeRef = useRef(null);

  const load = useCallback(async (vid) => {
    setLoading(true); setError(null); setVideo(null); setExpanded(false);
    try {
      const res  = await fetch(`/api/video/${vid}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setVideo(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (id) load(id); }, [id, load]);

  // Keep audio alive on iOS — request wake lock
  useEffect(() => {
    if (!('wakeLock' in navigator)) return;
    let lock;
    navigator.wakeLock.request('screen').then(l => { lock = l; }).catch(() => {});
    return () => { lock?.release().catch(() => {}); };
  }, [id]);

  if (!id) return null;

  // youtube-nocookie.com — always available, privacy-enhanced, no external dependency
  const embedSrc = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;

  return (
    <>
      <Head>
        <title>{video ? `${video.title} — RubiTube` : 'RubiTube'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {video && <meta name="description" content={`${video.title} por ${video.author}`} />}
      </Head>

      <main className="page" role="main">
        {loading ? <WatchSkeleton /> : error ? (
          <div className="state" role="alert" style={{ paddingTop: 80 }}>
            <h2>Vídeo indisponível</h2>
            <p>{error}</p>
            <button className="btn-retry" onClick={() => load(id)}>↺ Tentar novamente</button>
          </div>
        ) : (
          <div className="watch-layout">
            {/* ── LEFT — Player + Info ─────────────────────── */}
            <div>
              {/* Player */}
              <div className="player-shell" role="region" aria-label="Player de vídeo">
                <iframe
                  ref={iframeRef}
                  src={embedSrc}
                  title={video?.title || 'Vídeo'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  loading="eager"
                />
              </div>

              {/* Info */}
              {video && (
                <section aria-label="Informações do vídeo">
                  <h1 className="vinfo__title" style={{ marginTop: 16 }}>{video.title}</h1>

                  {/* Stats bar */}
                  <div className="vinfo__row">
                    {video.views && <span className="vinfo__chip">{video.views}</span>}
                    {video.publishedText && <span className="vinfo__chip">{video.publishedText}</span>}
                    <button
                      className={`like-btn${liked ? ' liked' : ''}`}
                      onClick={() => setLiked(l => !l)}
                      aria-pressed={liked}
                      aria-label={liked ? 'Remover curtida' : 'Curtir vídeo'}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24"
                        fill={liked ? 'currentColor' : 'none'}
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/>
                        <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
                      </svg>
                      {liked ? 'Curtido' : 'Curtir'}
                    </button>
                  </div>

                  {/* Channel */}
                  <div className="ch-row">
                    {video.authorAvatar ? (
                      <img
                        className="ch-avi"
                        src={video.authorAvatar}
                        alt={video.author}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="ch-avi-ph" aria-hidden="true">
                        {video.author?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div>
                      <p className="ch-name">{video.author}</p>
                      <p className="ch-label">Canal</p>
                    </div>
                  </div>

                  {/* Description */}
                  {video.description && (
                    <div className="desc">
                      <p
                        className="desc__text"
                        style={{ maxHeight: expanded ? 'none' : '4.2em', overflow: expanded ? 'visible' : 'hidden' }}
                      >
                        {video.description}
                      </p>
                      {video.description.length > 180 && (
                        <button
                          className="desc__toggle"
                          onClick={() => setExpanded(e => !e)}
                          aria-expanded={expanded}
                        >
                          {expanded ? '▲ Mostrar menos' : '▼ Mostrar mais'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="stats-row">
                    {[
                      { label: 'Visualizações', val: video.views || '—' },
                      { label: 'Publicado',      val: video.publishedText || '—' },
                      { label: 'Canal',          val: video.author || '—' },
                      { label: 'Plataforma',     val: 'RubiTube' },
                    ].map(s => (
                      <div className="stat" key={s.label}>
                        <p className="stat__l">{s.label}</p>
                        <p className="stat__v"
                          style={{ fontSize: s.val.length > 14 ? 11 : 14, wordBreak:'break-word' }}>
                          {s.val}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* ── RIGHT — Related ──────────────────────────── */}
            <aside aria-label="Vídeos relacionados">
              <p className="sidebar-label">Recomendados</p>
              {(video?.related?.length || 0) === 0 ? (
                <p style={{ color:'var(--text-700)', fontSize:13, textAlign:'center', paddingTop:20 }}>
                  Nenhuma recomendação disponível
                </p>
              ) : (
                <div className="rel-list">
                  {video.related.map((r, i) => (
                    <div
                      key={`${r.videoId}-${i}`}
                      className="rel"
                      style={{ animationDelay:`${Math.min(i*.04,.8)}s` }}
                      onClick={() => router.push(`/watch/${r.videoId}`)}
                      onKeyDown={e => (e.key==='Enter'||e.key===' ') && router.push(`/watch/${r.videoId}`)}
                      tabIndex={0}
                      role="button"
                      aria-label={`${r.title} — ${r.author}`}
                    >
                      <div className="rel__thumb">
                        <img
                          src={`https://i.ytimg.com/vi/${r.videoId}/mqdefault.jpg`}
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                        {r.duration && <span className="rel__dur">{r.duration}</span>}
                      </div>
                      <div className="rel__body">
                        <p className="rel__title">{r.title}</p>
                        <p className="rel__ch">{r.author}</p>
                        {r.views && <p className="rel__views">{r.views}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>
        )}
      </main>
    </>
  );
}
