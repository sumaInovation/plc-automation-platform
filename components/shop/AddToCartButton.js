'use client';

import { useCartStore } from '@/store/cartStore';
import { useState } from 'react';

export default function AddToCartButton({ product }) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      onClick={handleClick}
      disabled={product.stock_qty === 0}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
    >
      {added ? '✓ Added!' : 'Add to Cart'}
    </button>
  );
}