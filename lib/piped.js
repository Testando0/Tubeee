// ─── Piped API Instances (fallback automático) ─────────────────────────────
// Piped é o frontend alternativo mais estável do YouTube (open source)
// Docs: https://docs.piped.video/docs/api-documentation/
export const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi-libre.kavin.rocks',
  'https://pipedapi.adminforge.de',
  'https://api.piped.yt',
  'https://pipedapi.nosebs.ru',
  'https://piped-api.privacy.com.de',
  'https://pipedapi.owo.si',
  'https://pipedapi.darkness.services',
  'https://pipedapi.drgns.space',
  'https://api.piped.private.coffee',
];

// ─── Player embed instances (sem anúncios) ─────────────────────────────────
export const PIPED_FRONTEND = [
  'https://piped.video',
  'https://piped.adminforge.de',
  'https://piped.yt',
];

export function getEmbedUrl(videoId, instanceIdx = 0) {
  const base = PIPED_FRONTEND[instanceIdx % PIPED_FRONTEND.length];
  return `${base}/embed/${videoId}?autoplay=1`;
}

// ─── Fetch com fallback automático ─────────────────────────────────────────
export async function fetchPiped(path) {
  const errors = [];
  for (const base of PIPED_INSTANCES) {
    try {
      const res = await fetch(`${base}${path}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RubiTube/1.0)' },
        signal: AbortSignal.timeout(9000),
        next: { revalidate: 300 },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return { data, instance: base };
    } catch (e) {
      errors.push(`${base}: ${e.message}`);
    }
  }
  throw new Error(`Todas as instâncias falharam:\n${errors.join('\n')}`);
}

// ─── Helpers de formatação ──────────────────────────────────────────────────
export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatViews(views) {
  if (!views || views <= 0) return '0';
  if (views >= 1_000_000_000) return (views / 1_000_000_000).toFixed(1) + 'B';
  if (views >= 1_000_000) return (views / 1_000_000).toFixed(1) + 'M';
  if (views >= 1_000) return (views / 1_000).toFixed(1) + 'K';
  return String(views);
}

// Extrai videoId de URL como /watch?v=ID
export function extractId(url) {
  if (!url) return null;
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : null;
}

// Normaliza um item de busca/trending do Piped para formato padrão
export function normalizeItem(item) {
  const id = item.url ? extractId(item.url) : item.videoId;
  if (!id) return null;
  return {
    videoId: id,
    title: item.title || 'Sem título',
    thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
    author: item.uploaderName || item.uploader || 'Desconhecido',
    authorId: item.uploaderUrl || '',
    duration: item.duration || 0,
    views: item.views || item.viewCount || 0,
    publishedText: item.uploadedDate || item.publishedText || '',
    description: item.shortDescription || item.description || '',
  };
}

// Normaliza detalhes de vídeo do Piped
export function normalizeVideo(data, videoId) {
  return {
    videoId,
    title: data.title || 'Sem título',
    description: data.description || '',
    thumbnail: data.thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    author: data.uploader || 'Desconhecido',
    authorId: data.uploaderUrl || '',
    authorAvatar: data.uploaderAvatar || '',
    duration: data.duration || 0,
    views: data.views || 0,
    likes: data.likes || 0,
    publishedText: data.uploadDate || '',
    keywords: data.tags || [],
    relatedVideos: (data.relatedStreams || [])
      .filter(v => v.type === 'stream' || v.url)
      .map(normalizeItem)
      .filter(Boolean)
      .slice(0, 24),
  };
}
