import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { formatDuration, formatViews, getEmbedUrl } from '../../lib/piped';

// Skeleton components
function WatchSkeleton() {
  return (
    <div className="watch">
      <div>
        <div className="sk" style={{ aspectRatio: '16/9', borderRadius: 12 }} />
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="sk" style={{ height: 26, width: '75%', borderRadius: 6 }} />
          <div className="sk" style={{ height: 15, width: '45%', borderRadius: 5 }} />
          <div style={{ display: 'flex', gap: 12, paddingTop: 14 }}>
            <div className="sk" style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div className="sk" style={{ height: 14, width: '40%', borderRadius: 4 }} />
              <div className="sk" style={{ height: 11, width: '25%', borderRadius: 4 }} />
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: 9, background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div className="sk" style={{ width: 140, minWidth: 140, aspectRatio: '16/9', borderRadius: 6 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
              <div className="sk" style={{ height: 12, width: '90%', borderRadius: 4 }} />
              <div className="sk" style={{ height: 11, width: '60%', borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WatchPage() {
  const router = useRouter();
  const { id } = router.query;

  const [video,    setVideo]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [liked,    setLiked]    = useState(false);
  const [embedIdx, setEmbedIdx] = useState(0);
  const [embedErr, setEmbedErr] = useState(false);

  const load = useCallback(async (videoId) => {
    setLoading(true);
    setError(null);
    setVideo(null);
    setExpanded(false);
    setEmbedErr(false);
    setEmbedIdx(0);
    try {
      const res  = await fetch(`/api/video/${videoId}`);
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

  const handleEmbedErr = () => {
    const frontends = ['https://piped.video', 'https://piped.adminforge.de', 'https://piped.yt'];
    if (embedIdx < frontends.length - 1) {
      setEmbedIdx(prev => prev + 1);
    } else {
      setEmbedErr(true);
    }
  };

  if (!id) return null;

  const embedUrl = id ? getEmbedUrl(id, embedIdx) : '';

  return (
    <>
      <Head>
        <title>{video ? `${video.title} — RubiTube` : 'RubiTube'}</title>
        {video && <meta name="description" content={video.description?.slice(0, 155)} />}
      </Head>

      <main className="wrap">
        {loading ? (
          <WatchSkeleton />
        ) : error ? (
          <div className="error-state" style={{ paddingTop: 80 }}>
            <h2>Vídeo indisponível</h2>
            <p style={{ fontSize: 12, maxWidth: 400, margin: '8px auto' }}>{error}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
              <button className="retry-btn" onClick={() => load(id)}>↺ Tentar novamente</button>
              <a
                href={`https://www.youtube.com/watch?v=${id}`}
                target="_blank" rel="noopener noreferrer"
                className="retry-btn" style={{ background: 'var(--bg4)', color: 'var(--text2)' }}
              >
                Abrir no YouTube
              </a>
            </div>
          </div>
        ) : (
          <div className="watch">
            {/* ── LEFT COLUMN ──────────────────────────── */}
            <div>
              {/* Player */}
              <div className="player">
                {embedErr ? (
                  <div className="player-fallback">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--ruby-bright)" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p>Player indisponível nesta instância</p>
                    <a
                      href={`https://www.youtube.com/watch?v=${id}`}
                      target="_blank" rel="noopener noreferrer"
                      className="open-yt"
                    >
                      Abrir no YouTube
                    </a>
                  </div>
                ) : (
                  <iframe
                    key={`${id}-${embedIdx}`}
                    src={embedUrl}
                    title={video?.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    onError={handleEmbedErr}
                  />
                )}
              </div>

              {/* Info */}
              {video && (
                <div className="vinfo">
                  <h1 className="vinfo__title">{video.title}</h1>

                  {/* Stats bar */}
                  <div className="vinfo__bar">
                    <span className="vinfo__views">{formatViews(video.views)} views</span>
                    {video.publishedText && (
                      <span className="vinfo__date">{video.publishedText}</span>
                    )}
                    {video.likes > 0 && (
                      <span className="vinfo__date">👍 {formatViews(video.likes)}</span>
                    )}
                    <button
                      className={`like-btn${liked ? ' liked' : ''}`}
                      onClick={() => setLiked(l => !l)}
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
                        className="ch-avatar"
                        src={video.authorAvatar}
                        alt={video.author}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="ch-avatar-placeholder">
                        {video.author?.[0]?.toUpperCase() || 'C'}
                      </div>
                    )}
                    <div>
                      <p className="ch-name">{video.author}</p>
                      <p className="ch-sub">Canal</p>
                    </div>
                  </div>

                  {/* Description */}
                  {video.description && (
                    <div className="desc-box">
                      <p
                        className="desc-text"
                        style={{
                          maxHeight: expanded ? 'none' : '4.8em',
                          overflow: expanded ? 'visible' : 'hidden',
                        }}
                      >
                        {video.description}
                      </p>
                      {video.description.length > 200 && (
                        <button className="desc-toggle" onClick={() => setExpanded(e => !e)}>
                          {expanded ? '▲ Mostrar menos' : '▼ Mostrar mais'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Stats grid */}
                  <div className="stats-grid">
                    {[
                      { label: 'Duração',       val: formatDuration(video.duration) || '—' },
                      { label: 'Visualizações', val: formatViews(video.views) },
                      { label: 'Likes',         val: video.likes ? formatViews(video.likes) : '—' },
                      { label: 'Publicado',     val: video.publishedText || '—' },
                    ].map(s => (
                      <div className="stat-box" key={s.label}>
                        <p className="stat-label">{s.label}</p>
                        <p className="stat-val">{s.val}</p>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  {video.keywords?.length > 0 && (
                    <div className="tags">
                      {video.keywords.slice(0, 12).map(tag => (
                        <Link
                          key={tag}
                          href={`/search?q=${encodeURIComponent(tag)}`}
                          className="tag"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN — Related ────────────────── */}
            <div>
              <p className="sec-label">Recomendados</p>
              {video?.relatedVideos?.length > 0 ? (
                <div className="related-list">
                  {video.relatedVideos.map((rv, i) => (
                    <div
                      key={`${rv.videoId}-${i}`}
                      className="rel"
                      style={{ animationDelay: `${Math.min(i * 0.04, 0.8)}s` }}
                      onClick={() => router.push(`/watch/${rv.videoId}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && router.push(`/watch/${rv.videoId}`)}
                    >
                      <div className="rel__thumb">
                        <img
                          src={rv.thumbnail}
                          alt=""
                          loading="lazy"
                          onError={e => {
                            e.target.onerror = null;
                            e.target.src = `https://i.ytimg.com/vi/${rv.videoId}/mqdefault.jpg`;
                          }}
                        />
                        {rv.duration > 0 && (
                          <span className="rel__dur">{formatDuration(rv.duration)}</span>
                        )}
                      </div>
                      <div className="rel__body">
                        <p className="rel__title">{rv.title}</p>
                        <p className="rel__ch">{rv.author}</p>
                        {rv.views > 0 && (
                          <p className="rel__views">{formatViews(rv.views)} views</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', paddingTop: 20 }}>
                  Sem recomendações
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
