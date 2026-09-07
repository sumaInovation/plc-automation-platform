import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { auth } from '@/auth';
import { sendEmail } from '@/lib/email';
import { orderConfirmedEmail, deliveryChargeSetEmail } from '@/lib/emailTemplates';

export async function GET(request, { params }) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }
  await connectDB();
  const { id } = await params;
  const order = await Order.findById(id).populate('user', 'name email').lean();
  if (!order) return Response.json({ success: false, error: 'Order not found' }, { status: 404 });
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
    const body = await request.json(); // Meka thamai fix eka
    const { action, deliveryCharge } = body;

    const order = await Order.findById(id).populate('user', 'email name');
    if (!order) return Response.json({ success: false, error: 'Order not found' }, { status: 404 });

    if (action === 'set_delivery_charge') {
      const charge = Number(deliveryCharge);
      if (isNaN(charge) || charge < 0) {
        return Response.json({ success: false, error: 'Invalid charge' }, { status: 400 });
      }
      
      // subtotal nathnam items walin hadanawa
      const subtotal = order.subtotal ?? order.items.reduce((s, it) => s + (it.price * it.qty), 0);
      
      order.subtotal = subtotal;
      order.deliveryCharge = charge;
      order.total = subtotal + charge;
      order.status = 'pending_payment';
      await order.save();

      try {
        const { subject, html } = deliveryChargeSetEmail(order);
        await sendEmail({ to: order.user.email, subject, html });
      } catch (emailErr) {
        console.error('Email failed but order saved:', emailErr);
      }

      return Response.json({ success: true, order });
    }

    if (action === 'confirm') {
      order.status = 'confirmed';
      await order.save();
      try {
        const { subject, html } = orderConfirmedEmail(order);
        await sendEmail({ to: order.user.email, subject, html });
      } catch (e) { console.error(e); }
      return Response.json({ success: true, order });
    }

    if (action === 'reject') {
      const dbSession = await mongoose.startSession();
      try {
        await dbSession.withTransaction(async () => {
          for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock_qty: item.qty } }, { session: dbSession });
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
    console.error('PATCH ERROR:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}