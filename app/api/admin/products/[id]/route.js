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
  const product = await Product.findById(id).populate('relatedProducts', 'name slug price images').lean();

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
    const { searchParams } = new URL(request.url);
    const hard = searchParams.get('hard') === 'true';

    if (hard) {
      // ⚠️ Order/Enrollment history වල reference එකක් තියෙනවද check කරනවා
      const Order = (await import('@/models/Order')).default;
      const orderCount = await Order.countDocuments({ 'items.product': id });

      if (orderCount > 0) {
        return Response.json(
          { success: false, error: `Cannot permanently delete — this product appears in ${orderCount} order(s). Use Deactivate instead.` },
          { status: 409 }
        );
      }

      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        return Response.json({ success: false, error: 'Product not found' }, { status: 404 });
      }

      return Response.json({ success: true, message: 'Product permanently deleted' });
    }

    // Soft delete (existing behavior)
    const product = await Product.findByIdAndUpdate(id, { isActive: false }, { returnDocument: 'after' });
    if (!product) {
      return Response.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return Response.json({ success: true, message: 'Product deactivated' });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}