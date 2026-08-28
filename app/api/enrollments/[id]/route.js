import connectDB from '@/lib/db';
import Enrollment from '@/models/Enrollment';
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

    const enrollment = await Enrollment.findOneAndUpdate(
      { _id: id, user: session.user.id },
      { paymentSlip: slipUrl, status: 'payment_slip_uploaded' },
      { returnDocument: 'after' }
    );

    if (!enrollment) {
      return Response.json({ success: false, error: 'Enrollment not found' }, { status: 404 });
    }

    return Response.json({ success: true, enrollment });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}