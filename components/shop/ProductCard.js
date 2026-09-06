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

  const inStock = (product.stock_qty ?? 0) > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all group">
      <Link href={`/shop/product/${product.slug}`}>
        <div className="aspect-square bg-[#fbfbfc] relative">
          {hasDiscount && (
            <span className="absolute top-2 left-2 bg-rose-500 text-white text-[11px] font-bold px-2 py-1 rounded-full z-10">
              -{discountPercent}%
            </span>
          )}
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">No image</div>
          )}
        </div>

        <div className="p-3">
          <h3 className="font-medium text-[13px] leading-snug text-slate-900 line-clamp-2 min-h-[34px]">{product.name}</h3>
          <div className="mt-2">
            <span className="text-[16px] font-bold text-slate-900">Rs. {product.price.toLocaleString()}</span>
            {hasDiscount && (
              <span className="text-[11px] text-slate-400 line-through ml-1.5">Rs. {product.compareAtPrice.toLocaleString()}</span>
            )}
          </div>
          {product.stock_qty > 0 && product.stock_qty < 5 && (
            <p className="text-[11px] text-[#CC0C39] mt-1">Only {product.stock_qty} left</p>
          )}
        </div>
      </Link>

      {/* Amazon style button only */}
      <div className="px-3 pb-3">
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`w-full h-[32px] rounded-full text-[13px] font-medium border shadow-sm transition active:scale-[0.98] ${
            inStock
              ? 'bg-[#FFD814] hover:bg-[#F7CA00] border-[#FCD200] text-[#0F1111]'
              : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
