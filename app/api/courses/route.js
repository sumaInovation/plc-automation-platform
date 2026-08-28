import connectDB from '@/lib/db';
import Course from '@/models/Course';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const course = await Course.create(body);
    return Response.json({ success: true, course }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const courses = await Course.find({ isActive: true }).sort({ createdAt: -1 });
    return Response.json({ success: true, courses });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}