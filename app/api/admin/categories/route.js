import connectDB from '@/lib/db';
import Category from '@/models/Category';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 }).lean();
    return Response.json({ success: true, categories: JSON.parse(JSON.stringify(categories)) });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const category = await Category.create(body);
    return Response.json({ success: true, category }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}