import connectDB from '@/lib/db';
import Course from '@/models/Course';
import CoursesClient from './CoursesClient';
// courses/page.jsx - top එකේ දාන්න
export const dynamic = 'force-dynamic';
const SITE_URL = 'https://www.sumaautomation.lk';

export const metadata = {
  title: 'PLC & Robotics Courses in Sri Lanka | Suma Automation',
  description:
    'Explore PLC programming, industrial automation, and robotics courses in Sri Lanka. Online and physical batches for beginners to advanced learners.',
  keywords: [
    'PLC courses Sri Lanka',
    'Robotics course Sri Lanka',
    'industrial automation training',
    'online PLC course',
    'PLC programming course',
  ],
  alternates: {
    canonical: `${SITE_URL}/courses`,
  },
  openGraph: {
    title: 'PLC & Robotics Courses in Sri Lanka | Suma Automation',
    description:
      'Explore PLC programming, industrial automation, and robotics courses in Sri Lanka. Online and physical batches for beginners to advanced learners.',
    url: `${SITE_URL}/courses`,
    type: 'website',
    siteName: 'Suma Automation',
  },
};

async function getCourses() {
  await connectDB();
  const courses = await Course.find({ isActive: true })
    .select('title slug type level price duration image targetAudience')
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(courses));
}

export default async function CoursesPage() {
  const courses = await getCourses();

  // ✅ ItemList schema - Google ekata "meka course collection ekak" kiyanawa
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: courses.map((course, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/courses/${course.slug}`,
      name: course.title,
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Courses', item: `${SITE_URL}/courses` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* ✅ Server eken render wena initial courses - Google ekata crawl karanna puluwan */}
      <CoursesClient initialCourses={courses} />
    </>
  );
}