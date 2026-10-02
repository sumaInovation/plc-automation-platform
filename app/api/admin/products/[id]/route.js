import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { auth } from '@/auth';

function handleError(error) {
  // Duplicate slug / sku
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'field';
    return Response.json(
      { success: false, error: `A product with this ${field} already exists` },
      { status: 409 }
    );
  }
  // Invalid ObjectId
  if (error.name === 'CastError') {
    return Response.json({ success: false, error: 'Invalid ID or value' }, { status: 400 });
  }
  // Mongoose validation errors
  if (error.name === 'ValidationError') {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
  return Response.json({ success: false, error: error.message }, { status: 500 });
}

export async function GET(request, { params }) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const { id } = await params;
    const product = await Product.findById(id)
      .populate('relatedProducts', 'name slug sku price images')
      .lean();

    if (!product) {
      return Response.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return Response.json({ success: true, product: JSON.parse(JSON.stringify(product)) });
  } catch (error) {
    return handleError(error);
  }
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

    // Allowed fields witharak (avgRating, reviewCount wage ewa client eken wenas karanna බෑ)
    const allowed = [
      'name',
      'slug',
      'sku',
      'category',
      'description',
      'price',
      'stock_qty',
      'brand',
      'images',
      'specs',
      'isActive',
    ];

    const $set = {};
    const $unset = {};

    for (const key of allowed) {
      if (body[key] !== undefined) $set[key] = body[key];
    }

    // compareAtPrice: null / '' nam DB eken ain karanawa
    if (body.compareAtPrice === null || body.compareAtPrice === '') {
      $unset.compareAtPrice = 1;
    } else if (body.compareAtPrice !== undefined) {
      $set.compareAtPrice = body.compareAtPrice;
    }

    // relatedProducts: product eka ekatama related wenna බෑ, duplicates ain karanawa
    if (Array.isArray(body.relatedProducts)) {
      $set.relatedProducts = [
        ...new Set(body.relatedProducts.map(String).filter((rid) => rid !== String(id))),
      ];
    }

    const update = {};
    if (Object.keys($set).length) update.$set = $set;
    if (Object.keys($unset).length) update.$unset = $unset;

    const product = await Product.findByIdAndUpdate(id, update, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!product) {
      return Response.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return Response.json({ success: true, product });
  } catch (error) {
    return handleError(error);
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
      // ⚠️ Order history wala reference ekak thiyenawada check karanawa
      const Order = (await import('@/models/Order')).default;
      const orderCount = await Order.countDocuments({ 'items.product': id });

      if (orderCount > 0) {
        return Response.json(
          {
            success: false,
            error: `Cannot permanently delete — this product appears in ${orderCount} order(s). Use Deactivate instead.`,
          },
          { status: 409 }
        );
      }

      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        return Response.json({ success: false, error: 'Product not found' }, { status: 404 });
      }

      // Anith products wala relatedProducts walin meka ain karanawa
      await Product.updateMany({ relatedProducts: id }, { $pull: { relatedProducts: id } });

      return Response.json({ success: true, message: 'Product permanently deleted' });
    }

    // Soft delete
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { returnDocument: 'after' }
    );
    if (!product) {
      return Response.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return Response.json({ success: true, message: 'Product deactivated' });
  } catch (error) {
    return handleError(error);
  }
}