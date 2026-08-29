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