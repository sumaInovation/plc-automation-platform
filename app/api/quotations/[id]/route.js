import connectDB from '@/lib/db';
import Quotation from '@/models/Quotation';
import { auth } from '@/auth';
import { sendEmail } from '@/lib/email';

export async function GET(request, { params }) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const { id } = await params;

  const filter = session.user.role === 'admin' ? { _id: id } : { _id: id, user: session.user.id };
  const quotation = await Quotation.findOne(filter).populate('user', 'name email').lean();

  if (!quotation) {
    return Response.json({ success: false, error: 'Quotation not found' }, { status: 404 });
  }

  return Response.json({ success: true, quotation: JSON.parse(JSON.stringify(quotation)) });
}

export async function PATCH(request, { params }) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const { id } = await params;
    const { items, shippingCharge, adminNote, status } = await request.json();

    const subtotal = items.reduce((sum, item) => {
      const lineTotal = item.qty * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
      return sum + lineTotal;
    }, 0);
    const quotedPrice = subtotal + Number(shippingCharge || 0);

    const quotation = await Quotation.findByIdAndUpdate(
      id,
      { items, shippingCharge: Number(shippingCharge || 0), quotedPrice, adminNote, status: status || 'quoted' },
      { returnDocument: 'after' }
    ).populate('user', 'name email');

    if (quotation.status === 'quoted') {
      await sendEmail({
        to: quotation.user.email,
        subject: `Quotation Ready — ${quotation.quotationNumber}`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
            <h2>Your Quotation is Ready</h2>
            <p>Hi ${quotation.user.name},</p>
            <p style="font-size: 24px; font-weight: bold;">Rs. ${quotation.quotedPrice.toLocaleString()}</p>
            <p><a href="https://sumaautomation.lk/dashboard/quotations/${quotation._id}">View &amp; Download PDF</a></p>
          </div>
        `,
      });
    }

    return Response.json({ success: true, quotation });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}