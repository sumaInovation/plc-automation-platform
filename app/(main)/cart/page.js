'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useHasHydrated } from '@/hooks/useHasHydrated';

export default function CartPage() {
  const hasHydrated = useHasHydrated();
  const items = useCartStore((state) => state.items);
  const updateQty = useCartStore((state) => state.updateQty);
  const removeItem = useCartStore((state) => state.removeItem);
  const getTotal = useCartStore((state) => state.getTotal);

  if (!hasHydrated) {
    return <div className="max-w-4xl mx-auto px-4 py-8">Loading cart...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <Link href="/shop" className="text-blue-600 hover:underline">
          Continue Shopping →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={item._id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 border rounded-lg p-3 sm:p-4">
            
<div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />
              ) : (
                <span className="text-gray-400 text-xs">No image</span>
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-gray-600 text-sm">Rs. {item.price.toLocaleString()}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQty(item._id, item.qty - 1)}
                className="w-8 h-8 border rounded hover:bg-gray-100"
              >
                −
              </button>
              <span className="w-8 text-center">{item.qty}</span>
              <button
                onClick={() => updateQty(item._id, Math.min(item.qty + 1, item.stock_qty))}
                className="w-8 h-8 border rounded hover:bg-gray-100"
                disabled={item.qty >= item.stock_qty}
              >
                +
              </button>
            </div>

            <p className="font-semibold w-24 text-right">
              Rs. {(item.price * item.qty).toLocaleString()}
            </p>

            <button
              onClick={() => removeItem(item._id)}
              className="text-red-500 hover:text-red-700 text-sm ml-2"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="border-t pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-gray-600 text-sm">Total</p>
          <p className="text-2xl font-bold">Rs. {getTotal().toLocaleString()}</p>
        </div>

        <Link
          href="/checkout"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}