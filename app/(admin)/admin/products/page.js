'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const PAGE_SIZE = 30;

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    }
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: currentPage,
      limit: PAGE_SIZE,
    });
    if (search) params.set('search', search);
    if (categoryFilter) params.set('category', categoryFilter);

    const res = await fetch(`/api/admin/products?${params.toString()}`);
    const data = await res.json();
    if (data.success) {
      setProducts(data.products);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
    }
    setLoading(false);
  }, [currentPage, search, categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Search/filter වෙනස් වුනොත් page 1කට reset කරනවා
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          + Add Product
        </Link>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border p-2.5 rounded-lg text-sm"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border p-2.5 rounded-lg text-sm sm:w-56"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-slate-500 mb-4">
        {totalCount.toLocaleString()} product{totalCount !== 1 ? 's' : ''} found
      </p>

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-slate-500">No products match your search.</p>
      ) : (
        <>
          <div className="space-y-2 mb-6">
            {products.map((p) => (
              <div key={p._id} className="border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {p.name} {!p.isActive && <span className="text-xs text-red-500">(inactive)</span>}
                  </p>
                  <p className="text-sm text-gray-500">{p.category?.name} — SKU: {p.sku}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="font-bold">Rs. {p.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Stock: {p.stock_qty}</p>
                  </div>
                  <Link href={`/admin/products/${p._id}/edit`} className="text-sm text-blue-600 hover:underline">
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 flex-wrap">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm border rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              <span className="text-sm text-slate-500 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm border rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}