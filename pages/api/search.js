import { searchVideos } from '../../lib/innertube';

export default async function handler(req, res) {
  const { q, continuation } = req.query;
  if (!q) return res.status(400).json({ error: 'q required' });
  try {
    const result = await searchVideos(q, continuation || null);
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(result);
  } catch (e) {
    console.error('[search]', e.message);
    return res.status(500).json({ error: e.message });
  }
}
