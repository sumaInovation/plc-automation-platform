import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/shop/AddToCartButton';
import ReviewSection from '@/components/shop/ReviewSection';
import ProductGallery from '@/components/shop/ProductGallery';
import ShareButtons from '@/components/shop/ShareButtons';
import { ogImageUrl } from '@/lib/utils';
import AddToQuoteButton from '@/components/shop/AddToQuoteButton';
import ProductCard from '@/components/shop/ProductCard';
import ProductTabs from '@/components/shop/ProductTabs';
import Link from 'next/link';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: `${product.name} | Suma Automation`,
    description: product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      images: product.images?.[0] ? [{ url: ogImageUrl(product.images[0]), width: 1200, height: 630 }] : [],
      url: `https://sumaautomation.lk/shop/product/${slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description?.slice(0, 160),
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

async function getProduct(slug) {
  await connectDB();
  const product = await Product.findOne({ slug, isActive: true })
    .populate('category', 'name slug')
    .populate('relatedProducts', 'name slug price images stock_qty avgRating reviewCount compareAtPrice')
    .lean();
  if (!product) return null;
  return JSON.parse(JSON.stringify(product));
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const inStock = (product.stock_qty ?? 0) > 0;
  const lowStock = (product.stock_qty ?? 0) > 0 && (product.stock_qty ?? 0) < 10;

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <div className="max-w-[1280px] mx-auto px-4 pt-4">
        <nav className="flex items-center gap-2 text-[13px] text-slate-500">
          <Link href="/" className="hover:text-slate-800">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-slate-800">Shop</Link>
          <span>/</span>
          <Link href={`/shop/category/${product.category?.slug}`} className="hover:text-slate-800">
            {product.category?.name || 'Category'}
          </Link>
          <span>/</span>
          <span className="text-slate-800 truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-0 bg-white rounded-[24px] shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden">
          <div className="p-4 md:p-6 lg:border-r border-slate-100">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          <div className="p-5 md:p-8 flex flex-col">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> 100% Genuine
              </span>
              <Link href={`/shop/category/${product.category?.slug}`} className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100 hover:bg-blue-100">
                {product.category?.name}
              </Link>
              {discount > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[11px] font-bold">-{discount}% OFF</span>
              )}
            </div>

            <h1 className="text-[22px] md:text-[26px] font-bold leading-tight text-slate-900 tracking-tight">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400 text-[14px]">
                  {'★★★★★'.split('').map((s, i) => (
                    <span key={i} className={i < Math.round(product.avgRating || 0) ? '' : 'text-slate-200'}>★</span>
                  ))}
                </div>
                <span className="text-[13px] font-semibold text-slate-800">
                  {product.avgRating ? product.avgRating.toFixed(1) : '0.0'}
                </span>
                <span className="text-[13px] text-slate-500">({product.reviewCount || 0} reviews)</span>
              </div>
              <span className="w-px h-4 bg-slate-200 hidden sm:block" />
              <span className="text-[12px] text-slate-500">SKU: <span className="font-mono font-medium text-slate-700">{product.sku}</span></span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${inStock ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {inStock ? (lowStock ? `Low Stock - ${product.stock_qty} left` : `In Stock - ${product.stock_qty}+ available`) : 'Out of Stock'}
              </span>
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-[32px] font-extrabold tracking-tight text-slate-900">
                  Rs. {product.price.toLocaleString()}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <>
                    <span className="text-[16px] text-slate-400 line-through font-medium">
                      Rs. {product.compareAtPrice.toLocaleString()}
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-rose-100 text-rose-700 text-[12px] font-bold">
                      Save Rs. {(product.compareAtPrice - product.price).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
              <p className="text-[12px] text-slate-500 mt-1">Inclusive of all taxes • Free delivery over Rs. 25,000</p>
            </div>

            <div className="mt-6 space-y-3">
              <AddToCartButton product={product} />
              <div className="grid grid-cols-2 gap-3">
                <AddToQuoteButton product={product} />
                <button className="h-11 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition">
                  ♡ Wishlist
                </button>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <span className="text-[12px] text-slate-500 font-medium">Share:</span>
              <ShareButtons url={`https://sumaautomation.lk/shop/product/${product.slug}`} title={product.name} />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2">
              {[
                { icon: '🚚', t: 'Island-wide Delivery', s: '2-4 days' },
                { icon: '🛡', t: 'Warranty', s: '1 Year' },
                { icon: '💬', t: 'Expert Support', s: '24/7 Help' },
              ].map((b) => (
                <div key={b.t} className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-center">
                  <div className="text-[16px]">{b.icon}</div>
                  <div className="text-[11px] font-semibold text-slate-800 mt-1">{b.t}</div>
                  <div className="text-[10px] text-slate-500">{b.s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ProductTabs product={product} />

        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="mt-6 bg-white rounded-[20px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-[18px] text-slate-900">Related Products</h2>
              <Link href="/shop" className="text-[13px] font-semibold text-blue-600 hover:text-blue-700">View all →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.relatedProducts.map((rp) => (
                <ProductCard key={rp._id} product={rp} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 bg-white rounded-[20px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6 md:p-8">
          <h2 className="font-bold text-[18px] text-slate-900 mb-5">Customer Reviews</h2>
          <ReviewSection targetType="product" targetId={product._id} />
        </div>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 flex items-center gap-3 z-50 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
          <div className="flex-1">
            <div className="text-[11px] text-slate-500">Total</div>
            <div className="font-bold text-[16px]">Rs. {product.price.toLocaleString()}</div>
          </div>
          <div className="flex-1">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
