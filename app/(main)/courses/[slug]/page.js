import connectDB from '@/lib/db';
import Course from '@/models/Course';
import Batch from '@/models/Batch';
import { notFound } from 'next/navigation';
import EnrollButton from '@/components/courses/EnrollButton';
import SyllabusSection from '@/components/courses/SyllabusSection';
import ReviewSection from '@/components/shop/ReviewSection';
import ShareButtons from '@/components/shop/ShareButtons';
import { ogImageUrl } from '@/lib/utils';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getCourseData(slug);

  if (!data) return { title: 'Course Not Found' };
  const { course } = data;

  return {
    title: course.title,
    description: course.description?.slice(0, 160),
    alternates: {
      canonical: `https://sumaautomation.lk/courses/${slug}`,
    },
    openGraph: {
      title: course.title,
      description: course.description?.slice(0, 160),
      images: course.image
        ? [{ url: ogImageUrl(course.image), width: 1200, height: 630 }]
        : [],
      url: `https://sumaautomation.lk/courses/${slug}`,
      type: 'website',
    },
  };
}

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

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function CourseDetailPage({ params }) {
  const { slug } = await params;
  const data = await getCourseData(slug);

  if (!data) notFound();
  const { course, batches } = data;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Course hero image */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden mb-6 border border-[#e7e7e7]">
          {course.image ? (
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#f7f8f8] flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-[#f0f2f2] flex items-center justify-center text-xl">📷</div>
              <span className="text-[#565959] text-sm mt-3 font-medium">No image available</span>
            </div>
          )}

          {/* Badges overlaid on image */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur bg-white/90 ${
              course.type === 'online' ? 'text-[#007185]' : 'text-[#c45500]'
            }`}>
              {course.type === 'online' ? 'Online' : 'Physical'}
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur bg-white/90 text-[#565959] capitalize">
              {course.level}
            </span>
          </div>
        </div>

        {/* Title & description */}
        <h1 className="text-2xl sm:text-3xl font-medium text-[#0f1111] mb-2 leading-tight">
          {course.title}
        </h1>
        <p className="text-[#565959] text-sm sm:text-base mb-5 leading-[1.6] whitespace-pre-line">
          {course.description}
        </p>

        {/* Duration + price */}
        <div className="flex flex-wrap items-center gap-4 pb-5 border-b border-[#e7e7e7] mb-6">
          {course.duration && (
            <span className="text-sm text-[#565959] flex items-center gap-1">
              <span>⏱</span> {course.duration}
            </span>
          )}
          <span className="text-2xl font-bold text-[#0f1111]">
            <sup className="text-sm font-normal">Rs.</sup> {course.price.toLocaleString()}
          </span>
        </div>

        {/* Syllabus - file download card + text accordion */}
        <SyllabusSection syllabus={course.syllabus} syllabusFile={course.syllabusFile} />

        {/* Share */}
        <div className="mb-6">
          <ShareButtons
            url={`https://sumaautomation.lk/courses/${course.slug}`}
            title={course.title}
          />
        </div>

        {/* Batches */}
        <div className="border border-[#e7e7e7] rounded-lg overflow-hidden">
          <h2 className="font-bold text-[#0f1111] px-5 py-4 border-b border-[#e7e7e7]">Available Batches</h2>

          {batches.length === 0 ? (
            <p className="text-[#565959] text-sm px-5 py-6">No upcoming batches. Check back soon.</p>
          ) : (
            <>
              {/* Desktop table */}
              <table className="hidden md:table w-full text-sm">
                <thead>
                  <tr className="bg-[#f7f8f8] text-left text-[#565959] text-xs uppercase tracking-wide">
                    <th className="px-5 py-3 font-medium">Batch</th>
                    <th className="px-5 py-3 font-medium">Dates</th>
                    <th className="px-5 py-3 font-medium">Schedule</th>
                    <th className="px-5 py-3 font-medium">Location</th>
                    <th className="px-5 py-3 font-medium">Seats</th>
                    <th className="px-5 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch, i) => (
                    <tr key={batch._id} className={i !== batches.length - 1 ? 'border-b border-[#e7e7e7]' : ''}>
                      <td className="px-5 py-4 font-medium text-[#0f1111] align-top">{batch.batchName}</td>
                      <td className="px-5 py-4 text-[#0f1111] align-top">
                        {formatDate(batch.startDate)}
                        {batch.endDate && (
                          <>
                            <br />
                            <span className="text-[#565959]">to {formatDate(batch.endDate)}</span>
                          </>
                        )}
                      </td>
                      <td className="px-5 py-4 text-[#0f1111] align-top">{batch.schedule || '-'}</td>
                      <td className="px-5 py-4 text-[#0f1111] align-top">
                        {batch.location ? <>📍 {batch.location}</> : '-'}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span className={`font-bold ${batch.seatsAvailable > 0 ? 'text-[#067d62]' : 'text-[#cc0c39]'}`}>
                          {batch.seatsAvailable > 0 ? `${batch.seatsAvailable} left` : 'Full'}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-top text-right">
                        <EnrollButton course={course} batch={batch} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile stacked cards */}
              <div className="md:hidden divide-y divide-[#e7e7e7]">
                {batches.map((batch) => (
                  <div key={batch._id} className="p-4 space-y-1.5">
                    <p className="font-medium text-[#0f1111]">{batch.batchName}</p>
                    <p className="text-sm text-[#565959]">
                      {formatDate(batch.startDate)}
                      {batch.endDate && ` - ${formatDate(batch.endDate)}`}
                    </p>
                    {batch.schedule && <p className="text-sm text-[#565959]">{batch.schedule}</p>}
                    {batch.location && <p className="text-sm text-[#565959]">📍 {batch.location}</p>}
                    <p className={`text-sm font-bold ${batch.seatsAvailable > 0 ? 'text-[#067d62]' : 'text-[#cc0c39]'}`}>
                      {batch.seatsAvailable > 0 ? `${batch.seatsAvailable} seats left` : 'Fully booked'}
                    </p>
                    <div className="pt-2">
                      <EnrollButton course={course} batch={batch} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Reviews */}
        <div className="mt-8 border-t border-[#e7e7e7] pt-6">
          <ReviewSection targetType="course" targetId={course._id} />
        </div>
      </div>
    </div>
  );
}