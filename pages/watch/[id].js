import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { formatDuration, formatViews, getBestThumbnail } from '../../lib/invidious';

// Invidious instances for embed player
const EMBED_INSTANCES = [
  'https://invidious.kavin.rocks',
  'https://vid.puffyan.us',
  'https://invidious.lunar.icu',
];

export default function WatchPage() {
  const router = useRouter();
  const { id } = router.query;

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [embedInstance, setEmbedInstance] = useState(0);
  const [playerError, setPlayerError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setVideo(null);
    setDescExpanded(false);
    setPlayerError(false);

    fetch(`/api/video/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setVideo(data);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const embedSrc = `${EMBED_INSTANCES[embedInstance]}/embed/${id}?autoplay=1&modestbranding=1`;

  const handlePlayerError = () => {
    if (embedInstance < EMBED_INSTANCES.length - 1) {
      setEmbedInstance(prev => prev + 1);
    } else {
      setPlayerError(true);
    }
  };

  if (!id) return null;

  return (
    <>
      <Head>
        <title>{video ? `${video.title} — freeTube` : 'Carregando... — freeTube'}</title>
        {video && <meta name="description" content={video.description?.slice(0, 160)} />}
      </Head>

      <div className="page-container">
        <div className="watch-layout">
          {/* Left: Player + Info */}
          <div>
            {/* Player */}
            <div className="player-wrapper">
              {playerError ? (
                <div style={{
                  width: '100%', height: '100%',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  background: '#000', color: '#fff', gap: 12,
                }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ff3d3d" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p style={{ fontSize: 14, color: '#aaa' }}>Player indisponível</p>
                  <a
                    href={`https://www.youtube.com/watch?v=${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#ff3d3d', color: '#fff',
                      padding: '8px 20px', borderRadius: 6,
                      fontSize: 13, fontWeight: 600,
                    }}
                  >
                    Abrir no YouTube
                  </a>
                </div>
              ) : (
                <iframe
                  key={`${id}-${embedInstance}`}
                  src={embedSrc}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={video?.title || 'Video player'}
                  onError={handlePlayerError}
                />
              )}
            </div>

            {/* Video info skeleton */}
            {loading && (
              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="skeleton" style={{ height: 28, width: '80%', borderRadius: 6 }} />
                <div className="skeleton" style={{ height: 16, width: '40%', borderRadius: 6 }} />
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                  <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="skeleton" style={{ height: 14, width: '40%', borderRadius: 4 }} />
                    <div className="skeleton" style={{ height: 12, width: '25%', borderRadius: 4 }} />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="error-state" style={{ padding: 40 }}>
                <h2>Erro ao carregar vídeo</h2>
                <p>{error}</p>
              </div>
            )}

            {video && (
              <div className="video-info fade-in">
                <h1 className="video-info__title">{video.title}</h1>

                <div className="video-info__stats">
                  <span className="video-info__views">
                    {formatViews(video.viewCount)} visualizações
                  </span>
                  {video.publishedText && (
                    <span className="video-info__date">{video.publishedText}</span>
                  )}
                  {video.likeCount > 0 && (
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      👍 {formatViews(video.likeCount)}
                    </span>
                  )}
                  <button
                    className="like-btn"
                    onClick={() => setLiked(l => !l)}
                    style={liked ? { background: 'rgba(255,61,61,0.15)', color: 'var(--accent)', borderColor: 'rgba(255,61,61,0.4)' } : {}}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/>
                      <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
                    </svg>
                    {liked ? 'Curtido' : 'Curtir'}
                  </button>
                </div>

                {/* Channel */}
                <div className="channel-info">
                  {video.authorThumbnails?.length > 0 ? (
                    <img
                      className="channel-info__avatar"
                      src={video.authorThumbnails[video.authorThumbnails.length - 1]?.url}
                      alt={video.author}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="channel-info__avatar" style={{ background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>
                      {video.author?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="channel-info__name">{video.author}</p>
                    {video.authorId && (
                      <p className="channel-info__sub">Canal verificado</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                {video.description && (
                  <div className="description-box">
                    <p style={{
                      maxHeight: descExpanded ? 'none' : '80px',
                      overflow: descExpanded ? 'visible' : 'hidden',
                    }}>
                      {video.description}
                    </p>
                    {video.description.length > 200 && (
                      <button className="description-toggle" onClick={() => setDescExpanded(e => !e)}>
                        {descExpanded ? '▲ Mostrar menos' : '▼ Mostrar mais'}
                      </button>
                    )}
                  </div>
                )}

                {/* Keywords */}
                {video.keywords?.length > 0 && (
                  <div className="tags-list" style={{ marginTop: 14 }}>
                    {video.keywords.slice(0, 10).map(tag => (
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

                {/* Video metadata */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 10, marginTop: 18,
                }}>
                  {[
                    { label: 'Duração', value: formatDuration(video.lengthSeconds) },
                    { label: 'Visualizações', value: formatViews(video.viewCount) },
                    { label: 'Likes', value: video.likeCount ? formatViews(video.likeCount) : 'N/A' },
                    { label: 'Gênero', value: video.genre || 'Geral' },
                  ].map(item => (
                    <div key={item.label} style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 8, padding: '12px 14px',
                    }}>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                        {item.label}
                      </p>
                      <p style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Space Mono, monospace' }}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Related videos */}
          <div>
            <p className="section-title">Recomendados</p>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: 10, background: 'var(--bg-card)', borderRadius: 8 }}>
                    <div className="skeleton" style={{ width: 160, minWidth: 160, aspectRatio: '16/9', borderRadius: 6 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div className="skeleton" style={{ height: 13, width: '90%', borderRadius: 4 }} />
                      <div className="skeleton" style={{ height: 11, width: '60%', borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : video?.recommendedVideos?.length > 0 ? (
              <div className="related-list">
                {video.recommendedVideos.slice(0, 20).map((rv, i) => (
                  <div
                    key={`${rv.videoId}-${i}`}
                    className="related-card"
                    style={{ animationDelay: `${i * 0.04}s` }}
                    onClick={() => router.push(`/watch/${rv.videoId}`)}
                  >
                    <div className="related-card__thumb">
                      <img
                        src={getBestThumbnail(rv.videoThumbnails)}
                        alt={rv.title}
                        loading="lazy"
                        onError={e => { e.target.src = `https://i.ytimg.com/vi/${rv.videoId}/mqdefault.jpg`; }}
                      />
                      {rv.lengthSeconds > 0 && (
                        <span className="related-card__duration">{formatDuration(rv.lengthSeconds)}</span>
                      )}
                    </div>
                    <div className="related-card__body">
                      <p className="related-card__title">{rv.title}</p>
                      <p className="related-card__channel">{rv.author}</p>
                      {rv.viewCountText && (
                        <p className="related-card__views">{rv.viewCountText}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : !loading && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <p>Nenhum vídeo recomendado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
