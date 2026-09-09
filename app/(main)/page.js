import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Course from '@/models/Course';
import Link from 'next/link';
import ProductCard from '@/components/shop/ProductCard';
import CourseCard from '@/components/courses/CourseCard';
import LadderDivider from '@/components/layout/LadderDivider';

async function getHomeData() {
  await connectDB();

  const prioritySlugs = ['dev-board','plc','sensor','module','robot-kits-chassis','motor-actuator','single-board-computer','display-led'];
  const latestProductSlugs = ['dev-board', 'plc']; // Latest eke enna ona 2 witharak

  const allCatsRaw = await Category.find({}).lean();
  
  const latestCatIds = allCatsRaw
    .filter(c => latestProductSlugs.includes(c.slug))
    .map(c => c._id);

  const [products, courses] = await Promise.all([
    Product.find({ 
      isActive: true, 
      stock_qty: { $gt: 0 },
      category: { $in: latestCatIds }  // Dev Board + PLC witharak
    })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),
    Course.find({ isActive: true }).sort({ createdAt: -1 }).limit(3).lean(),
  ]);

  const sortedCategories = allCatsRaw.sort((a, b) => {
    const aIdx = prioritySlugs.indexOf(a.slug);
    const bIdx = prioritySlugs.indexOf(b.slug);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.name.localeCompare(b.name);
  }).slice(0, 8);

  return JSON.parse(JSON.stringify({ products, categories: sortedCategories, courses }));
}


