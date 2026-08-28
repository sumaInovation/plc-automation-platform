import connectDB from '@/lib/db';
import Batch from '@/models/Batch';
import Course from '@/models/Course';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // seatsAvailable initial ලෙස seatsTotal එකට equal කරනවා
    const batch = await Batch.create({
      ...body,
      seatsAvailable: body.seatsTotal,
    });

    return Response.json({ success: true, batch }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course');

    const filter = courseId ? { course: courseId } : {};

    const batches = await Batch.find(filter)
      .populate('course', 'title slug')
      .sort({ startDate: 1 });

    return Response.json({ success: true, batches });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}