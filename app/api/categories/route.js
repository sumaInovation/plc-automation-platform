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
    // lean + select karanne navbar eke speed ekata
    const categories = await Category.find().sort({ name: 1 }).select('name slug').lean();
    
    // Navbar eke search dropdown eke direct array ekak ona nisa array eka return karanawa
    // Admin panel eke success wrapper eka ona nam yata line eka use karanna
    // return Response.json({ success: true, categories });
    
    return Response.json(categories);
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}