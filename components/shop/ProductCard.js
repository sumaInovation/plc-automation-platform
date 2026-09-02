'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';

export default function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white relative">
      <Link href={`/shop/product/${product.slug}`}>
        <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
          {hasDiscount && (
            <span className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
              -{discountPercent}%
            </span>
          )}
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 text-sm">No image</span>
          )}
        </div>

        <div className="p-4">
          <p className="text-xs text-blue-600 font-medium mb-1">{product.category?.name}</p>
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>

          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-1">
              <span className="text-amber-500 text-sm">★</span>
              <span className="text-xs text-slate-600">{product.avgRating}</span>
              <span className="text-xs text-slate-400">({product.reviewCount})</span>
            </div>
          )}

          <div className="flex items-baseline gap-2">
            <p className="text-lg font-bold text-gray-900">Rs. {product.price.toLocaleString()}</p>
            {hasDiscount && (
              <p className="text-sm text-slate-400 line-through">Rs. {product.compareAtPrice.toLocaleString()}</p>
            )}
          </div>

          <p className={`text-xs mt-1 ${product.stock_qty > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock_qty > 0 ? `${product.stock_qty} in stock` : 'Out of stock'}
          </p>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          disabled={product.stock_qty === 0}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}