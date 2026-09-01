import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import Enrollment from '@/models/Enrollment';
import Batch from '@/models/Batch';
import { auth } from '@/auth';

import { sendEmail } from '@/lib/email';
import { enrollmentConfirmedEmail } from '@/lib/emailTemplates';

export async function GET(request, { params }) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();
  const { id } = await params;
  const enrollment = await Enrollment.findById(id).populate('user', 'name email').lean();

  if (!enrollment) {
    return Response.json({ success: false, error: 'Enrollment not found' }, { status: 404 });
  }

  return Response.json({ success: true, enrollment: JSON.parse(JSON.stringify(enrollment)) });
}

export async function PATCH(request, { params }) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const { id } = await params;
    const { action } = await request.json(); // 'confirm' or 'reject'

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      return Response.json({ success: false, error: 'Enrollment not found' }, { status: 404 });
    }

    if (action === 'confirm') {
  enrollment.status = 'confirmed';
  await enrollment.save();

  const populatedEnrollment = await Enrollment.findById(id).populate('user', 'email');
  const { subject, html } = enrollmentConfirmedEmail(enrollment);
  await sendEmail({ to: populatedEnrollment.user.email, subject, html });

  return Response.json({ success: true, enrollment });
}

    if (action === 'reject') {
      // Reject කරනකොට — seat restore කරන්න ඕන (transaction safe)
      const dbSession = await mongoose.startSession();
      try {
        await dbSession.withTransaction(async () => {
          await Batch.findByIdAndUpdate(
            enrollment.batch,
            { $inc: { seatsAvailable: 1 } },
            { session: dbSession }
          );
          enrollment.status = 'cancelled';
          await enrollment.save({ session: dbSession });
        });
      } finally {
        await dbSession.endSession();
      }
      return Response.json({ success: true, enrollment });
    }

    return Response.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}