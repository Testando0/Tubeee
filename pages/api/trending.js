import { getTrending } from '../../lib/innertube';

export default async function handler(req, res) {
  const { tab = '0' } = req.query;
  try {
    const videos = await getTrending(Number(tab));
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
    return res.status(200).json({ videos });
  } catch (e) {
    console.error('[trending]', e.message);
    return res.status(500).json({ error: e.message });
  }
}
