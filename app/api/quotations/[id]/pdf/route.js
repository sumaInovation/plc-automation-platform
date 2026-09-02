import connectDB from '@/lib/db';
import Quotation from '@/models/Quotation';
import { auth } from '@/auth';
import { renderToBuffer } from '@react-pdf/renderer';
import QuotePDFDocument from '@/components/pdf/QuotePDFDocument';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const { id } = await params;

  const filter = session.user.role === 'admin' ? { _id: id } : { _id: id, user: session.user.id };
  const quotation = await Quotation.findOne(filter)
    .populate('user', 'name email')
    .populate('items.product', 'images')
    .lean();

  if (!quotation) {
    return Response.json({ success: false, error: 'Quotation not found' }, { status: 404 });
  }
  if (quotation.status === 'pending') {
    return Response.json({ success: false, error: 'Quotation not finalized yet' }, { status: 400 });
  }

  const buffer = await renderToBuffer(<QuotePDFDocument quotation={quotation} />);

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${quotation.quotationNumber}.pdf"`,
    },
  });
}