import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Link from 'next/link';

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
  return { category: JSON.parse(JSON.stringify(category)), products: JSON.parse(JSON.stringify(products)), allCats: JSON.parse(JSON.stringify(allCats)), totalCount, totalPages: Math.ceil(totalCount / PAGE_SIZE), currentPage };
}

export default async function Page({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const data = await getData(slug, sp);
  if (!data) return <div className="p-10">Category not found</div>;
  const { category, products, allCats, totalCount, totalPages, currentPage } = data;

  const linkWith = (p) => {
    const usp = new URLSearchParams(sp);
    Object.entries(p).forEach(([k, v]) => { if (!v) usp.delete(k); else usp.set(k, String(v)); });
    return `/shop/category/${slug}?${usp.toString()}`;
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="border-y border-[#ddd] px-4 py-2 text- flex justify-between max-w- mx-auto">
        <div>1-24 of {totalCount} results for <span className="text-[#c45500] font-bold">"{category.name}"</span></div>
        <div className="flex gap-2 text-">
          <Link href={linkWith({ sort: '', page: '' })} className={`px-3 py-1 border rounded ${!sp?.sort? 'bg-white shadow font-bold border-black' : 'bg-[#f0f2f2]'}`}>Featured</Link>
          <Link href={linkWith({ sort: 'price_asc', page: '' })} className={`px-3 py-1 border rounded ${sp?.sort==='price_asc'? 'bg-white shadow font-bold border-black' : 'bg-[#f0f2f2]'}`}>Price: Low to High</Link>
          <Link href={linkWith({ sort: 'price_desc', page: '' })} className={`px-3 py-1 border rounded ${sp?.sort==='price_desc'? 'bg-white shadow font-bold border-black' : 'bg-[#f0f2f2]'}`}>Price: High to Low</Link>
        </div>
      </div>

      <div className="max-w- mx-auto flex">
        <div className="hidden lg:block w- p-4 border-r border-[#ddd] shrink-0">
          <h3 className="font-bold text-">Department</h3>
          <div className="text- mt-2 space-y-1">
            <Link href="/shop" className="block hover:underline">All Departments</Link>
            {allCats.map(c => (
              <Link key={c.slug} href={`/shop/category/${c.slug}`} className={`block py-0.5 ${c.slug===slug? 'font-bold bg-[#f0f2f2] px-1 rounded' : 'pl-3 hover:text-[#c45500]'}`}>{c.name}</Link>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="p-4 border-b">
            <h1 className="font-bold">Results</h1>
            <p className="text- text-[#565959]">Check each product page for other buying options.</p>
            <p className="font-bold mt-2">{category.name} - {totalCount} products</p>
          </div>

          <div className="divide-y divide-[#ddd]">
            {products.map(p => (
              <div key={p._id} className="flex gap-4 p-4">
                {/* FIXED IMAGE BOX */}
                <Link href={`/shop/product/${p.slug}`} style={{ width: '200px', height: '200px', minWidth: '200px', minHeight: '200px', maxWidth: '200px', maxHeight: '200px', background: '#f7f7f7', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '8px' }}>
                  <img
                    src={p.images?.[0]}
                    alt={p.name}
                    style={{ width: '180px', height: '180px', maxWidth: '180px', maxHeight: '180px', objectFit: 'contain', display: 'block' }}
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/shop/product/${p.slug}`} className="text- hover:text-[#c45500] leading-[1.3] block line-clamp-2">{p.name}</Link>
                  <div className="flex items-center gap-1 mt-1 text-"><span className="text-[#ffa41c]">★★★★★</span><span className="text-[#007185]">({p.reviewCount||4})</span></div>
                  <div className="text- mt-2 font-light"><sup className="text-">LKR</sup>{p.price.toLocaleString()}</div>
                  <div className="text- text-[#067d62] mt-1">{p.stock_qty>0? `In Stock - Only ${p.stock_qty} left` : 'Out of Stock'}</div>
                  <div className="text- text-[#565959]">FREE delivery</div>
                  <Link href={`/shop/product/${p.slug}`} className="mt-3 inline-block bg-[#ffd814] hover:bg-[#f7ca00] border border-[#fcd200] rounded- px-6 py-1.5 text-">Add to cart</Link>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4">
              {currentPage>1 && <Link href={linkWith({ page: currentPage-1 })} className="border px-3 py-1 rounded text-">Prev</Link>}
              <span className="text- py-1">Page {currentPage} of {totalPages}</span>
              {currentPage<totalPages && <Link href={linkWith({ page: currentPage+1 })} className="border px-3 py-1 rounded text-">Next</Link>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}