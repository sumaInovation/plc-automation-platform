import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import Enrollment from '@/models/Enrollment';
import Batch from '@/models/Batch';
import Course from '@/models/Course';
import { auth } from '@/auth';

export async function POST(request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ success: false, error: 'Please login to enroll' }, { status: 401 });
  }

  try {
    await connectDB();
    const { courseId, batchId } = await request.json();

    const dbSession = await mongoose.startSession();
    let createdEnrollment;

    try {
      await dbSession.withTransaction(async () => {
        // Duplicate enrollment check
        const existing = await Enrollment.findOne({
          user: session.user.id,
          batch: batchId,
          status: { $ne: 'cancelled' },
        }).session(dbSession);

        if (existing) {
          throw new Error('You have already enrolled in this batch.');
        }

        // Seat check + deduct — Product stock pattern එකම
        const batch = await Batch.findOneAndUpdate(
          { _id: batchId, seatsAvailable: { $gte: 1 } },
          { $inc: { seatsAvailable: -1 } },
          { session: dbSession, returnDocument: 'after' }
        );

        if (!batch) {
          throw new Error('No seats available for this batch.');
        }

        const course = await Course.findById(courseId).session(dbSession);
        if (!course) {
          throw new Error('Course not found.');
        }

        const [enrollment] = await Enrollment.create(
          [
            {
              user: session.user.id,
              course: courseId,
              batch: batchId,
              courseName: course.title,
              batchName: batch.batchName,
              price: course.price,
              status: 'pending_payment',
            },
          ],
          { session: dbSession }
        );

        createdEnrollment = enrollment;
      });
    } finally {
      await dbSession.endSession();
    }

    return Response.json({
      success: true,
      enrollment: {
        _id: createdEnrollment._id,
        enrollmentNumber: createdEnrollment.enrollmentNumber,
        price: createdEnrollment.price,
      },
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}