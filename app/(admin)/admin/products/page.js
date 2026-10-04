'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import MultiImageUpload from '@/components/admin/MultiImageUpload';

const PAGE_SIZE = 30;

const getUrl = (img) => (typeof img === 'string' ? img : img?.url);

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Quick image modal state
  const [imgProduct, setImgProduct] = useState(null);
  const [modalImages, setModalImages] = useState([]);
  const [imgSaving, setImgSaving] = useState(false);
  const [imgError, setImgError] = useState('');

  // Inline price/stock edit state
  const [edits, setEdits] = useState({}); // { [id]: { price, stock_qty } }
  const [rowSavingId, setRowSavingId] = useState(null);
  const [rowError, setRowError] = useState({}); // { [id]: 'message' }

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
      setEdits({}); // page/filter wenas wenakota unsaved edits clear karanawa
      setRowError({});
    }
    setLoading(false);
  }, [currentPage, search, categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter]);

  // ---- Inline price/stock ----
  const getField = (p, field) =>
    edits[p._id]?.[field] !== undefined ? edits[p._id][field] : p[field];

  const isDirty = (p) => {
    const e = edits[p._id];
    if (!e) return false;
    return (
      (e.price !== undefined && String(e.price) !== String(p.price)) ||
      (e.stock_qty !== undefined && String(e.stock_qty) !== String(p.stock_qty))
    );
  };

  const handleEdit = (id, field, value) => {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
    setRowError((prev) => ({ ...prev, [id]: '' }));
  };

  const cancelEdit = (id) => {
    setEdits((prev) => {
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
    setRowError((prev) => ({ ...prev, [id]: '' }));
  };

  const saveRow = async (p) => {
    const price = Number(getField(p, 'price'));
    const stock_qty = Number(getField(p, 'stock_qty'));

    if (
      getField(p, 'price') === '' ||
      getField(p, 'stock_qty') === '' ||
      Number.isNaN(price) ||
      Number.isNaN(stock_qty) ||
      price < 0 ||
      stock_qty < 0
    ) {
      setRowError((prev) => ({ ...prev, [p._id]: 'Enter valid numbers (0 or more)' }));
      return;
    }

    setRowSavingId(p._id);
    try {
      const res = await fetch(`/api/admin/products/${p._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price, stock_qty }),
      });
      const data = await res.json();

      if (!data.success) {
        setRowError((prev) => ({ ...prev, [p._id]: data.error || 'Failed to save' }));
      } else {
        setProducts((prev) =>
          prev.map((x) => (x._id === p._id ? { ...x, price, stock_qty } : x))
        );
        cancelEdit(p._id);
      }
    } catch (err) {
      setRowError((prev) => ({ ...prev, [p._id]: err.message }));
    }
    setRowSavingId(null);
  };

  // ---- Quick image modal ----
  const openImageModal = (p) => {
    setImgProduct(p);
    setModalImages(p.images || []);
    setImgError('');
  };

  const closeImageModal = () => {
    if (imgSaving) return;
    setImgProduct(null);
    setModalImages([]);
    setImgError('');
  };

  const saveImages = async () => {
    setImgSaving(true);
    setImgError('');
    try {
      const res = await fetch(`/api/admin/products/${imgProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: modalImages }),
      });
      const data = await res.json();
      if (!data.success) {
        setImgError(data.error || 'Failed to save images');
        setImgSaving(false);
        return;
      }

      setProducts((prev) =>
        prev.map((p) =>
          p._id === imgProduct._id ? { ...p, images: modalImages } : p
        )
      );
      setImgSaving(false);
      setImgProduct(null);
      setModalImages([]);
    } catch (err) {
      setImgError(err.message);
      setImgSaving(false);
    }
  };

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
            {products.map((p) => {
              const count = p.images?.length || 0;
              const thumb = getUrl(p.images?.[0]);
              const dirty = isDirty(p);
              const rowSaving = rowSavingId === p._id;

              return (
                <div key={p._id} className="border rounded-lg p-4">
                  <div className="flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded border shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded border bg-slate-50 text-slate-300 flex items-center justify-center text-xs shrink-0">
                          No img
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {p.name} {!p.isActive && <span className="text-xs text-red-500">(inactive)</span>}
                        </p>
                        <p className="text-sm text-gray-500">{p.category?.name} — SKU: {p.sku}</p>
                        <span
                          className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                            count === 0
                              ? 'bg-red-50 text-red-600'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          📷 {count} image{count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-end gap-3 shrink-0 flex-wrap">
                      {/* Price */}
                      <div>
                        <label className="block text-xs text-slate-500 mb-0.5">Price (Rs.)</label>
                        <input
                          type="number"
                          min="0"
                          value={getField(p, 'price')}
                          onChange={(e) => handleEdit(p._id, 'price', e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && dirty && saveRow(p)}
                          className="w-28 border p-1.5 rounded text-sm"
                        />
                      </div>

                      {/* Stock */}
                      <div>
                        <label className="block text-xs text-slate-500 mb-0.5">Stock</label>
                        <input
                          type="number"
                          min="0"
                          value={getField(p, 'stock_qty')}
                          onChange={(e) => handleEdit(p._id, 'stock_qty', e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && dirty && saveRow(p)}
                          className="w-20 border p-1.5 rounded text-sm"
                        />
                      </div>

                      {dirty && (
                        <div className="flex gap-1 pb-0.5">
                          <button
                            type="button"
                            onClick={() => saveRow(p)}
                            disabled={rowSaving}
                            className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded hover:bg-blue-700 disabled:bg-gray-300"
                          >
                            {rowSaving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={() => cancelEdit(p._id)}
                            disabled={rowSaving}
                            className="text-sm text-slate-500 px-2 py-1.5"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      <div className="flex gap-3 pb-1.5">
                        <button
                          type="button"
                          onClick={() => openImageModal(p)}
                          className="text-sm text-green-600 hover:underline"
                        >
                          + Images
                        </button>
                        <Link href={`/admin/products/${p._id}/edit`} className="text-sm text-blue-600 hover:underline">
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>

                  {rowError[p._id] && (
                    <p className="text-red-500 text-xs mt-2 text-right">{rowError[p._id]}</p>
                  )}
                </div>
              );
            })}
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

      {/* Quick Image Modal */}
      {imgProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          <div
            className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-auto p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold">Product Images</h2>
            <p className="text-sm text-slate-500 mb-4 truncate">
              {imgProduct.name} — SKU: {imgProduct.sku}
            </p>

            <MultiImageUpload images={modalImages} setImages={setModalImages} />

            {imgError && <p className="text-red-500 text-sm mt-3">{imgError}</p>}

            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={saveImages}
                disabled={imgSaving}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300"
              >
                {imgSaving ? 'Saving...' : 'Save Images'}
              </button>
              <button
                type="button"
                onClick={closeImageModal}
                disabled={imgSaving}
                className="px-5 border rounded-lg text-sm text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}