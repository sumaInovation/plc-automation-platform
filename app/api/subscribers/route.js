import connectDB from '@/lib/db';
import Subscriber from '@/models/Subscriber';
import { auth } from '@/auth';

export async function POST(request) {
  try {
    await connectDB();
    const { name, whatsappNumber, interestedIn } = await request.json();

    if (!name || !whatsappNumber) {
      return Response.json({ success: false, error: 'Name and WhatsApp number are required' }, { status: 400 });
    }

    const subscriber = await Subscriber.create({ name, whatsappNumber, interestedIn });
    return Response.json({ success: true, subscriber }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();
  const subscribers = await Subscriber.find().sort({ createdAt: -1 }).lean();
  return Response.json({ success: true, subscribers: JSON.parse(JSON.stringify(subscribers)) });
}