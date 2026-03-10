import { useRouter } from 'next/router';
import { formatDuration, formatViews, getBestThumbnail } from '../lib/invidious';

export default function VideoCard({ video, index = 0 }) {
  const router = useRouter();
  if (!video) return null;

  const thumb = getBestThumbnail(video.videoThumbnails);
  const duration = formatDuration(video.lengthSeconds);
  const views = formatViews(video.viewCount);

  return (
    <div
      className="video-card"
      style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
      onClick={() => router.push(`/watch/${video.videoId}`)}
    >
      <div className="video-card__thumb">
        <img
          src={thumb}
          alt={video.title}
          loading="lazy"
          onError={e => { e.target.src = `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`; }}
        />
        <div className="video-card__play-overlay">
          <div className="video-card__play-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        {video.lengthSeconds > 0 && (
          <span className="video-card__duration">{duration}</span>
        )}
      </div>
      <div className="video-card__body">
        <p className="video-card__title">{video.title}</p>
        <div className="video-card__meta">
          <span className="video-card__channel">{video.author}</span>
          <div className="video-card__stats">
            {video.viewCount > 0 && <span>{views} views</span>}
            {video.publishedText && <span>{video.publishedText}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
