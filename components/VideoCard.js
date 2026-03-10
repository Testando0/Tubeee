import { useRouter } from 'next/router';
import { formatDuration, formatViews } from '../lib/piped';

export default function VideoCard({ video, index = 0 }) {
  const router = useRouter();
  if (!video?.videoId) return null;

  const delay = Math.min(index * 0.04, 0.6);

  return (
    <div
      className="card"
      style={{ animationDelay: `${delay}s` }}
      onClick={() => router.push(`/watch/${video.videoId}`)}
      tabIndex={0}
      role="button"
      aria-label={video.title}
      onKeyDown={e => e.key === 'Enter' && router.push(`/watch/${video.videoId}`)}
    >
      {/* Thumbnail */}
      <div className="card__thumb">
        <img
          src={video.thumbnail}
          alt=""
          loading="lazy"
          onError={e => {
            e.target.onerror = null;
            e.target.src = `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`;
          }}
        />
        <div className="card__overlay">
          <div className="card__play">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        {video.duration > 0 && (
          <span className="card__dur">{formatDuration(video.duration)}</span>
        )}
      </div>

      {/* Body */}
      <div className="card__body">
        <p className="card__title">{video.title}</p>
        <p className="card__ch">{video.author}</p>
        <div className="card__meta">
          {video.views > 0 && <span>{formatViews(video.views)} views</span>}
          {video.publishedText && <span>· {video.publishedText}</span>}
        </div>
      </div>
    </div>
  );
}
