import connectDB from '@/lib/db';
import Course from '@/models/Course';
import Link from 'next/link';

async function getCourses() {
  await connectDB();
  const courses = await Course.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(courses));
}

export default async function AdminCoursesPage() {
  const courses = await getCourses();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Courses</h1>
        <Link href="/admin/courses/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          + Add Course
        </Link>
      </div>

      <div className="space-y-2">
        {courses.map((c) => (
          <div key={c._id} className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{c.title}</p>
              <p className="text-sm text-gray-500 capitalize">{c.type} — {c.level}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">Rs. {c.price.toLocaleString()}</p>
              <Link
                href={`/admin/batches/new?courseId=${c._id}&courseTitle=${encodeURIComponent(c.title)}`}
                className="text-xs text-blue-600 hover:underline"
              >
                + Add Batch
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}