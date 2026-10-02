'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MultiImageUpload from '@/components/admin/MultiImageUpload';

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    slug: '',
    sku: '',
    category: '',
    description: '',
    price: '',
    compareAtPrice: '',
    stock_qty: '',
    brand: '',
    isActive: true,
  });
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);

  // Related products state
  const [relatedItems, setRelatedItems] = useState([]); // { _id, name, sku }
  const [relatedSearch, setRelatedSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Hard delete state
  const [confirmText, setConfirmText] = useState('');
  const [showHardDelete, setShowHardDelete] = useState(false);

  // Load categories + product
  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/admin/categories'),
          fetch(`/api/admin/products/${id}`),
        ]);
        const catData = await catRes.json();
        const prodData = await prodRes.json();

        if (catData.success) setCategories(catData.categories);

        if (prodData.success) {
          const p = prodData.product;
          setForm({
            name: p.name,
            slug: p.slug,
            sku: p.sku,
            category: p.category?._id || p.category || '',
            description: p.description,
            price: p.price,
            compareAtPrice: p.compareAtPrice ?? '',
            stock_qty: p.stock_qty,
            brand: p.brand || '',
            isActive: p.isActive,
          });
          setImages(p.images || []);

          const specsArray = p.specs
            ? Object.entries(p.specs).map(([key, value]) => ({ key, value }))
            : [];
          setSpecs(specsArray.length > 0 ? specsArray : [{ key: '', value: '' }]);

          // relatedProducts populate wela enawa (objects)
          setRelatedItems(
            (p.relatedProducts || []).map((r) => ({
              _id: r._id,
              name: r.name,
              sku: r.sku,
            }))
          );
        } else {
          setError(prodData.error || 'Failed to load product');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // Related products: debounced server-side search
  useEffect(() => {
    const q = relatedSearch.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/admin/products?search=${encodeURIComponent(q)}&limit=8`,
          { signal: controller.signal }
        );
        const data = await res.json();
        if (data.success) {
          const picked = new Set(relatedItems.map((p) => p._id));
          setSearchResults(
            data.products.filter((p) => p._id !== id && !picked.has(p._id))
          );
        }
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [relatedSearch, relatedItems, id]);

  const addRelated = (p) => {
    setRelatedItems([...relatedItems, { _id: p._id, name: p.name, sku: p.sku }]);
    setRelatedSearch('');
  };
  const removeRelated = (rid) =>
    setRelatedItems(relatedItems.filter((p) => p._id !== rid));

  // Specs
  const handleSpecChange = (index, field, value) => {
    const updated = [...specs];
    updated[index][field] = value;
    setSpecs(updated);
  };
  const addSpecRow = () => setSpecs([...specs, { key: '', value: '' }]);
  const removeSpecRow = (index) => setSpecs(specs.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const specsObject = {};
      specs.forEach((s) => {
        if (s.key.trim()) specsObject[s.key.trim()] = s.value.trim();
      });

      const payload = {
        ...form,
        price: Number(form.price),
        // empty nam null yawanawa, server eka eka DB eken ain karanawa
        compareAtPrice: form.compareAtPrice !== '' ? Number(form.compareAtPrice) : null,
        stock_qty: Number(form.stock_qty),
        images,
        specs: specsObject,
        relatedProducts: relatedItems.map((p) => p._id),
      };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error);
        setSaving(false);
        return;
      }

      router.push('/admin/products');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Product එක deactivate කරන්නද? Shop page එකේ පේන්නෙ නැති වෙනවා.')) return;

    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) router.push('/admin/products');
    else setError(data.error);
  };

  const handleHardDelete = async () => {
    if (confirmText !== 'DELETE') {
      setError('Type DELETE exactly to confirm permanent deletion.');
      return;
    }

    const res = await fetch(`/api/admin/products/${id}?hard=true`, { method: 'DELETE' });
    const data = await res.json();

    if (!data.success) {
      setError(data.error);
      return;
    }

    router.push('/admin/products');
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">SKU</label>
            <input
              type="text"
              required
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Brand</label>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border p-2 rounded"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Price / Compare-at / Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price (Rs.)</label>
            <input
              type="number"
              required
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Compare-at Price (Rs.)
            </label>
            <input
              type="number"
              min="0"
              value={form.compareAtPrice}
              onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
              className="w-full border p-2 rounded"
            />
            <p className="text-xs text-slate-400 mt-1">Optional, shows as strikethrough</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock Quantity</label>
            <input
              type="number"
              required
              min="0"
              value={form.stock_qty}
              onChange={(e) => setForm({ ...form, stock_qty: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Product Images</label>
          <MultiImageUpload images={images} setImages={setImages} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Specifications</label>
          {specs.map((spec, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g. voltage"
                value={spec.key}
                onChange={(e) => handleSpecChange(i, 'key', e.target.value)}
                className="flex-1 border p-2 rounded text-sm"
              />
              <input
                type="text"
                placeholder="e.g. 24V"
                value={spec.value}
                onChange={(e) => handleSpecChange(i, 'value', e.target.value)}
                className="flex-1 border p-2 rounded text-sm"
              />
              <button
                type="button"
                onClick={() => removeSpecRow(i)}
                className="text-red-500 px-2"
              >
                ×
              </button>
            </div>
          ))}
          <button type="button" onClick={addSpecRow} className="text-blue-600 text-sm">
            + Add Spec
          </button>
        </div>

        {/* Related Products */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Related Products{' '}
            <span className="text-slate-400 font-normal">— optional</span>
          </label>

          {relatedItems.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {relatedItems.map((p) => (
                <span
                  key={p._id}
                  className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-sm px-2 py-1 rounded"
                >
                  {p.name}
                  <button
                    type="button"
                    onClick={() => removeRelated(p._id)}
                    className="text-blue-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="relative">
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={relatedSearch}
              onChange={(e) => setRelatedSearch(e.target.value)}
              className="w-full border p-2 rounded text-sm"
            />
            {searchResults.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border rounded shadow mt-1 max-h-56 overflow-auto">
                {searchResults.map((p) => (
                  <li
                    key={p._id}
                    onClick={() => addRelated(p)}
                    className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer flex justify-between"
                  >
                    <span>{p.name}</span>
                    <span className="text-slate-400">{p.sku}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active (visible in shop)
        </label>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={handleDeactivate}
            className="px-6 bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-100"
          >
            Deactivate
          </button>
        </div>

        <div className="border-t pt-4 mt-4">
          {!showHardDelete ? (
            <button
              type="button"
              onClick={() => setShowHardDelete(true)}
              className="text-sm text-red-600 hover:underline"
            >
              Permanently delete this product (cannot be undone)
            </button>
          ) : (
            <div className="border border-red-300 bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-800 font-medium mb-2">
                ⚠️ This will PERMANENTLY delete this product from the database. This cannot
                be undone.
              </p>
              <p className="text-xs text-red-600 mb-3">
                Type <strong>DELETE</strong> below to confirm. If this product has any order
                history, deletion will be blocked automatically — use "Deactivate" instead in
                that case.
              </p>
              <input
                type="text"
                placeholder="Type DELETE to confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full border border-red-300 p-2 rounded mb-3 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleHardDelete}
                  disabled={confirmText !== 'DELETE'}
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Permanently Delete
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowHardDelete(false);
                    setConfirmText('');
                  }}
                  className="text-sm text-slate-500 px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
