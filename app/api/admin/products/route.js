import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { auth } from '@/auth';

export async function POST(request) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const product = await Product.create(body);
    return Response.json({ success: true, product }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Number(searchParams.get('limit')) || 30;

    const filter = {};

    if (search) {
      const trimmed = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: trimmed, $options: 'i' } },
        { sku: { $regex: trimmed, $options: 'i' } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return Response.json({
      success: true,
      products: JSON.parse(JSON.stringify(products)),
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}