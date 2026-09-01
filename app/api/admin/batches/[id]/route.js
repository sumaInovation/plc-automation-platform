import connectDB from '@/lib/db';
import Batch from '@/models/Batch';
import { auth } from '@/auth';

export async function GET(request, { params }) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();
  const { id } = await params;
  const batch = await Batch.findById(id).populate('course', 'title').lean();

  if (!batch) {
    return Response.json({ success: false, error: 'Batch not found' }, { status: 404 });
  }

  return Response.json({ success: true, batch: JSON.parse(JSON.stringify(batch)) });
}

export async function PUT(request, { params }) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const existing = await Batch.findById(id);
    if (!existing) {
      return Response.json({ success: false, error: 'Batch not found' }, { status: 404 });
    }

    // ⚠️ seatsTotal වෙනස් කලොත් — seatsAvailable එකත් proportionally adjust කරන්න ඕන
    // (දැනටමත් enroll වෙච්ච ගණන අඩු කරන්නෙ නැතුව, ඉතුරු available seats විතරයි update කරනවා)
    const alreadyBooked = existing.seatsTotal - existing.seatsAvailable;
    const newSeatsTotal = Number(body.seatsTotal);
    const newSeatsAvailable = Math.max(0, newSeatsTotal - alreadyBooked);

    const batch = await Batch.findByIdAndUpdate(
      id,
      { ...body, seatsTotal: newSeatsTotal, seatsAvailable: newSeatsAvailable },
      { returnDocument: 'after', runValidators: true }
    );

    return Response.json({ success: true, batch });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const { id } = await params;

    const batch = await Batch.findByIdAndUpdate(id, { status: 'cancelled' }, { returnDocument: 'after' });

    if (!batch) {
      return Response.json({ success: false, error: 'Batch not found' }, { status: 404 });
    }

    return Response.json({ success: true, message: 'Batch cancelled' });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}