'use client';

import { useState } from 'react';
import { useQuoteStore } from '@/store/quoteStore';

export default function AddToQuoteButton({ product }) {
  const addItem = useQuoteStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className="text-sm text-[#2C6E9E] font-medium border border-[#2C6E9E] px-4 py-2 rounded-lg hover:bg-[#2C6E9E] hover:text-white transition-colors"
      >
        {added ? '✓ Added to Quote' : '+ Add to Quote'}
      </button>

      {added && (
        <a href="/quote-cart" className="block text-xs text-[#2C6E9E] underline mt-1">
          View quote cart →
        </a>
      )}
    </div>
  );
}