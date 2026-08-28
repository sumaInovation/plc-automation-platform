import connectDB from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import { auth } from '@/auth';
import { notFound, redirect } from 'next/navigation';
import EnrollmentSlipUpload from '@/components/dashboard/EnrollmentSlipUpload';

async function getEnrollment(id, userId) {
  await connectDB();
  const enrollment = await Enrollment.findOne({ _id: id, user: userId }).lean();
  if (!enrollment) return null;
  return JSON.parse(JSON.stringify(enrollment));
}

export default async function EnrollmentDetailPage({ params, searchParams }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { courseId } = await params; // folder name [courseId], ඒත් real enrollment id එකයි
  const { new: isNew } = await searchParams;

  const enrollment = await getEnrollment(courseId, session.user.id);
  if (!enrollment) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {isNew === 'true' && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mb-6">
          ✓ Enrollment successful! Reference: <strong>{enrollment.enrollmentNumber}</strong>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-2">{enrollment.courseName}</h1>
      <p className="text-sm text-gray-500 mb-1">Batch: {enrollment.batchName}</p>
      <p className="text-sm text-gray-500 mb-6">Status: <strong>{enrollment.status.replace('_', ' ')}</strong></p>

      <p className="text-xl font-bold mb-6">Rs. {enrollment.price.toLocaleString()}</p>

      {enrollment.status === 'pending_payment' && (
        <div className="border rounded-lg p-4 bg-blue-50">
          <h2 className="font-semibold mb-3">Bank Transfer Details</h2>
          <p className="text-sm">Bank: {process.env.BANK_NAME}</p>
          <p className="text-sm">Account Name: {process.env.BANK_ACCOUNT_NAME}</p>
          <p className="text-sm">Account Number: {process.env.BANK_ACCOUNT_NUMBER}</p>
          <p className="text-sm">Branch: {process.env.BANK_BRANCH}</p>
          <p className="text-sm mt-2 font-medium">Amount: Rs. {enrollment.price.toLocaleString()}</p>

          <EnrollmentSlipUpload enrollmentId={enrollment._id} />
        </div>
      )}

      {enrollment.status === 'payment_slip_uploaded' && (
        <p className="text-sm text-gray-600">Slip uploaded — admin review කරන තුරු wait කරන්න.</p>
      )}
    </div>
  );
}