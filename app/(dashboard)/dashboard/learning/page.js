import connectDB from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

async function getEnrollments(userId) {
  await connectDB();
  const enrollments = await Enrollment.find({ user: userId }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(enrollments));
}

const statusColors = {
  pending_payment: 'bg-gray-100 text-gray-700',
  payment_slip_uploaded: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default async function MyLearningPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const enrollments = await getEnrollments(session.user.id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Courses</h1>

      {enrollments.length === 0 ? (
        <div className="border rounded-lg p-8 text-center">
          <p className="text-slate-500 mb-3">You haven't enrolled in any courses yet.</p>
          <Link href="/courses" className="text-[#2C6E9E] font-medium hover:underline">Browse courses →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {enrollments.map((enrollment) => (
            <Link
              key={enrollment._id}
              href={`/dashboard/learning/${enrollment._id}`}
              className="block border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-sm">{enrollment.courseName}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColors[enrollment.status]}`}>
                  {enrollment.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-1">{enrollment.batchName}</p>
              <p className="text-xs text-slate-400">
                Enrolled {new Date(enrollment.createdAt).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p className="font-bold text-sm mt-2">Rs. {enrollment.price.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}