import connectDB from '@/lib/db';
import Course from '@/models/Course';
import { auth } from '@/auth';

export async function POST(request) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const course = await Course.create(body);
    return Response.json({ success: true, course }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}