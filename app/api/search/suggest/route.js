import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const category = searchParams.get('category');

    const trimmedQ = q?.trim() || '';
    if (trimmedQ.length < 2) {
      return Response.json({ suggestions: [] });
    }

    await connectDB();

    let filter = { isActive: true };

    const searchWords = trimmedQ.split(' ').filter(w => w.length > 0);
    const wordRegexes = searchWords.map(word => new RegExp(word, 'i'));

    filter.$or = [
      { name: { $regex: new RegExp(trimmedQ, 'i') } },
      ...wordRegexes.map(regex => ({ name: { $regex: regex } })),
      { sku: { $regex: new RegExp(trimmedQ, 'i') } },
      { description: { $regex: new RegExp(trimmedQ, 'i') } },
      { keywords: { $regex: new RegExp(trimmedQ, 'i') } }
    ];

    if (category) {
      const Category = await import('@/models/Category');
      const cat = await Category.default.findOne({ slug: category }).lean();
      if (cat) {
        filter.category = cat._id;
      }
    }

    // Fetch a larger pool, then rank + filter in JS for relevance
    const candidates = await Product.find(filter)
      .select('name price images category sku description keywords')
      .populate('category', 'name')
      .limit(30)
      .lean();

    const q_lower = trimmedQ.toLowerCase();
    const words_lower = searchWords.map(w => w.toLowerCase());

    function scoreProduct(p) {
      const name = (p.name || '').toLowerCase();
      const sku = (p.sku || '').toLowerCase();

      if (name === q_lower) return 100;
      if (name.startsWith(q_lower)) return 90;
      if (name.includes(q_lower)) return 80;
      if (words_lower.length > 0 && words_lower.every(w => name.includes(w))) return 60;
      if (words_lower.some(w => name.includes(w))) return 40;
      if (sku.includes(q_lower)) return 30;

      return 0; // description/keywords-only match = not relevant enough to show
    }

    const ranked = candidates
      .map(p => ({ p, s: scoreProduct(p) }))
      .filter(({ s }) => s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 8)
      .map(({ p }) => p);

    return Response.json({
      suggestions: ranked.map(p => ({
        _id: p._id,
        name: p.name,
        price: p.price,
        image: p.images?.[0] || null,
        category: p.category?.name || null
      }))
    });
  } catch (error) {
    console.error('Suggest API error:', error);
    return Response.json({ suggestions: [], error: 'Failed to fetch suggestions' });
  }
}