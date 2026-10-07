'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/shop/ProductCard';

/**
 * products : random pool picked on the server (e.g. 8)
 * perPage  : how many cards to show at a time (2 in sidebar, 4 on mobile)
 * interval : ms between rotations (0 = no rotation)
 */
export default function CourseProducts({ products = [], perPage = 2, interval = 8000, title = 'Gear for this course' }) {
  const pages = [];
  for (let i = 0; i < products.length; i += perPage) {
    const chunk = products.slice(i, i + perPage);
    // last page short ah unoth, patala idan fill karanawa
    while (chunk.length < perPage && products.length > perPage) chunk.push(products[(i + chunk.length) % products.length]);
    pages.push(chunk);
  }

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (pages.length < 2 || !interval || paused) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let swap;
    const t = setInterval(() => {
      if (reduce) return setIndex((i) => (i + 1) % pages.length);
      setVisible(false);
      swap = setTimeout(() => {
        setIndex((i) => (i + 1) % pages.length);
        setVisible(true);
      }, 250);
    }, interval);
    return () => {
      clearInterval(t);
      clearTimeout(swap);
    };
  }, [pages.length, interval, paused]);

  if (!products.length) return null;

  const go = (dir) => {
    setIndex((i) => (i + dir + pages.length) % pages.length);
    setVisible(true);
  };

  return (
    <section
      aria-label={title}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-base sm:text-lg font-bold text-[#0f1111]">{title}</h2>
        <div className="flex items-center gap-1">
          {pages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous products"
                className="w-7 h-7 rounded-full border border-[#d5d9d9] text-[#0f1111] hover:bg-[#f7f8f8] flex items-center justify-center"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next products"
                className="w-7 h-7 rounded-full border border-[#d5d9d9] text-[#0f1111] hover:bg-[#f7f8f8] flex items-center justify-center"
              >
                ›
              </button>
            </>
          )}
        </div>
      </div>

      <div className={`grid grid-cols-2 gap-3 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {pages[index].map((p, i) => (
          <ProductCard key={`${p._id}-${i}`} product={p} />
        ))}
      </div>

      <Link href="/shop" className="block mt-3 text-sm text-center text-[#007185] hover:text-[#c7511f] hover:underline">
        Browse all products
      </Link>
    </section>
  );
}
