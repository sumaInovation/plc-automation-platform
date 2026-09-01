import connectDB from '@/lib/db';
import Course from '@/models/Course';
import { auth } from '@/auth';

export async function GET(request, { params }) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();
  const { id } = await params;
  const course = await Course.findById(id).lean();

  if (!course) {
    return Response.json({ success: false, error: 'Course not found' }, { status: 404 });
  }

  return Response.json({ success: true, course: JSON.parse(JSON.stringify(course)) });
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

    const course = await Course.findByIdAndUpdate(id, body, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!course) {
      return Response.json({ success: false, error: 'Course not found' }, { status: 404 });
    }

    return Response.json({ success: true, course });
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

    const course = await Course.findByIdAndUpdate(id, { isActive: false }, { returnDocument: 'after' });

    if (!course) {
      return Response.json({ success: false, error: 'Course not found' }, { status: 404 });
    }

    return Response.json({ success: true, message: 'Course deactivated' });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}