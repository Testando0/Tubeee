import { fetchPiped, normalizeVideo } from '../../../lib/piped';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID obrigatório' });

  try {
    const { data } = await fetchPiped(`/streams/${id}`);
    const video = normalizeVideo(data, id);

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
    return res.status(200).json(video);
  } catch (e) {
    console.error('[video]', e.message);
    return res.status(500).json({ error: e.message });
  }
}
