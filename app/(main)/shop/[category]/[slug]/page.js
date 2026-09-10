import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Link from 'next/link';
import AddToCartButton from '@/components/shop/AddToCartButton';
const PAGE_SIZE = 24;

async function getData(slug, sp) {
  await connectDB();
  const category = await Category.findOne({ slug }).lean();
  if (!category) return null;
  const currentPage = Math.max(1, Number(sp?.page) || 1);
  let filter = { isActive: true, category: category._id };
  if (sp?.search) {
    const esc = sp.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [{ name: { $regex: new RegExp(esc, 'i') } }, { sku: { $regex: new RegExp(esc, 'i') } }];
  }
  let sort = { createdAt: -1 };
  if (sp?.sort === 'price_asc') sort = { price: 1 };
  if (sp?.sort === 'price_desc') sort = { price: -1 };

  const [products, totalCount, allCats] = await Promise.all([
    Product.find(filter).populate('category', 'name slug').sort(sort).skip((currentPage - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
    Product.countDocuments(filter),
    Category.find().sort({ name: 1 }).select('name slug').lean()
  ]);
  return { 
    category: JSON.parse(JSON.stringify(category)), 
    products: JSON.parse(JSON.stringify(products)), 
    allCats: JSON.parse(JSON.stringify(allCats)), 
    totalCount, 
    totalPages: Math.ceil(totalCount / PAGE_SIZE), 
    currentPage 
  };
}

export default async function Page({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const data = await getData(slug, sp);
  if (!data) return <div className="p-10 text-center">Category not found</div>;
  const { category, products, allCats, totalCount, totalPages, currentPage } = data;

  const linkWith = (p) => {
    const usp = new URLSearchParams(sp);
    Object.entries(p).forEach(([k, v]) => { if (!v) usp.delete(k); else usp.set(k, String(v)); });
    return `/shop/category/${slug}?${usp.toString()}`;
  };

  return (
    <div className="bg-white min-h-screen">
      {/* ===== RESULTS HEADER - Responsive ===== */}
      <div className="border-y border-[#ddd] px-3 sm:px-4 py-2 text-xs sm:text-sm flex flex-col sm:flex-row justify-between gap-2 max-w-[1500px] mx-auto">
        <div className="font-medium text-[#555]">
          1-{Math.min(PAGE_SIZE, totalCount)} of {totalCount} results for{" "}
          <span className="text-[#c45500] font-bold">"{category.name}"</span>
        </div>
        
        {/* Sort Filters - Horizontal Scroll on Mobile */}
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pb-1">
          <Link 
            href={linkWith({ sort: '', page: '' })} 
            className={`px-2 sm:px-3 py-1 border rounded text-[11px] sm:text-xs whitespace-nowrap transition-all ${
              !sp?.sort ? 'bg-white shadow-sm font-bold border-black' : 'bg-[#f0f2f2] hover:bg-[#e3e6e8]'
            }`}
          >
            Featured
          </Link>
          <Link 
            href={linkWith({ sort: 'price_asc', page: '' })} 
            className={`px-2 sm:px-3 py-1 border rounded text-[11px] sm:text-xs whitespace-nowrap transition-all ${
              sp?.sort === 'price_asc' ? 'bg-white shadow-sm font-bold border-black' : 'bg-[#f0f2f2] hover:bg-[#e3e6e8]'
            }`}
          >
            Price: Low to High
          </Link>
          <Link 
            href={linkWith({ sort: 'price_desc', page: '' })} 
            className={`px-2 sm:px-3 py-1 border rounded text-[11px] sm:text-xs whitespace-nowrap transition-all ${
              sp?.sort === 'price_desc' ? 'bg-white shadow-sm font-bold border-black' : 'bg-[#f0f2f2] hover:bg-[#e3e6e8]'
            }`}
          >
            Price: High to Low
          </Link>
        </div>
      </div>

      {/* ===== MAIN CONTENT - Responsive Layout ===== */}
      <div className="max-w-[1500px] mx-auto flex flex-col lg:flex-row">
        
       

        {/* ===== PRODUCT LIST ===== */}
        <div className="flex-1 min-w-0">
         

          {/* ===== PRODUCT CARDS - Responsive Grid ===== */}
          <div className="divide-y divide-[#ddd]">
            {products.map(p => (
              <div key={p._id} className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-[#fafafa] transition-colors">
                
                {/* Product Image - Responsive */}
                <Link 
                  href={`/shop/product/${p.slug}`} 
                  className="w-full sm:w-[140px] md:w-[180px] lg:w-[200px] aspect-square bg-[#f7f7f7] flex items-center justify-center overflow-hidden rounded-lg shrink-0 mx-auto sm:mx-0"
                >
                  <img
                    src={p.images?.[0] || '/no-image.png'}
                    alt={p.name}
                    className="w-[90%] h-[90%] object-contain"
                  />
                </Link>

                {/* Product Details */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <Link 
                    href={`/shop/product/${p.slug}`} 
                    className="text-sm sm:text-base hover:text-[#c45500] leading-snug block line-clamp-2 font-medium"
                  >
                    {p.name}
                  </Link>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-center sm:justify-start gap-1 mt-1 text-xs sm:text-sm">
                    <span className="text-[#ffa41c]">★★★★★</span>
                    <span className="text-[#007185]">({p.reviewCount || 4})</span>
                  </div>
                  
                  {/* Price */}
                  <div className="text-lg sm:text-xl font-bold mt-1 text-[#B12704]">
                    LKR {p.price.toLocaleString()}
                  </div>
                  
                  {/* Stock & Delivery */}
                  <div className={`text-xs sm:text-sm mt-0.5 ${p.stock_qty > 0 ? 'text-[#067d62]' : 'text-red-500'}`}>
                    {p.stock_qty > 0 ? `✅ In Stock - ${p.stock_qty} left` : '❌ Out of Stock'}
                  </div>
                  <div className="text-[10px] sm:text-xs text-[#565959]">FREE delivery on first order</div>
                  
                  {/* Add to Cart Button */}
                    <div className="mt-2 [&>button]:!bg-[#ffd814] [&>button]:hover:!bg-[#f7ca00] [&>button]:!border [&>button]:!border-[#fcd200] [&>button]:!rounded-full [&>button]:!px-4 sm:[&>button]:!px-6 [&>button]:!py-1.5 [&>button]:!text-xs sm:[&>button]:!text-sm [&>button]:!font-medium [&>button]:!w-auto">
  <AddToCartButton product={p} />
</div>
                </div>
              </div>
            ))}
          </div>

          {/* ===== PAGINATION - Responsive ===== */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 p-4 sm:p-6">
              <Link 
                href={linkWith({ page: currentPage - 1 })} 
                className={`border px-3 py-1.5 rounded text-sm hover:bg-gray-50 transition-colors ${
                  currentPage <= 1 ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                ← Previous
              </Link>
              
              <div className="flex items-center gap-1 text-sm">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Link
                      key={pageNum}
                      href={linkWith({ page: pageNum })}
                      className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                        pageNum === currentPage
                          ? 'bg-[#ffd814] border-[#fcd200] font-bold'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
              </div>
              
              <Link 
                href={linkWith({ page: currentPage + 1 })} 
                className={`border px-3 py-1.5 rounded text-sm hover:bg-gray-50 transition-colors ${
                  currentPage >= totalPages ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                Next →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}