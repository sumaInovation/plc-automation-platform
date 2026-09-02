import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/shop/AddToCartButton';
import ReviewSection from '@/components/shop/ReviewSection';
import ProductGallery from '@/components/shop/ProductGallery';
import ShareButtons from '@/components/shop/ShareButtons';
import { ogImageUrl } from '@/lib/utils';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return { title: 'Product Not Found' };

  return {
    title: `${product.name} | PLC Automation`,
    description: product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      images: product.images?.[0]
  ? [{ url: ogImageUrl(product.images[0]), width: 1200, height: 630 }]
  : [],
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
    .lean();

  if (!product) return null;
  return JSON.parse(JSON.stringify(product));
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params; // Next.js 16 — params async
  const product = await getProduct(slug);

  if (!product) {
    notFound(); // 404 page එක auto-render කරනවා
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
          <ProductGallery images={product.images} productName={product.name} />
        <div>
         <p className="text-sm text-blue-600 font-medium mb-2">{product.category?.name}</p>
<h1 className="text-2xl font-bold mb-2">{product.name}</h1>

{product.reviewCount > 0 && (
  <div className="flex items-center gap-1 mb-2">
    <span className="text-amber-500">★</span>
    <span className="text-sm font-medium">{product.avgRating}</span>
    <span className="text-sm text-slate-400">({product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''})</span>
  </div>
)}

<p className="text-gray-500 text-sm mb-4">SKU: {product.sku}</p>

<div className="flex items-baseline gap-3 mb-4">
  <p className="text-3xl font-bold">Rs. {product.price.toLocaleString()}</p>
  {product.compareAtPrice && product.compareAtPrice > product.price && (
    <>
      <p className="text-lg text-slate-400 line-through">Rs. {product.compareAtPrice.toLocaleString()}</p>
      <span className="bg-rose-100 text-rose-700 text-sm font-bold px-2 py-0.5 rounded-full">
        -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
      </span>
    </>
  )}
</div>

          <p className="text-gray-700 mb-6">{product.description}</p>

           <AddToCartButton product={product} />
           <div className="mt-4">
  <ShareButtons
    url={`https://sumaautomation.lk/shop/product/${product.slug}`}
    title={product.name}
  />
</div>

          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="mt-8 border-t pt-6">
              <h2 className="font-semibold mb-3">Specifications</h2>
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(product.specs).map(([key, value]) => (
                    <tr key={key} className="border-b">
                      <td className="py-2 text-gray-500 capitalize">{key}</td>
                      <td className="py-2 font-medium">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ReviewSection targetType="product" targetId={product._id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}