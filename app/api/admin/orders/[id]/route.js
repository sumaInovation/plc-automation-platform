import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { auth } from '@/auth';

import { sendEmail } from '@/lib/email';
import { orderConfirmedEmail } from '@/lib/emailTemplates';

export async function GET(request, { params }) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();
  const { id } = await params;
  const order = await Order.findById(id).populate('user', 'name email').lean();

  if (!order) {
    return Response.json({ success: false, error: 'Order not found' }, { status: 404 });
  }

  return Response.json({ success: true, order: JSON.parse(JSON.stringify(order)) });
}

export async function PATCH(request, { params }) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const { id } = await params;
    const { action } = await request.json(); // 'confirm' or 'reject'

    const order = await Order.findById(id);
    if (!order) {
      return Response.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

     if (action === 'confirm') {
  order.status = 'confirmed';
  await order.save();

  const populatedOrder = await Order.findById(id).populate('user', 'email');
  const { subject, html } = orderConfirmedEmail(order);
  await sendEmail({ to: populatedOrder.user.email, subject, html });

  return Response.json({ success: true, order });
}

    if (action === 'reject') {
      // Reject කරනකොට — stock restore කරන්න ඕන (transaction safe)
      const dbSession = await mongoose.startSession();
      try {
        await dbSession.withTransaction(async () => {
          for (const item of order.items) {
            await Product.findByIdAndUpdate(
              item.product,
              { $inc: { stock_qty: item.qty } },
              { session: dbSession }
            );
          }
          order.status = 'cancelled';
          await order.save({ session: dbSession });
        });
      } finally {
        await dbSession.endSession();
      }
      return Response.json({ success: true, order });
    }

    return Response.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}