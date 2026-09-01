'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ShopFilters({ categories }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  // Search input එකට debounce එකක් — type කරන හැම letter එකකටම query fire කරන්නෙ නෑ
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  function updateURL(overrides = {}) {
    const params = new URLSearchParams();

    const values = {
      search, category, minPrice, maxPrice, sort,
      ...overrides,
    };

    if (values.search) params.set('search', values.search);
    if (values.category) params.set('category', values.category);
    if (values.minPrice) params.set('minPrice', values.minPrice);
    if (values.maxPrice) params.set('maxPrice', values.maxPrice);
    if (values.sort && values.sort !== 'newest') params.set('sort', values.sort);

    router.push(`/shop?${params.toString()}`);
  }

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    updateURL({ category: e.target.value });
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    updateURL({ sort: e.target.value });
  };

  const handlePriceApply = () => {
    updateURL({ minPrice, maxPrice });
  };

  const handleClear = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    router.push('/shop');
  };

  const hasActiveFilters = search || category || minPrice || maxPrice || sort !== 'newest';

 return (
  <div className="mb-8 space-y-3">
    {/* Search — full width always */}
    <input
      type="text"
      placeholder="Search products (e.g. PLC, motor, sensor)..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full border p-2.5 rounded-lg text-sm"
    />

    {/* Category + Sort — stack on mobile, side by side on tablet+ */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <select
        value={category}
        onChange={handleCategoryChange}
        className="w-full border p-2.5 rounded-lg text-sm"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c._id} value={c.slug}>{c.name}</option>
        ))}
      </select>

      <select
        value={sort}
        onChange={handleSortChange}
        className="w-full border p-2.5 rounded-lg text-sm"
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>

    {/* Price range — stack on mobile */}
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-slate-500 w-full sm:w-auto">Price:</span>
      <input
        type="number"
        placeholder="Min"
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
        className="w-24 border p-2 rounded text-sm"
      />
      <span className="text-slate-400">—</span>
      <input
        type="number"
        placeholder="Max"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        className="w-24 border p-2 rounded text-sm"
      />
      <button
        onClick={handlePriceApply}
        className="text-sm bg-slate-100 px-3 py-2 rounded hover:bg-slate-200"
      >
        Apply
      </button>

      {hasActiveFilters && (
        <button
          onClick={handleClear}
          className="text-sm text-red-500 hover:underline ml-auto sm:ml-2"
        >
          Clear all
        </button>
      )}
    </div>
  </div>
);
}