import { fetchInvidious } from '../../../lib/invidious';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing video id' });

  try {
    const path = `/api/v1/videos/${id}?fields=videoId,title,description,lengthSeconds,viewCount,likeCount,author,authorId,authorThumbnails,publishedText,videoThumbnails,recommendedVideos,keywords,genre`;
    const { data } = await fetchInvidious(path);

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
