import { fetchInvidious } from '../../lib/invidious';

export default async function handler(req, res) {
  const { region = 'US', type = 'music' } = req.query;
  try {
    const path = `/api/v1/trending?region=${region}&type=${type}&fields=videoId,title,description,lengthSeconds,viewCount,author,authorId,publishedText,videoThumbnails`;
    const { data } = await fetchInvidious(path);
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate');
    return res.status(200).json({ videos: data || [] });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
