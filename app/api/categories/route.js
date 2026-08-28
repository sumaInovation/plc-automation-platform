import connectDB from '@/lib/db';
import Category from '@/models/Category';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const category = await Category.create(body);

    return Response.json({ success: true, category }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 });

    return Response.json({ success: true, categories });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}