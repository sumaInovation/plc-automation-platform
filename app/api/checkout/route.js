import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { auth } from '@/auth';

import { sendEmail } from '@/lib/email';
import { orderPlacedEmail } from '@/lib/emailTemplates';

export async function POST(request) {
  const session = await auth();

  if (!session?.user) {
    return Response.json({ success: false, error: 'Please login to place an order' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const { items, deliveryDetails } = body;

    if (!items || items.length === 0) {
      return Response.json({ success: false, error: 'Cart is empty' }, { status: 400 });
    }

    // MongoDB Transaction — Stock check + deduct + Order create, ඔක්කොම atomic ලෙස
    const dbSession = await mongoose.startSession();
    let createdOrder;

    try {
      await dbSession.withTransaction(async () => {
        let total = 0;
        const orderItems = [];

        for (const item of items) {
          // Stock check + deduct එකපාරටම (race condition safe — $gte condition එකෙන්)
        
const product = await Product.findOneAndUpdate(
  { _id: item._id, stock_qty: { $gte: item.qty } },
  { $inc: { stock_qty: -item.qty } },
  { session: dbSession, returnDocument: 'after' }
);
          if (!product) {
            // Stock ප්‍රමාණවත් නෑ, හෝ product එක නැති වෙලා — transaction එකම fail කරනවා
            throw new Error(`Insufficient stock for "${item.name}". Please update your cart.`);
          }

          orderItems.push({
            product: product._id,
            name: product.name,
            price: product.price,
            qty: item.qty,
          });

          total += product.price * item.qty;
        }

        const [order] = await Order.create(
          [
            {
              user: session.user.id,
              items: orderItems,
              total,
              deliveryDetails,
              status: 'pending_payment',
            },
          ],
          { session: dbSession }
        );

        createdOrder = order;
      });
    } finally {
      await dbSession.endSession();
    }

    const { subject, html } = orderPlacedEmail(createdOrder);
await sendEmail({ to: session.user.email, subject, html });

    return Response.json({
      success: true,
      order: {
        _id: createdOrder._id,
        orderNumber: createdOrder.orderNumber,
        total: createdOrder.total,
      },
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}