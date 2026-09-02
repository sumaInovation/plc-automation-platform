'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MultiImageUpload from '@/components/admin/MultiImageUpload';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
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
  });

  const [specs, setSpecs] = useState([{ key: '', value: '' }]);

  useEffect(() => {
    async function fetchCategories() {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    }
    fetchCategories();
  }, []);

  // Product name එකෙන් auto-generate slug එක
  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setForm({ ...form, name, slug });
  };

 

  const handleSpecChange = (index, field, value) => {
    const updated = [...specs];
    updated[index][field] = value;
    setSpecs(updated);
  };

  const addSpecRow = () => setSpecs([...specs, { key: '', value: '' }]);
  const removeSpecRow = (index) => setSpecs(specs.filter((_, i) => i !== index));

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setUploading(true);

  try {
    const specsObject = {};
    specs.forEach((s) => {
      if (s.key.trim()) specsObject[s.key.trim()] = s.value.trim();
    });

      const payload = {
  ...form,
  price: Number(form.price),
  compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined, // ⚠️
  stock_qty: Number(form.stock_qty),
  images,
  specs: specsObject,
};

    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!data.success) {
      setError(data.error);
      setUploading(false);
      return;
    }

    router.push('/admin/products');
  } catch (err) {
    setError(err.message);
    setUploading(false);
  }
};
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input
            type="text" required value={form.name} onChange={handleNameChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug (auto-generated)</label>
          <input
            type="text" required value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full border p-2 rounded bg-gray-50"
          />
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">SKU</label>
            <input
              type="text" required value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Brand</label>
            <input
              type="text" value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            required value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border p-2 rounded"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          {categories.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">
              Categories නෑ තාම — <a href="/admin/categories/new" className="underline">Category එකක් මුලින් හදන්න</a>
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            required rows={3} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-medium mb-1">Price (Rs.)</label>
    <input type="number" required min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border p-2 rounded" />
  </div>
  <div>
    <label className="block text-sm font-medium mb-1">Compare-at Price (Rs.) <span className="text-slate-400 font-normal">— optional, shows as strikethrough</span></label>
    <input type="number" min="0" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} className="w-full border p-2 rounded" />
  </div>
</div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock Quantity</label>
            <input
              type="number" required min="0" value={form.stock_qty}
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
                type="text" placeholder="e.g. voltage" value={spec.key}
                onChange={(e) => handleSpecChange(i, 'key', e.target.value)}
                className="flex-1 border p-2 rounded text-sm"
              />
              <input
                type="text" placeholder="e.g. 24V" value={spec.value}
                onChange={(e) => handleSpecChange(i, 'value', e.target.value)}
                className="flex-1 border p-2 rounded text-sm"
              />
              <button type="button" onClick={() => removeSpecRow(i)} className="text-red-500 px-2">×</button>
            </div>
          ))}
          <button type="button" onClick={addSpecRow} className="text-blue-600 text-sm">+ Add Spec</button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit" disabled={uploading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300"
        >
          {uploading ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
}