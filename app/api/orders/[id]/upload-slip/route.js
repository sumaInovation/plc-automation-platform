import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { auth } from '@/auth';

export async function POST(request, { params }) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;
    const { slipUrl } = await request.json();

    const order = await Order.findOneAndUpdate(
      { _id: id, user: session.user.id },
      { paymentSlip: slipUrl, status: 'payment_slip_uploaded' },
      { returnDocument: 'after' }
    );

    if (!order) {
      return Response.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return Response.json({ success: true, order });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}