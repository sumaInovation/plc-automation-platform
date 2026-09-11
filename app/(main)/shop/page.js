import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Link from 'next/link';
import Image from 'next/image';
import AddToCartButton from '@/components/shop/AddToCartButton';

const PAGE_SIZE = 24;

async function getProducts(searchParams) {
  await connectDB();
  const { search, category, minPrice, maxPrice, sort, page } = searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  let filter = { isActive: true };

  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) filter.category = cat._id;
  }

  if (search) {
    const esc = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: { $regex: new RegExp(esc, 'i') } },
      { sku: { $regex: new RegExp(esc, 'i') } },
      { slug: { $regex: new RegExp(esc, 'i') } }
    ];
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { price: 1 };
  if (sort === 'price_desc') sortOption = { price: -1 };
  if (sort === 'featured') sortOption = { avgRating: -1 };

  const [products, totalCount, allCategories] = await Promise.all([
    Product.find(filter).populate('category', 'name slug').sort(sortOption).skip((currentPage - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
    Product.countDocuments(filter),
    Category.find().sort({ name: 1 }).select('name slug').lean()
  ]);

  return {
    products: JSON.parse(JSON.stringify(products)),
    allCategories: JSON.parse(JSON.stringify(allCategories)),
    totalCount,
    totalPages: Math.ceil(totalCount / PAGE_SIZE),
    currentPage
  };
}

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  await connectDB();

  let title = 'Shop All Products';
  let description = 'Browse PLC & Automation components, sensors, and controllers — island-wide delivery in Sri Lanka.';

  if (params.category) {
    const cat = await Category.findOne({ slug: params.category }).lean();
    if (cat) {
      title = cat.name;
      description = `Shop ${cat.name} — PLC & Automation components from Suma Automation, Sri Lanka.`;
    }
  } else if (params.search) {
    title = `Search results for "${params.search}"`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: params.category
        ? `https://sumaautomation.lk/shop?category=${params.category}`
        : 'https://sumaautomation.lk/shop',
    },
    robots: (params.search || params.page)
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const { products, allCategories, totalCount, totalPages, currentPage } = await getProducts(params);

  const linkWith = (p) => {
    const usp = new URLSearchParams(params);
    Object.entries(p).forEach(([k, v]) => { if (!v) usp.delete(k); else usp.set(k, String(v)); });
    return `/shop?${usp.toString()}`;
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="border-y border-[#ddd] px-4 py-2 text- flex justify-between max-w- mx-auto">
        <div>
          {totalCount > 0? `1-${Math.min(PAGE_SIZE, totalCount)} of ${totalCount} results for` : 'No results for'}{' '}
          <span className="font-bold text-[#c45500]">"{params.search || params.category || 'all products'}"</span>
        </div>
        <div className="hidden md:flex gap-1 text-">
          <Link href={linkWith({ sort: '', page: '' })} className={`px-3 py-1 border rounded- ${!params.sort? 'bg-white shadow font-bold border-black' : 'bg-[#f0f2f2] border-[#d5d9d9]'}`}>Featured</Link>
          <Link href={linkWith({ sort: 'price_asc', page: '' })} className={`px-3 py-1 border rounded- ${params.sort==='price_asc'? 'bg-white shadow font-bold border-black' : 'bg-[#f0f2f2] border-[#d5d9d9]'}`}>Low to High</Link>
          <Link href={linkWith({ sort: 'price_desc', page: '' })} className={`px-3 py-1 border rounded- ${params.sort==='price_desc'? 'bg-white shadow font-bold border-black' : 'bg-[#f0f2f2] border-[#d5d9d9]'}`}>High to Low</Link>
        </div>
      </div>

      <div className="max-w- mx-auto flex">
        {/* Left */}
        <div className="hidden lg:block w- p-4 border-r border-[#ddd] shrink-0">
          <h3 className="font-bold text-">Department</h3>
          <div className="text- mt-2 space-y-1">
            <Link href="/shop" className={`block ${!params.category? 'font-bold bg-[#f0f2f2] px-1 rounded' : 'hover:text-[#c45500]'}`}>All Departments</Link>
            {allCategories.map(c => (
              <Link key={c.slug} href={linkWith({ category: c.slug, page: '' })} className={`block ${params.category===c.slug? 'font-bold bg-[#f0f2f2] px-1 rounded' : 'pl-3 hover:text-[#c45500] hover:underline'}`}>{c.name}</Link>
            ))}
          </div>
        </div>

        {/* Right - FIXED IMAGE SIZE */}
        <div className="flex-1">
          

          {products.length===0? (
            <div className="p-10 text-center text-[#565959]">No products match "{params.search}"</div>
          ) : (
            <div className="divide-y divide-[#ddd]">
             {products.map(product => (
  <div key={product._id} className="flex gap-5 p-5 hover:bg-[#fafafa] group">
    <Link
      href={`/shop/product/${product.slug}`}
      className="bg-[#f7f7f7] rounded- flex items-center justify-center overflow-hidden shrink-0"
      style={{ width: '210px', height: '210px', minWidth: '210px', minHeight: '210px', maxWidth: '210px', maxHeight: '210px' }}
    >
      <Image
  src={product.images?.[0] || '/no-image.png'}
  alt={product.name}
  width={190}
  height={190}
  style={{ width: '190px', height: '190px', objectFit: 'contain', display: 'block' }}
/>
    </Link>

    <div className="flex-1 min-w-0">
      <Link href={`/shop/product/${product.slug}`} className="text- leading-[1.3] text-[#0f1111] group-hover:text-[#c45500] line-clamp-3">
        {product.name} {product.sku? `, ${product.sku}` : ''}
      </Link>

      {/* REAL REVIEWS HERE */}
      <div className="flex items-center gap-1 mt-1.5 text-sm">
        {product.reviewCount > 0? (
          <>
            <span className="font-bold">{product.avgRating?.toFixed(1)}</span>
            <span className="text-[#ffa41c] text- leading-none">
              {"★".repeat(Math.round(product.avgRating))}{"☆".repeat(5 - Math.round(product.avgRating))}
            </span>
            <Link href={`/shop/product/${product.slug}#reviews`} className="text-[#007185] hover:text-[#c45500] hover:underline">
              ({product.reviewCount})
            </Link>
          </>
        ) : (
          <span className="text-[#565959] text-xs">No reviews yet - be first!</span>
        )}
      </div>
<div className="mt-2 text-[#0f1111]">
  <sup className="text- font-normal">LKR</sup>
  <span className="text- font-bold ml-1">{product.price.toLocaleString()}</span>
</div>
     
      <div className="text- text-[#565959] mt-1">Island wide delivery available</div>
      <div className="text- text-[#067d62] mt-1">{product.stock_qty>0? 'In Stock' : 'Out of Stock'}</div>
        
        <div className="w-full lg:w-1/8">
  <div className="[&>button]:!w-full [&>button]:!bg-[#ffd814] [&>button]:!text-[#0f1111] [&>button]:!border [&>button]:!border-[#fcd200] [&>button]:hover:!bg-[#f7ca00] [&>button]:!rounded- [&>button]:!h-auto [&>button]:!min-h- [&>button]:!py-1.5 [&>button]:!text- [&>button]:!whitespace-nowrap">
    <AddToCartButton product={product} />
  </div>
</div>


    </div>
  </div>
))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-6 border-t">
              {currentPage>1 && <Link href={linkWith({ page: currentPage-1 })} className="border px-4 py-2 rounded- text- bg-white">← Prev</Link>}
              <span className="py-2 text-">Page {currentPage} of {totalPages}</span>
              {currentPage<totalPages && <Link href={linkWith({ page: currentPage+1 })} className="border px-4 py-2 rounded- text- bg-white">Next →</Link>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}