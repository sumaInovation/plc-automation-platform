import connectDB from '@/lib/db';
import Batch from '@/models/Batch';
import { auth } from '@/auth';

export async function POST(request) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const batch = await Batch.create({ ...body, seatsAvailable: body.seatsTotal });
    return Response.json({ success: true, batch }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}