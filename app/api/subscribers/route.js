import connectDB from '@/lib/db';
import Subscriber from '@/models/Subscriber';
import { auth } from '@/auth';

const ALLOWED_INTERESTS = ['PLC & Robotics courses'];
const ALLOWED_SOURCES = ['facebook', 'instagram', 'tiktok', 'whatsapp', 'qr', 'courses'];

// 07XXXXXXXX, +947XXXXXXXX, 947XXXXXXXX -> 947XXXXXXXX
function normalizeLkNumber(input) {
  let n = String(input).replace(/[\s\-()+]/g, '');
  if (n.startsWith('0')) n = '94' + n.slice(1);
  return /^947\d{8}$/.test(n) ? n : null;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }

  const { name, whatsappNumber, interestedIn, source, website } = body ?? {};

  // Honeypot: real users never fill this. Pretend success so bots don't adapt.
  if (typeof website === 'string' && website.trim() !== '') {
    return Response.json({ success: true }, { status: 200 });
  }

  if (typeof name !== 'string' || typeof whatsappNumber !== 'string') {
    return Response.json(
      { success: false, error: 'Name and WhatsApp number are required' },
      { status: 400 }
    );
  }

  const cleanName = name.trim();
  if (!cleanName || cleanName.length > 80) {
    return Response.json({ success: false, error: 'Please enter a valid name' }, { status: 400 });
  }

  const normalizedNumber = normalizeLkNumber(whatsappNumber);
  if (!normalizedNumber) {
    return Response.json(
      { success: false, error: 'Please enter a valid Sri Lankan mobile number (e.g. 07XXXXXXXX)' },
      { status: 400 }
    );
  }

  const interest = ALLOWED_INTERESTS.includes(interestedIn) ? interestedIn : ALLOWED_INTERESTS[0];
  const cleanSource = ALLOWED_SOURCES.includes(source) ? source : 'direct';

  try {
    await connectDB();
    await Subscriber.create({
      name: cleanName,
      whatsappNumber: normalizedNumber,
      interestedIn: interest,
      source: cleanSource,
    });
    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    // Duplicate number: return success so we don't reveal who is subscribed
    if (error?.code === 11000) {
      return Response.json({ success: true }, { status: 200 });
    }
    console.error('POST /api/subscribers failed:', error);
    return Response.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const subscribers = await Subscriber.find().sort({ createdAt: -1 }).lean();
    return Response.json({ success: true, subscribers });
  } catch (error) {
    console.error('GET /api/subscribers failed:', error);
    return Response.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}