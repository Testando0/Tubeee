import { fetchPiped, normalizeItem } from '../../lib/piped';

export default async function handler(req, res) {
  const { q, nextpage } = req.query;
  if (!q) return res.status(400).json({ error: 'Parâmetro q obrigatório' });

  try {
    let path = `/search?q=${encodeURIComponent(q)}&filter=videos`;
    if (nextpage) path += `&nextpage=${encodeURIComponent(nextpage)}`;

    const { data } = await fetchPiped(path);
    const items = (data.items || []).map(normalizeItem).filter(Boolean);

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({
      videos: items,
      nextpage: data.nextpage || null,
      query: q,
    });
  } catch (e) {
    console.error('[search]', e.message);
    return res.status(500).json({ error: e.message });
  }
}
