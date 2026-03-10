import { fetchPiped, normalizeItem } from '../../lib/piped';

export default async function handler(req, res) {
  const { region = 'BR' } = req.query;

  try {
    const { data } = await fetchPiped(`/trending?region=${region}`);
    const videos = Array.isArray(data)
      ? data.map(normalizeItem).filter(Boolean)
      : [];

    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
    return res.status(200).json({ videos });
  } catch (e) {
    console.error('[trending]', e.message);
    return res.status(500).json({ error: e.message });
  }
}
