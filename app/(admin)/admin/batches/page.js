import connectDB from '@/lib/db';
import Batch from '@/models/Batch';
import Course from '@/models/Course';
import Link from 'next/link';

async function getBatches() {
  await connectDB();
  const batches = await Batch.find().populate('course', 'title').sort({ startDate: 1 }).lean();
  return JSON.parse(JSON.stringify(batches));
}

const statusColors = {
  upcoming: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default async function AdminBatchesPage() {
  const batches = await getBatches();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Batches</h1>

      <div className="space-y-2">
        {batches.map((b) => (
          <div key={b._id} className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{b.batchName}</p>
              <p className="text-sm text-gray-500">{b.course?.title}</p>
              <p className="text-xs text-gray-400">
                {new Date(b.startDate).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="text-right flex items-center gap-3">
              <div>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColors[b.status]}`}>{b.status}</span>
                <p className="text-sm text-gray-500 mt-1">{b.seatsAvailable}/{b.seatsTotal} seats left</p>
              </div>
              <Link href={`/admin/batches/${b._id}/edit`} className="text-sm text-blue-600 hover:underline">
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}