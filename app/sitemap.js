import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';

export default async function sitemap() {
  await connectDB();

  const [products, categories] = await Promise.all([
    Product.find({ isActive: true }).select('slug updatedAt').lean(),
    Category.find().select('slug').lean(),
  ]);

  const productUrls = products.map((p) => ({
    url: `https://sumaautomation.lk/shop/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoryUrls = categories.map((c) => ({
    url: `https://sumaautomation.lk/shop?category=${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [
    { url: 'https://sumaautomation.lk', changeFrequency: 'daily', priority: 1.0 },
    { url: 'https://sumaautomation.lk/shop', changeFrequency: 'daily', priority: 0.9 },
    ...categoryUrls,
    ...productUrls,
  ];
}