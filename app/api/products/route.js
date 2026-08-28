import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const product = await Product.create(body);

    return Response.json({ success: true, product }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({ isActive: true })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    return Response.json({ success: true, products });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}