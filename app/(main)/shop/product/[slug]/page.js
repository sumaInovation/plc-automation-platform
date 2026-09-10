import connectDB from '@/lib/db';
import Product from '@/models/Product';
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

async function getProduct(slug) {
  await connectDB();
  const product = await Product.findOne({ slug, isActive: true })
  .populate('category', 'name slug')
  .populate('relatedProducts', 'name slug price images stock_qty avgRating reviewCount compareAtPrice')
  .lean();
  if (!product) return null;
  return JSON.parse(JSON.stringify(product));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) {
    return {
      title: 'Product Not Found',
      robots: { index: false, follow: false },
    };
  }
  return {
    title: product.name,
    description: product.description?.slice(0, 160),
    alternates: {
      canonical: `https://sumaautomation.lk/shop/product/${slug}`,
    },
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

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const discount = product.compareAtPrice && product.compareAtPrice > product.price
  ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;
  const inStock = (product.stock_qty?? 0) > 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
     image: product.images?.length > 0
    ? product.images
    : ['https://sumaautomation.lk/no-image.png'],
    
    description: product.description?.replace(/<[^>]*>/g, '').slice(0, 500),
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Suma Automation',
    },
    ...(product.reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.avgRating,
        reviewCount: product.reviewCount,
      },
    }),
  
    offers: {
      '@type': 'Offer',
      url: `https://sumaautomation.lk/shop/product/${product.slug}`,
      priceCurrency: 'LKR',
      price: product.price,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'LKR',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'LK',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 4, unitCode: 'DAY' },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'LK',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },

  };


  return (
    <div className="min-h-screen bg-white">
      

         <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-[#f5f6f6] border-b border-[#ddd]">
        <div className="max-w- mx-auto px-4 py-2 flex items-center gap-2 text- text-[#565959] overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-[#c45500] hover:underline">Home</Link><span>›</span>
          <Link href="/shop" className="hover:text-[#c45500] hover:underline">Shop</Link><span>›</span>
          <Link href={`/shop/category/${product.category?.slug}`} className="hover:text-[#c45500] hover:underline">{product.category?.name}</Link><span>›</span>
          <span className="text-[#c45500] font-medium truncate max-w-">{product.name}</span>
        </div>
      </div>

      <div className="max-w- mx-auto px-4 py-5">
        <div className="grid lg:grid-cols-[600px_1fr_300px] xl:grid-cols-[650px_1fr_340px] gap-6">

          {/* LEFT - Gallery - IMAGE LOKU */}
          <div className="lg:sticky lg:top- h-fit">
            <div className="bg-white rounded- border border-[#e7e7e7] p-2">
              <ProductGallery images={product.images} productName={product.name} />
            </div>

            {/* SHARE - Gallery yata - Desktop + Mobile dekama */}
            <div className="mt-3 flex items-center gap-3">
              <ShareButtons url={`https://sumaautomation.lk/shop/product/${product.slug}`} title={product.name} />
            </div>

            {/* MOBILE BUY BOX - Image ekata passe, About ekata kalin */}
            <div className="lg:hidden mt-4 border border-[#d5d9d9] rounded- p-4 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <div className="flex items-baseline justify-between">
                <div className="text- text-[#0f1111] leading-none">
                  <sup className="text-">Rs.</sup>{product.price.toLocaleString()}
                </div>
                <div className={`text- font-bold ${inStock? 'text-[#067d62]' : 'text-[#cc0c39]'}`}>
                  {inStock? 'In Stock' : 'Out of Stock'}
                </div>
              </div>
              {product.compareAtPrice > product.price && (
                <div className="text- text-[#565959] mt-1">
                  M.R.P.: <span className="line-through">Rs. {product.compareAtPrice.toLocaleString()}</span>
                </div>
              )}
              <div className="mt-4 space-y-2">
                <div className="[&>button]:w-full [&>button]:!bg-[#ffd814] [&>button]:!text-[#0f1111] [&>button]:!border-[#fcd200] [&>button]:hover:!bg-[#f7ca00] [&>button]:!rounded- [&>button]:!h- [&>button]:!text-">
                  <AddToCartButton product={product} />
                </div>
                <div className="[&>button]:w-full [&>button]:!bg-[#ffa41c] [&>button]:!text-[#0f1111] [&>button]:!border-[#ff8f00] [&>button]:hover:!bg-[#fa8900] [&>button]:!rounded- [&>button]:!h- [&>button]:!text-">
                  <AddToQuoteButton product={product} />
                </div>
                <div className="text- text-[#067d62] flex items-center justify-center gap-1 mt-2">🔒 Secure transaction</div>
              </div>
            </div>
          </div>

          {/* MIDDLE - Details */}
          <div className="min-w-0">
            <h1 className="text- lg:text- leading-[1.3] font-[400] text-[#0f1111]">
              {product.name}
            </h1>

            <div className="mt-2 flex items-center gap-2 border-b border-[#e7e7e7] pb-3">
              <div className="flex items-center">
                <span className="text- mr-1">{product.avgRating?.toFixed(1) || '0.0'}</span>
                <div className="flex text-[#ffa41c] text- leading-none">
                  {'★★★★★'.split('').map((s, i) => (
                    <span key={i} className={i < Math.round(product.avgRating || 0)? '' : 'text-[#ddd]'}>★</span>
                  ))}
                </div>
              </div>
              <span className="text- text-[#007185] hover:text-[#c45500] hover:underline cursor-pointer">{product.reviewCount || 0} ratings</span>
            </div>

            <div className="hidden lg:block mt-3">
              {discount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="bg-[#cc0c39] text-white text- px-2 py-0.5 rounded-sm">-{discount}%</span>
                  <span className="text- font-light text-[#cc0c39]"><sup className="text-">Rs.</sup>{product.price.toLocaleString()}</span>
                </div>
              )}
              {!discount && (
                <div className="text- text-[#0f1111]"><sup className="text-">Rs.</sup>{product.price.toLocaleString()}</div>
              )}
              {product.compareAtPrice > product.price && (
                <div className="text- text-[#565959] mt-1">
                  M.R.P.: <span className="line-through">Rs. {product.compareAtPrice.toLocaleString()}</span>
                  <div className="text- text-[#0f1111] mt-1">Inclusive of all taxes</div>
                  <div className="text- font-bold text-[#067d62]">You Save: Rs. {(product.compareAtPrice - product.price).toLocaleString()} ({discount}%)</div>
                </div>
              )}
            </div>

            <div className="mt-4 text- leading-[1.5] text-[#0f1111] space-y-1 border-t border-[#e7e7e7] pt-4">
              <div className="flex gap-2"><span className="font-bold">SKU:</span><span>{product.sku}</span></div>
              <div className="flex gap-2">
                <span className="font-bold">Availability:</span>
                <span className={inStock? 'text-[#067d62] font-bold' : 'text-[#cc0c39] font-bold'}>
                  {inStock? `In Stock - ${product.stock_qty} left` : 'Out of Stock'}
                </span>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="text- font-bold text-[#0f1111] mb-2">About this item</h3>
              <div className="text- text-[#0f1111] leading-[1.6]">
                {product.description? (
                  <div dangerouslySetInnerHTML={{ __html: product.description.slice(0, 600) }} />
                ) : (
                  <ul className="list-disc pl-5 space-y-1">
                    <li>100% Genuine Product from Suma Automation</li>
                    <li>1 Year Warranty & Expert Support</li>
                    <li>Island-wide Delivery in 2-4 days</li>
                  </ul>
                )}
              </div>
            </div>
                 <div className="mt-6 border-t border-[#e7e7e7] pt-5">
              <ReviewSection targetType="product" targetId={product._id} />
            </div>
             
          </div>

          {/* RIGHT - DESKTOP BUY BOX - ORIGINAL SUPIRI ONE */}
          <div className="hidden lg:block lg:sticky lg:top- h-fit">
            <div className="border border-[#d5d9d9] rounded- p-4 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <div className="text- text-[#0f1111] leading-none">
                <sup className="text-">Rs.</sup>{product.price.toLocaleString()}
              </div>
              <div className="text- text-[#565959] mt-1">Inclusive of all taxes</div>
              <div className="mt-3 text-">
                <div className="flex items-center gap-2 text-[#067d62]"><span className="text-">✓</span> <span className="font-bold">prime</span> FREE delivery available</div>
                <div className="text-[#0f1111] mt-1">Delivery to <span className="font-bold">Sri Lanka</span></div>
                {inStock? <div className="text- text-[#067d62] mt-3">In Stock</div> : <div className="text- text-[#cc0c39] mt-3">Out of Stock</div>}
                {inStock && <div className="text- text-[#565959]">Sold by <span className="text-[#007185]">Suma Automation</span> and Fulfilled by Suma.</div>}
              </div>
              <div className="mt-4">
                <label className="text- text-[#0f1111]">Quantity:</label>
                <select className="mt-1 w-full bg-[#f0f2f2] border border-[#d5d9d9] rounded- px-2 py-1.5 text-">
                  <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>
                </select>
              </div>
              <div className="mt-4 space-y-2">
                <div className="[&>button]:w-full [&>button]:!bg-[#ffd814] [&>button]:!text-[#0f1111] [&>button]:!border-[#fcd200] [&>button]:hover:!bg-[#f7ca00] [&>button]:!rounded- [&>button]:!h- [&>button]:!text-">
                  <AddToCartButton product={product} />
                </div>
                <div className="[&>button]:w-full [&>button]:!bg-[#ffa41c] [&>button]:!text-[#0f1111] [&>button]:!border-[#ff8f00] [&>button]:hover:!bg-[#fa8900] [&>button]:!rounded- [&>button]:!h- [&>button]:!text-">
                  <AddToQuoteButton product={product} />
                </div>
                <div className="text- text-[#067d62] flex items-center gap-1 mt-2"><span>🔒</span> Secure transaction</div>
              </div>
              <div className="mt-4 text- space-y-2 text-[#0f1111] border-t border-[#e7e7e7] pt-3">
                <div className="flex justify-between"><span className="text-[#565959]">Ships from</span><span>Suma Automation</span></div>
                <div className="flex justify-between"><span className="text-[#565959]">Sold by</span><span className="text-[#007185]">Suma Automation</span></div>
                <div className="flex justify-between"><span className="text-[#565959]">Returns</span><span className="text-[#007185]">30-day refund</span></div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-">Add gift options</span>
              </div>
            </div>
            <div className="mt-3 border border-[#d5d9d9] rounded- p-3 flex gap-3">
              <div className="text-">🛡️</div>
              <div className="text- leading-[1.4]">
                <div className="font-bold">1 Year Warranty</div>
                <div className="text-[#067d62]">Expert Support • Genuine Product</div>
              </div>
            </div>
          </div>
        </div>

        <ProductTabs product={product} />

        {product.relatedProducts?.length > 0 && (
          <div className="mt-8 border-t border-[#e7e7e7] pt-6">
            <h2 className="font-bold text- text-[#0f1111] mb-4">Customers who viewed this item also viewed</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {product.relatedProducts.map((rp) => <ProductCard key={rp._id} product={rp} />)}
            </div>
          </div>
        )}

      
      </div>
    </div>
  );
}