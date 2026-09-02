import connectDB from '@/lib/db';
import Quotation from '@/models/Quotation';
import Product from '@/models/Product';
import { auth } from '@/auth';

export async function POST(request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ success: false, error: 'Please login to request a quotation' }, { status: 401 });
  }

  try {
    await connectDB();
    const { items, message, contactPhone } = await request.json();

    if (!items || items.length === 0) {
      return Response.json({ success: false, error: 'No items in quote request' }, { status: 400 });
    }

    // ⚠️ Product ID ගණනාවකින් actual current prices fetch කරනවා (client එකෙන් එවපු price එක trust කරන්නෙ නෑ — security + accuracy)
    const productIds = items.map((i) => i.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const priceMap = {};
    products.forEach((p) => { priceMap[p._id.toString()] = p.price; });

    const itemsWithPrice = items.map((item) => ({
      product: item.product,
      name: item.name,
      qty: item.qty,
      unitPrice: priceMap[item.product] || 0, // ⚠️ Product එකේ actual current price එකම auto-set වෙනවා
      discountPercent: 0,
    }));

    const quotation = await Quotation.create({
      user: session.user.id,
      items: itemsWithPrice,
      message,
      contactPhone,
    });

    return Response.json({ success: true, quotation }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
export async function GET(request) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const filter = status && status !== 'all' ? { status } : {};

  const quotations = await Quotation.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  return Response.json({ success: true, quotations: JSON.parse(JSON.stringify(quotations)) });
}