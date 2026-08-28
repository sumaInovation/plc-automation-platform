import Link from 'next/link';

export default function ProductCard({ product }) {
  return (
    <Link
      href={`/shop/product/${product.slug}`}
      className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
    >
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400 text-sm">No image</span>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-blue-600 font-medium mb-1">
          {product.category?.name}
        </p>
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-lg font-bold text-gray-900">
          Rs. {product.price.toLocaleString()}
        </p>
        <p className={`text-xs mt-1 ${product.stock_qty > 0 ? 'text-green-600' : 'text-red-500'}`}>
          {product.stock_qty > 0 ? `${product.stock_qty} in stock` : 'Out of stock'}
        </p>
      </div>
    </Link>
  );
}