import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { auth } from '@/auth';

export async function GET(request, { params }) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();
  const { id } = await params;
  const product = await Product.findById(id).lean();

  if (!product) {
    return Response.json({ success: false, error: 'Product not found' }, { status: 404 });
  }

  return Response.json({ success: true, product: JSON.parse(JSON.stringify(product)) });
}

export async function PUT(request, { params }) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const product = await Product.findByIdAndUpdate(id, body, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!product) {
      return Response.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return Response.json({ success: true, product });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const { id } = await params;

    const product = await Product.findByIdAndUpdate(id, { isActive: false }, { returnDocument: 'after' });

    if (!product) {
      return Response.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return Response.json({ success: true, message: 'Product deactivated' });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}