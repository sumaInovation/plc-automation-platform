import connectDB from '@/lib/db';
import Course from '@/models/Course';
import Batch from '@/models/Batch';
import Product from '@/models/Product';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import EnrollButton from '@/components/courses/EnrollButton';

import SyllabusSection from '@/components/courses/SyllabusSection';
import ReviewSection from '@/components/shop/ReviewSection';
import ShareButtons from '@/components/shop/ShareButtons';
import CourseProducts from '@/components/courses/CourseProducts';

const SITE_URL = 'https://www.sumaautomation.lk';

// Hama visit ekakatama aluth random products enna
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getCourseData(slug);
  const course = data?.course;
  if (!course) return { title: 'Course Not Found' };

  let finalImage;
  if (course.image && course.image.startsWith('http')) {
    if (course.image.includes('/upload/') && !course.image.includes('w_1200')) {
      finalImage = course.image.replace('/upload/', '/upload/w_1200,h_630,c_fill,f_auto,q_auto/');
    } else {
      finalImage = course.image;
    }
  } else {
    finalImage = `${SITE_URL}/og-default.jpg`;
  }

  const desc =
    course.description?.replace(/<[^>]*>/g, '').trim().slice(0, 160) ||
    'PLC & Automation training - Suma Automation';

  return {
    title: course.title,
    description: desc,
    alternates: { canonical: `${SITE_URL}/courses/${slug}` },
    openGraph: {
      title: course.title,
      description: desc,
      url: `${SITE_URL}/courses/${slug}`,
      siteName: 'Suma Automation',
      type: 'website',
      images: [{ url: finalImage, secureUrl: finalImage, width: 1200, height: 630, alt: course.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: course.title,
      description: desc,
      images: [finalImage],
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

  // Store eke hama product ekakma course walata related -> random 8k gannawa
  const products = await Product.aggregate([
    { $match: { isActive: true, stock_qty: { $gt: 0 } } },
    { $sample: { size: 8 } },
    { $project: { name: 1, slug: 1, price: 1, compareAtPrice: 1, images: { $slice: ['$images', 1] }, stock_qty: 1 } },
  ]);

  return {
    course: JSON.parse(JSON.stringify(course)),
    batches: JSON.parse(JSON.stringify(batches)),
    products: JSON.parse(JSON.stringify(products)),
  };
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function CourseDetailPage({ params }) {
  const { slug } = await params;
  const data = await getCourseData(slug);

  if (!data) notFound();
  const { course, batches, products } = data;

  const nextBatch = batches.find((b) => b.seatsAvailable > 0) || null;
  const price = Number(course.price || 0);

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: { '@type': 'Organization', name: 'Suma Automation', sameAs: SITE_URL },
    ...(course.image && { image: course.image }),
    offers: {
      '@type': 'Offer',
      price: course.price,
      priceCurrency: 'LKR',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/courses/${course.slug}`,
    },
    ...(batches.length > 0 && {
      hasCourseInstance: batches.map((b) => ({
        '@type': 'CourseInstance',
        courseMode: course.type === 'online' ? 'online' : 'onsite',
        courseWorkload: course.duration || undefined,
        startDate: b.startDate,
        ...(b.endDate && { endDate: b.endDate }),
        ...(b.location && { location: { '@type': 'Place', name: b.location } }),
      })),
    }),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Courses', item: `${SITE_URL}/courses` },
      { '@type': 'ListItem', position: 3, name: course.title, item: `${SITE_URL}/courses/${course.slug}` },
    ],
  };

  const shareUrl = `${SITE_URL}/courses/${course.slug}`;

  return (
    <div className="bg-white min-h-screen pb-24 lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs sm:text-sm text-[#565959] mb-4 flex items-center gap-1.5 flex-wrap">
          <a href="/" className="hover:text-[#c7511f] hover:underline">Home</a>
          <span aria-hidden="true">/</span>
          <a href="/courses" className="hover:text-[#c7511f] hover:underline">Courses</a>
          <span aria-hidden="true">/</span>
          <span className="text-[#0f1111] truncate max-w-[200px] sm:max-w-none">{course.title}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 items-start">
          {/* ───────── MAIN COLUMN ───────── */}
          <main className="min-w-0">
            {/* Banner */}
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-[#e7e7e7] bg-[#f7f8f8]">
              {course.image ? (
                <Image
                  src={course.image}
                  alt={`${course.title} - PLC and Robotics course by Suma Automation`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 700px"
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-[#f0f2f2] flex items-center justify-center text-xl">📷</div>
                  <span className="text-[#565959] text-sm mt-3 font-medium">No image available</span>
                </div>
              )}
            </div>

            {/* Share - directly under the banner */}
            <div className="flex items-center justify-between gap-3 py-3 border-b border-[#e7e7e7]">
              <span className="text-sm text-[#565959]">Share this course</span>
              <ShareButtons url={shareUrl} title={course.title} />
            </div>

            {/* Title + meta chips */}
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#0f1111] mt-5 mb-3 leading-tight">
              {course.title}
            </h1>

            <div className="flex flex-wrap gap-2 mb-5">
              {course.duration && (
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#0f1111] bg-[#f0f2f2] rounded-full px-3 py-1">
                  ⏱ {course.duration}
                </span>
              )}
              {course.type && (
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#0f1111] bg-[#f0f2f2] rounded-full px-3 py-1 capitalize">
                  {course.type === 'online' ? '💻' : '🏫'} {course.type}
                </span>
              )}
              {nextBatch && (
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#067d62] bg-[#e6f4ef] rounded-full px-3 py-1 font-medium">
                  Next batch: {formatDate(nextBatch.startDate)}
                </span>
              )}
            </div>

            <p className="text-[#3a3d3d] text-[15px] sm:text-base mb-8 leading-[1.7] whitespace-pre-line max-w-[68ch]">
              {course.description}
            </p>

            {/* Syllabus */}
            <SyllabusSection syllabus={course.syllabus} syllabusFile={course.syllabusFile} />

            {/* Batches */}
            <section id="batches" className="scroll-mt-20 mb-10" aria-labelledby="batches-heading">
              <h2 id="batches-heading" className="text-lg sm:text-xl font-bold text-[#0f1111] mb-3">
                Available batches
              </h2>

              <div className="border border-[#e7e7e7] rounded-xl overflow-hidden">
                {batches.length === 0 ? (
                  <p className="text-[#565959] text-sm px-5 py-6">No upcoming batches. Check back soon.</p>
                ) : (
                  <>
                    {/* Desktop table */}
                    <table className="hidden md:table w-full text-sm">
                      <thead>
                        <tr className="bg-[#f7f8f8] text-left text-[#565959] text-xs">
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

                    {/* Mobile cards */}
                    <div className="md:hidden divide-y divide-[#e7e7e7]">
                      {batches.map((batch) => (
                        <div key={batch._id} className="p-4 space-y-1.5">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-medium text-[#0f1111]">{batch.batchName}</p>
                            <span
                              className={`text-xs font-bold shrink-0 ${batch.seatsAvailable > 0 ? 'text-[#067d62]' : 'text-[#cc0c39]'}`}
                            >
                              {batch.seatsAvailable > 0 ? `${batch.seatsAvailable} seats left` : 'Fully booked'}
                            </span>
                          </div>
                          <p className="text-sm text-[#565959]">
                            {formatDate(batch.startDate)}
                            {batch.endDate && ` - ${formatDate(batch.endDate)}`}
                          </p>
                          {batch.schedule && <p className="text-sm text-[#565959]">🕒 {batch.schedule}</p>}
                          {batch.location && <p className="text-sm text-[#565959]">📍 {batch.location}</p>}
                          <div className="pt-2">
                            <EnrollButton course={course} batch={batch} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Related products (mobile / tablet) */}
            {products.length > 0 && (
              <div className="lg:hidden mb-10">
                <CourseProducts products={products} perPage={4} title="You may also need" />
              </div>
            )}

            {/* Reviews */}
            <section className="border-t border-[#e7e7e7] pt-6">
              <ReviewSection targetType="course" targetId={course._id} />
            </section>
          </main>

          {/* ───────── SIDEBAR (desktop) ───────── */}
          <aside className="hidden lg:block sticky top-24">
            <div className="border border-[#e7e7e7] rounded-2xl p-6 shadow-sm">
              <p className="text-3xl font-bold text-[#0f1111]">
                <sup className="text-sm font-normal mr-0.5">Rs.</sup>
                {price.toLocaleString()}
              </p>

              <dl className="mt-5 space-y-3 text-sm">
                {course.duration && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#565959]">Duration</dt>
                    <dd className="font-medium text-[#0f1111] text-right">{course.duration}</dd>
                  </div>
                )}
                {course.type && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#565959]">Mode</dt>
                    <dd className="font-medium text-[#0f1111] capitalize">{course.type}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-[#565959]">Next batch</dt>
                  <dd className="font-medium text-[#0f1111] text-right">
                    {nextBatch ? formatDate(nextBatch.startDate) : 'To be announced'}
                  </dd>
                </div>
                {nextBatch && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#565959]">Seats left</dt>
                    <dd className="font-bold text-[#067d62]">{nextBatch.seatsAvailable}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-6">
                {nextBatch ? (
                  <EnrollButton course={course} batch={nextBatch} />
                ) : (
                  <p className="text-sm text-[#565959]">No open batches right now. Check back soon.</p>
                )}
              </div>

              {batches.length > 1 && (
                <a href="#batches" className="block mt-3 text-center text-sm text-[#007185] hover:text-[#c7511f] hover:underline">
                  See all {batches.length} batches
                </a>
              )}
            </div>

            {/* Related products (desktop) */}
            {products.length > 0 && (
              <div className="mt-6">
                <CourseProducts products={products} perPage={2} />
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* ───────── MOBILE STICKY BAR ───────── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#e7e7e7] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <div className="min-w-0">
          <p className="text-lg font-bold text-[#0f1111] leading-none">
            <span className="text-xs font-normal">Rs.</span> {price.toLocaleString()}
          </p>
          {nextBatch && (
            <p className="text-xs text-[#565959] mt-1 truncate">Starts {formatDate(nextBatch.startDate)}</p>
          )}
        </div>
        <a
          href="#batches"
          className="shrink-0 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-medium text-sm rounded-full px-5 py-2.5"
        >
          {batches.length ? 'Choose batch' : 'View batches'}
        </a>
      </div>
    </div>
  );
}
