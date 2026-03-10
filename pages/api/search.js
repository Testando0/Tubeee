import { fetchInvidious } from '../../lib/invidious';

export default async function handler(req, res) {
  const { q, page = 1, type = 'video' } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });

  try {
    const fields = 'videoId,title,description,lengthSeconds,viewCount,author,authorId,publishedText,videoThumbnails,type';
    const path = `/api/v1/search?q=${encodeURIComponent(q)}&page=${page}&type=${type}&fields=${fields}`;
    const { data } = await fetchInvidious(path);

    // Filter only videos
    const videos = Array.isArray(data) ? data.filter(item => item.type === 'video' || item.videoId) : [];

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json({ videos, query: q, page: Number(page) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
