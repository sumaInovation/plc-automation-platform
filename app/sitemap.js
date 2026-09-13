import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Course from '@/models/Course';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sumaautomation.lk';

function getProductPriority(product) {
  let score = 0.5;
  if (product.avgRating >= 4) score += 0.15;
  else if (product.avgRating >= 3) score += 0.05;
  if (product.reviewCount >= 10) score += 0.1;
  else if (product.reviewCount >= 5) score += 0.05;
  if (product.stock_qty > 0) score += 0.1;
  if (product.price >= 10000) score += 0.05;
  else if (product.price >= 5000) score += 0.03;
  if (product.compareAtPrice && product.compareAtPrice > product.price) {
    score += 0.05;
  }
  return Math.min(Math.max(score, 0.4), 1.0);
}

export default async function sitemap() {
  await connectDB();

  const [products, categories, courses] = await Promise.all([
    Product.find({ isActive: true })
      .select('slug updatedAt price stock_qty avgRating reviewCount compareAtPrice')
      .lean(),
    Category.find({ isActive: true }).select('slug updatedAt').lean(),
    Course.find({ isActive: true }).select('slug updatedAt').lean(),
  ]);

  const productUrls = products.map((p) => ({
    url: `${BASE_URL}/shop/product/${p.slug}`,
    lastModified: p.updatedAt || new Date(),
    changeFrequency: p.stock_qty > 0 ? 'weekly' : 'monthly',
    priority: getProductPriority(p),
  }));

  const categoryUrls = categories.map((c) => ({
    url: `${BASE_URL}/shop/${c.slug}`,
    lastModified: c.updatedAt || new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // ✅ Courses - umbage core business, high priority
  const courseUrls = courses.map((c) => ({
    url: `${BASE_URL}/courses/${c.slug}`,
    lastModified: c.updatedAt || new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  const staticUrls = [
    { path: '/about', priority: 0.5 },
    { path: '/contact', priority: 0.5 },
  ].map((s) => ({
    url: `${BASE_URL}${s.path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: s.priority,
  }));

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/courses`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    ...courseUrls,
    ...categoryUrls,
    ...productUrls,
    ...staticUrls,
  ];
}