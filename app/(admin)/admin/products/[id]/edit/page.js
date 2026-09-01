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
    name: '', slug: '', sku: '', category: '', description: '',
    price: '', stock_qty: '', brand: '', isActive: true,
  });
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);
  const [existingImage, setExistingImage] = useState(null);

  useEffect(() => {
    async function fetchData() {
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
    name: p.name, slug: p.slug, sku: p.sku,
    category: p.category, description: p.description,
    price: p.price, stock_qty: p.stock_qty,
    brand: p.brand || '', isActive: p.isActive,
  });
  setImages(p.images || []); // ⚠️ existing images array එකම load කරගන්නවා

  const specsArray = p.specs
    ? Object.entries(p.specs).map(([key, value]) => ({ key, value }))
    : [{ key: '', value: '' }];
  setSpecs(specsArray.length > 0 ? specsArray : [{ key: '', value: '' }]);
}


      setLoading(false);
    }
    fetchData();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
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
  setSaving(true);
  setError('');

  try {
    const specsObject = {};
    specs.forEach((s) => { if (s.key.trim()) specsObject[s.key.trim()] = s.value.trim(); });

    const payload = {
      ...form,
      price: Number(form.price),
      stock_qty: Number(form.stock_qty),
      images, // කෙලින්ම state එකෙන්ම
      specs: specsObject,
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
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border p-2 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">SKU</label>
            <input type="text" required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Brand</label>
            <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full border p-2 rounded" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border p-2 rounded">
            <option value="">Select category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border p-2 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price (Rs.)</label>
            <input type="number" required min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock Quantity</label>
            <input type="number" required min="0" value={form.stock_qty} onChange={(e) => setForm({ ...form, stock_qty: e.target.value })} className="w-full border p-2 rounded" />
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
              <input type="text" placeholder="e.g. voltage" value={spec.key} onChange={(e) => handleSpecChange(i, 'key', e.target.value)} className="flex-1 border p-2 rounded text-sm" />
              <input type="text" placeholder="e.g. 24V" value={spec.value} onChange={(e) => handleSpecChange(i, 'value', e.target.value)} className="flex-1 border p-2 rounded text-sm" />
              <button type="button" onClick={() => removeSpecRow(i)} className="text-red-500 px-2">×</button>
            </div>
          ))}
          <button type="button" onClick={addSpecRow} className="text-blue-600 text-sm">+ Add Spec</button>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          Active (visible in shop)
        </label>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={handleDeactivate} className="px-6 bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-100">
            Deactivate
          </button>
        </div>
      </form>
    </div>
  );
}