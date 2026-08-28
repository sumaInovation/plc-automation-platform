import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { auth } from '@/auth';

export async function GET(request) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const filter = status && status !== 'all' ? { status } : {};

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({ success: true, orders: JSON.parse(JSON.stringify(orders)) });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}