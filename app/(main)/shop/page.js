import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import ProductCard from '@/components/shop/ProductCard';

async function getProducts(categorySlug) {
  await connectDB();
  const filter = { isActive: true };

  if (categorySlug) {
    const category = await Category.findOne({ slug: categorySlug });
    if (category) filter.category = category._id;
  }

  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(products));
}

export default async function ShopPage({ params }) {
  const products = await getProducts(params.categorySlug);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shop</h1>

      {products.length === 0 ? (
        <p className="text-gray-500">No products available yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}