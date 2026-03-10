// Lista de instâncias Invidious públicas (fallback automático)
const INVIDIOUS_INSTANCES = [
  'https://invidious.kavin.rocks',
  'https://vid.puffyan.us',
  'https://yt.artemislena.eu',
  'https://invidious.nerdvpn.de',
  'https://invidious.lunar.icu',
];

export async function fetchInvidious(path, options = {}) {
  const errors = [];
  for (const base of INVIDIOUS_INSTANCES) {
    try {
      const url = `${base}${path}`;
      const res = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'Mozilla/5.0',
          ...(options.headers || {}),
        },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return { data, instance: base };
    } catch (e) {
      errors.push(`${base}: ${e.message}`);
    }
  }
  throw new Error('All instances failed: ' + errors.join(' | '));
}

export function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatViews(views) {
  if (!views) return '0';
  if (views >= 1_000_000_000) return (views / 1_000_000_000).toFixed(1) + 'B';
  if (views >= 1_000_000) return (views / 1_000_000).toFixed(1) + 'M';
  if (views >= 1_000) return (views / 1_000).toFixed(1) + 'K';
  return String(views);
}

export function getBestThumbnail(thumbnails) {
  if (!thumbnails || !thumbnails.length) return '/placeholder.jpg';
  const preferred = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault'];
  for (const q of preferred) {
    const found = thumbnails.find(t => t.quality === q);
    if (found) return found.url;
  }
  return thumbnails[thumbnails.length - 1]?.url || '/placeholder.jpg';
}
