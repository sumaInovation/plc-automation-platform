import connectDB from '@/lib/db';
import Course from '@/models/Course';
import Batch from '@/models/Batch';
import { notFound } from 'next/navigation';
import EnrollButton from '@/components/courses/EnrollButton';
import ReviewSection from '@/components/shop/ReviewSection';

async function getCourseData(slug) {
  await connectDB();
  const course = await Course.findOne({ slug, isActive: true }).lean();
  if (!course) return null;

  const batches = await Batch.find({
    course: course._id,
    status: { $in: ['upcoming', 'ongoing'] },
  })
    .sort({ startDate: 1 })
    .lean();

  return {
    course: JSON.parse(JSON.stringify(course)),
    batches: JSON.parse(JSON.stringify(batches)),
  };
}

export default async function CourseDetailPage({ params }) {
  const { slug } = await params;
  const data = await getCourseData(slug);

  if (!data) notFound();
  const { course, batches } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex gap-2 mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          course.type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
        }`}>
          {course.type === 'online' ? 'Online' : 'Physical'}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 capitalize">
          {course.level}
        </span>
      </div>

      <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
      <p className="text-gray-600 mb-4">{course.description}</p>

      <div className="flex gap-6 text-sm text-gray-500 mb-6">
        {course.duration && <span>⏱ {course.duration}</span>}
        <span className="font-bold text-gray-900 text-lg">Rs. {course.price.toLocaleString()}</span>
      </div>

      {course.syllabus?.length > 0 && (
        <div className="border rounded-lg p-4 mb-6">
          <h2 className="font-semibold mb-3">Syllabus</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {course.syllabus.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-4">Available Batches</h2>

        {batches.length === 0 ? (
          <p className="text-gray-500 text-sm">No upcoming batches. Check back soon.</p>
        ) : (
          <div className="space-y-3">
            {batches.map((batch) => (
              <div key={batch._id} className="border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{batch.batchName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(batch.startDate).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {batch.endDate && ` - ${new Date(batch.endDate).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  </p>
                  {batch.schedule && <p className="text-sm text-gray-500">{batch.schedule}</p>}
                  {batch.location && <p className="text-sm text-gray-500">📍 {batch.location}</p>}
                  <p className={`text-sm mt-1 ${batch.seatsAvailable > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {batch.seatsAvailable > 0 ? `${batch.seatsAvailable} seats left` : 'Fully booked'}
                  </p>
                </div>

                <EnrollButton course={course} batch={batch} />
              </div>
            ))}
            <ReviewSection targetType="course" targetId={course._id} />
          </div>
          
        )}
      </div>
    </div>
  );
}