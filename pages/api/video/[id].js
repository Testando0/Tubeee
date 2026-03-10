import { getVideoDetails, getVideoNext } from '../../../lib/innertube';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id required' });
  try {
    // Run both in parallel for speed
    const [details, next] = await Promise.all([
      getVideoDetails(id),
      getVideoNext(id).catch(() => ({ related: [], authorAvatar: '' })),
    ]);
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
    return res.status(200).json({
      videoId: id,
      ...details,
      authorAvatar: next.authorAvatar,
      related: next.related,
    });
  } catch (e) {
    console.error('[video]', e.message);
    return res.status(500).json({ error: e.message });
  }
}
