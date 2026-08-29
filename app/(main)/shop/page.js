import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import ProductCard from '@/components/shop/ProductCard';
import ShopFilters from '@/components/shop/ShopFilters';

async function getProducts(searchParams) {
  await connectDB();
  const { search, category, minPrice, maxPrice, sort } = searchParams;

  const filter = { isActive: true };

  if (search) {
    filter.name = { $regex: search, $options: 'i' }; // case-insensitive partial match
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

  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .sort(sortOption)
    .lean();

  return JSON.parse(JSON.stringify(products));
}

async function getCategories() {
  await connectDB();
  const categories = await Category.find().sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(categories));
}

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shop</h1>

      <ShopFilters categories={categories} />

      <p className="text-sm text-slate-500 mb-4">{products.length} product{products.length !== 1 ? 's' : ''} found</p>

      {products.length === 0 ? (
        <p className="text-gray-500">No products match your filters.</p>
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