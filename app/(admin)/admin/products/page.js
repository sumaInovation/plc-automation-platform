import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Link from 'next/link';

async function getProducts() {
  await connectDB();
  const products = await Product.find().populate('category', 'name').sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(products));
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          + Add Product
        </Link>
      </div>

      <div className="space-y-2">
        {products.map((p) => (
          <div key={p._id} className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-gray-500">{p.category?.name} — SKU: {p.sku}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">Rs. {p.price.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Stock: {p.stock_qty}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}