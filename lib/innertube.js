/**
 * RubiTube — InnerTube Client
 * Uses YouTube's own internal API (same one that youtube.com uses).
 * No external dependencies, no third-party instances, always online.
 */

const INNERTUBE_URL = 'https://www.youtube.com/youtubei/v1';
// Public API key baked into YouTube's web client (visible in any YT network request)
const API_KEY = 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';

const CLIENT_CTX = {
  client: {
    clientName: 'WEB',
    clientVersion: '2.20231121.08.00',
    hl: 'pt',
    gl: 'BR',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/119.0.0.0 Safari/537.36',
  },
};

async function post(endpoint, body) {
  const res = await fetch(`${INNERTUBE_URL}/${endpoint}?key=${API_KEY}&prettyPrint=false`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-YouTube-Client-Name': '1',
      'X-YouTube-Client-Version': '2.20231121.08.00',
      'Origin': 'https://www.youtube.com',
      'Referer': 'https://www.youtube.com/',
    },
    body: JSON.stringify({ context: CLIENT_CTX, ...body }),
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`InnerTube HTTP ${res.status}`);
  return res.json();
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function getText(obj) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj.runs?.map(r => r.text).join('') || obj.simpleText || '';
}

function getBestThumb(videoId) {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}

function parseVideoRenderer(vr) {
  if (!vr?.videoId) return null;
  return {
    videoId: vr.videoId,
    title: getText(vr.title),
    thumbnail: getBestThumb(vr.videoId),
    thumbnailHq: `https://i.ytimg.com/vi/${vr.videoId}/hqdefault.jpg`,
    author: getText(vr.ownerText || vr.shortBylineText || vr.longBylineText),
    authorId: vr.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || '',
    duration: getText(vr.lengthText) || '',
    durationSec: parseDur(getText(vr.lengthText)),
    views: getText(vr.viewCountText || vr.shortViewCountText) || '',
    publishedText: getText(vr.publishedTimeText) || '',
    description: vr.detailedMetadataSnippets?.[0]?.snippetText?.runs?.map(r => r.text).join('') || '',
  };
}

function parseDur(text) {
  if (!text) return 0;
  const parts = text.split(':').map(Number).reverse();
  return (parts[0] || 0) + (parts[1] || 0) * 60 + (parts[2] || 0) * 3600;
}

// ── Search ───────────────────────────────────────────────────────────────────
export async function searchVideos(query, continuation = null) {
  const body = continuation
    ? { continuation }
    : {
        query,
        params: 'EgIQAQ%3D%3D', // filter: videos only
      };

  const data = await post('search', body);

  let items = [];
  let nextContinuation = null;

  if (continuation) {
    // continuation response
    const cont = data?.onResponseReceivedCommands?.[0]
      ?.appendContinuationItemsAction?.continuationItems || [];
    items = cont;
    nextContinuation = cont.find(i => i.continuationItemRenderer)
      ?.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token || null;
  } else {
    const sections = data?.contents?.twoColumnSearchResultsRenderer
      ?.primaryContents?.sectionListRenderer?.contents || [];
    for (const s of sections) {
      const raw = s?.itemSectionRenderer?.contents || [];
      items.push(...raw);
      const contItem = s?.continuationItemRenderer;
      if (contItem) {
        nextContinuation = contItem.continuationEndpoint?.continuationCommand?.token || null;
      }
    }
    // also check itemSection continuations
    const contSection = sections.find(s => s?.continuationItemRenderer);
    if (contSection && !nextContinuation) {
      nextContinuation = contSection.continuationItemRenderer
        ?.continuationEndpoint?.continuationCommand?.token || null;
    }
  }

  const videos = items
    .map(i => parseVideoRenderer(i?.videoRenderer))
    .filter(Boolean);

  return { videos, nextContinuation };
}

// ── Trending ─────────────────────────────────────────────────────────────────
export async function getTrending(tabIndex = 0) {
  // tabIndex: 0=Now, 1=Music, 2=Gaming, 3=Movies
  const data = await post('browse', { browseId: 'FEtrending' });

  const tabs = data?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
  const tab = tabs[tabIndex] || tabs[0];
  const sections = tab?.tabRenderer?.content?.sectionListRenderer?.contents || [];

  const videos = [];
  for (const section of sections) {
    // Direct items
    const directItems = section?.itemSectionRenderer?.contents || [];
    for (const item of directItems) {
      const parsed = parseVideoRenderer(item?.videoRenderer);
      if (parsed) videos.push(parsed);
    }
    // Shelf items
    const shelfItems = section?.shelfRenderer?.content?.expandedShelfContentsRenderer?.items || [];
    for (const item of shelfItems) {
      const parsed = parseVideoRenderer(item?.videoRenderer);
      if (parsed) videos.push(parsed);
    }
    // Rich grid items
    const richItems = section?.richGridRenderer?.contents || [];
    for (const item of richItems) {
      const vr = item?.richItemRenderer?.content?.videoRenderer;
      const parsed = parseVideoRenderer(vr);
      if (parsed) videos.push(parsed);
    }
  }
  return videos;
}

// ── Related + Channel info ───────────────────────────────────────────────────
export async function getVideoNext(videoId) {
  const data = await post('next', { videoId });

  const related = [];
  const results = data?.contents?.twoColumnWatchNextResults?.secondaryResults
    ?.secondaryResults?.results || [];

  for (const item of results) {
    const vr = item?.compactVideoRenderer;
    if (!vr?.videoId) continue;
    related.push({
      videoId: vr.videoId,
      title: getText(vr.title),
      thumbnail: getBestThumb(vr.videoId),
      author: getText(vr.shortBylineText || vr.longBylineText),
      duration: getText(vr.lengthText) || '',
      durationSec: parseDur(getText(vr.lengthText)),
      views: getText(vr.viewCountText || vr.shortViewCountText) || '',
      publishedText: getText(vr.publishedTimeText) || '',
    });
  }

  // Channel avatar from primary info
  const primary = data?.contents?.twoColumnWatchNextResults?.results?.results?.contents || [];
  let authorAvatar = '';
  for (const c of primary) {
    const owner = c?.videoSecondaryInfoRenderer?.owner?.videoOwnerRenderer;
    if (owner) {
      const thumbs = owner.thumbnail?.thumbnails || [];
      authorAvatar = thumbs[thumbs.length - 1]?.url || '';
      break;
    }
  }

  return { related, authorAvatar };
}

// ── Video details (oEmbed — always free, no key) ─────────────────────────────
export async function getVideoDetails(videoId) {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`oEmbed HTTP ${res.status}`);
  const d = await res.json();
  return {
    title: d.title || '',
    author: d.author_name || '',
    authorUrl: d.author_url || '',
    thumbnail: getBestThumb(videoId),
    thumbnailHq: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  };
}

// ── Format helpers (re-exported for use in components) ───────────────────────
export function formatViews(str) {
  if (!str) return '';
  // Already formatted strings like "1,2 mi de visualizações"
  return str.replace(' de visualizações', '').replace(' visualizações', '');
}

export function formatDuration(sec) {
  if (!sec) return '';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${m}:${String(s).padStart(2,'0')}`;
}