export default async function HomePage() {
  const { products, categories, courses } = await getHomeData();

  return (
    <div>
     {/* HERO */}
<section className="relative overflow-hidden bg-[#131B22] text-white">
  <div className="max-w-7xl mx-auto px-6 pt-10 pb-12 md:py-28 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
    <div>
      <h1 className="font-[family-name:var(--font-display)] text- md:text-5xl font-semibold leading-tight mb-3 md:mb-4">
        Build the automation
        <br />
        you were trained for.
      </h1>
      <p className="font-[family-name:var(--font-geist-mono)] text- md:text-xs tracking-widest text-[#F5A623] uppercase mb-4 md:mb-6">
        Sri Lanka's PLC, Robotics & Automation Store
      </p>
      <p className="text-slate-300 text- md:text-lg mb-6 md:mb-8 max-w-md leading-relaxed">
        PLCs, drives, sensors and passive components — plus hands-on PLC & Robotics
        courses for university students, school leavers and working engineers.
      </p>
      <div className="flex flex-wrap gap-3 md:gap-4">
        <Link
          href="/shop"
          className="bg-[#F5A623] text-[#131B22] font-semibold px-5 md:px-6 py-3 rounded-lg hover:bg-[#e0951a] transition-colors text-sm md:text-base"
        >
          Shop Components
        </Link>
        <Link
          href="/courses"
          className="border border-slate-500 text-white font-semibold px-5 md:px-6 py-3 rounded-lg hover:border-slate-300 transition-colors text-sm md:text-base"
        >
          Explore Courses
        </Link>
      </div>
      <p className="mt-3 md:mt-4 text-xs text-slate-400">✓ Island wide delivery • Bank transfer accepted</p>
    </div>

    {/* Signature — animated ladder logic diagram - desktop only */}
    <div className="hidden md:flex justify-center opacity-90">
      <svg width="320" height="220" viewBox="0 0 320 220">
        <line x1="20" y1="10" x2="20" y2="210" stroke="#2C6E9E" strokeWidth="3" />
        <line x1="300" y1="10" x2="300" y2="210" stroke="#2C6E9E" strokeWidth="3" />
        <line x1="20" y1="50" x2="120" y2="50" stroke="#475569" strokeWidth="2" />
        <line x1="112" y1="42" x2="112" y2="58" stroke="#F5A623" strokeWidth="2.5" />
        <line x1="128" y1="42" x2="128" y2="58" stroke="#F5A623" strokeWidth="2.5">
          <animate attributeName="stroke" values="#F5A623;#3F9142;#F5A623" dur="2.4s" repeatCount="indefinite" />
        </line>
        <line x1="120" y1="50" x2="300" y2="50" stroke="#475569" strokeWidth="2" />
        <circle cx="260" cy="50" r="10" fill="none" stroke="#3F9142" strokeWidth="2.5">
          <animate attributeName="stroke" values="#475569;#3F9142;#475569" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <line x1="20" y1="110" x2="140" y2="110" stroke="#475569" strokeWidth="2" />
        <line x1="132" y1="102" x2="132" y2="118" stroke="#64748B" strokeWidth="2.5" />
        <line x1="148" y1="102" x2="148" y2="118" stroke="#64748B" strokeWidth="2.5" />
        <line x1="140" y1="110" x2="300" y2="110" stroke="#475569" strokeWidth="2" />
        <circle cx="260" cy="110" r="10" fill="none" stroke="#475569" strokeWidth="2.5" />
        <line x1="20" y1="170" x2="100" y2="170" stroke="#475569" strokeWidth="2" />
        <line x1="92" y1="162" x2="92" y2="178" stroke="#64748B" strokeWidth="2.5" />
        <line x1="108" y1="162" x2="108" y2="178" stroke="#64748B" strokeWidth="2.5" />
        <line x1="100" y1="170" x2="300" y2="170" stroke="#475569" strokeWidth="2" />
        <circle cx="260" cy="170" r="10" fill="none" stroke="#475569" strokeWidth="2.5" />
      </svg>
    </div>
  </div>
</section>

      {/* TRUST BAR - LOCAL */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-bold text-">✓ Island Wide Delivery</p>
            <p className="text- text-slate-500">2-3 working days</p>
          </div>
          <div>
            <p className="font-bold text-">✓ Real PLC Hardware</p>
            <p className="text- text-slate-500">Siemens / Mitsubishi</p>
          </div>
          <div>
            <p className="font-bold text-">✓ Bank Transfer</p>
            <p className="text- text-slate-500">No card needed</p>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-8">
          Shop by category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.length === 0 ? (
            <p className="text-slate-500 col-span-full text-sm">Categories coming soon.</p>
          ) : (
            categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/shop?category=${cat.slug}`}
                className="border border-slate-200 rounded-lg p-4 text-center hover:border-[#2C6E9E] hover:shadow-sm transition-all bg-white group"
              >
                <p className="font-medium text-sm group-hover:text-[#2C6E9E]">{cat.name}</p>
              </Link>
            ))
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        <LadderDivider />
      </div>

      {/* FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-between items-end mb-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
            Latest components
          </h2>
          <Link href="/shop" className="text-sm text-[#2C6E9E] font-medium hover:underline">
            View all →
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-slate-500 text-sm">No products yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      <div className="max-w-7xl mx-auto px-6">
        <LadderDivider />
      </div>

      {/* COURSES */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-between items-end mb-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
            PLC &amp; Robotics training
          </h2>
          <Link href="/courses" className="text-sm text-[#2C6E9E] font-medium hover:underline">
            View all →
          </Link>
        </div>

        {courses.length === 0 ? (
          <p className="text-slate-500 text-sm">Courses coming soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* WHO WE TRAIN */}
      <section className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-8">
            Built for
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <p className="font-[family-name:var(--font-geist-mono)] text-xs text-[#F5A623] uppercase mb-2">University</p>
              <p className="text-slate-600 text-sm">Engineering undergraduates getting hands-on with real PLC hardware before their first job.</p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-geist-mono)] text-xs text-[#F5A623] uppercase mb-2">School</p>
              <p className="text-slate-600 text-sm">Technical college and A/L students exploring automation as a career path.</p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-geist-mono)] text-xs text-[#F5A623] uppercase mb-2">Employees</p>
              <p className="text-slate-600 text-sm">Working technicians and engineers upskilling on modern PLC and robotics systems.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / TRUST BAND */}
      <section className="bg-[#131B22] text-white">
        <div className="max-w-7xl mx-auto px-6 py-14 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-1">
              Island wide delivery • Pay by bank transfer.
            </h3>
            <p className="text-slate-400 text-sm">Simple checkout — upload your slip, we confirm within one business day.</p>
          </div>
          <Link
            href="/shop"
            className="bg-[#F5A623] text-[#131B22] font-semibold px-6 py-3 rounded-lg hover:bg-[#e0951a] transition-colors whitespace-nowrap"
          >
            Start Shopping
          </Link>
        </div>
      </section>
    </div>
  );
}