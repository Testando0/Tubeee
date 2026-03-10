import { useRouter } from 'next/router';

export default function VideoCard({ video, index = 0 }) {
  const router = useRouter();
  if (!video?.videoId) return null;

  const go = () => router.push(`/watch/${video.videoId}`);
  const delay = `${Math.min(index * 0.045, 0.65)}s`;

  return (
    <article
      className="card"
      style={{ animationDelay: delay }}
      onClick={go}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && go()}
      tabIndex={0}
      role="button"
      aria-label={`${video.title} — ${video.author}`}
    >
      {/* Thumbnail */}
      <div className="card__img">
        <img
          src={video.thumbnail}
          alt=""
          loading="lazy"
          decoding="async"
          onError={e => {
            e.target.onerror = null;
            e.target.src = `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`;
          }}
        />
        <div className="card__play-wrap" aria-hidden="true">
          <div className="card__play">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        {video.duration && (
          <span className="card__dur" aria-label={`Duração: ${video.duration}`}>
            {video.duration}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="card__body">
        <p className="card__title">{video.title}</p>
        <p className="card__ch">{video.author}</p>
        <p className="card__meta">
          {[video.views, video.publishedText].filter(Boolean).join(' · ')}
        </p>
      </div>
    </article>
  );
}
