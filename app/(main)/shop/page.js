import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import ProductCard from '@/components/shop/ProductCard';
import ShopFilters from '@/components/shop/ShopFilters';
import Link from 'next/link';

const PAGE_SIZE = 24; // එක page එකකට products 24ක් විතරයි

async function getProducts(searchParams) {
  await connectDB();
  const { search, category, minPrice, maxPrice, sort, page } = searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const filter = { isActive: true };

  if (search) {
    // ⚠️ Regex වෙනුවට $text search — index-backed, 7000+ products වලටත් fast
    filter.$text = { $search: search };
  }

  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) filter.category = cat._id;
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { price: 1 };
  if (sort === 'price_desc') sortOption = { price: -1 };

  const [products, totalCount] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip((currentPage - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    products: JSON.parse(JSON.stringify(products)),
    totalCount,
    totalPages: Math.ceil(totalCount / PAGE_SIZE),
    currentPage,
  };
}

async function getCategories() {
  await connectDB();
  const categories = await Category.find().sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(categories));
}

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const [{ products, totalCount, totalPages, currentPage }, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ]);

  // Pagination link එකකට existing filters ඔක්කොම preserve කරගන්නවා, page number එක විතරයි වෙනස් කරන්නේ
  function pageLink(pageNum) {
    const sp = new URLSearchParams(params);
    sp.set('page', pageNum);
    return `/shop?${sp.toString()}`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shop</h1>

      <ShopFilters categories={categories} />

      <p className="text-sm text-slate-500 mb-4">{totalCount.toLocaleString()} product{totalCount !== 1 ? 's' : ''} found</p>

      {products.length === 0 ? (
        <p className="text-gray-500">No products match your filters.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 flex-wrap">
              {currentPage > 1 && (
                <Link href={pageLink(currentPage - 1)} className="px-3 py-1.5 text-sm border rounded hover:bg-slate-50">
                  ← Prev
                </Link>
              )}

              <span className="text-sm text-slate-500 px-2">
                Page {currentPage} of {totalPages}
              </span>

              {currentPage < totalPages && (
                <Link href={pageLink(currentPage + 1)} className="px-3 py-1.5 text-sm border rounded hover:bg-slate-50">
                  Next →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}