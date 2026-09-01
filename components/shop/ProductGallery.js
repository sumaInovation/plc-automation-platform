'use client';

import { useState } from 'react';

export default function ProductGallery({ images, productName }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No image</span>
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
        <img src={images[activeIndex]} alt={productName} className="w-full h-full object-cover" />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActiveIndex(i)}
              className={`w-16 h-16 rounded border-2 overflow-hidden ${
                i === activeIndex ? 'border-blue-500' : 'border-transparent'
              }`}
            >
              <img src={img} alt={`${productName} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}