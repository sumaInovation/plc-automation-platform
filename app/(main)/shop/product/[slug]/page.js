import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/shop/AddToCartButton';

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
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <span className="text-gray-400">No image</span>
          )}
        </div>

        <div>
          <p className="text-sm text-blue-600 font-medium mb-2">{product.category?.name}</p>
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-500 text-sm mb-4">SKU: {product.sku}</p>
          <p className="text-3xl font-bold mb-4">Rs. {product.price.toLocaleString()}</p>

          <p className={`text-sm mb-4 ${product.stock_qty > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock_qty > 0 ? `✓ ${product.stock_qty} in stock` : '✗ Out of stock'}
          </p>

          <p className="text-gray-700 mb-6">{product.description}</p>

           <AddToCartButton product={product} />

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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}