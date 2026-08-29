'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCategoryPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm({ ...form, name });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const slug = form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, slug }),
    });

    const data = await res.json();

    if (!data.success) {
      setError(data.error);
      setLoading(false);
      return;
    }

    router.push('/admin/products/new');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Category</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text" placeholder="Category Name" required value={form.name}
          onChange={handleNameChange} className="w-full border p-2 rounded"
        />
        <textarea
          placeholder="Description (optional)" rows={3} value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border p-2 rounded"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300"
        >
          {loading ? 'Creating...' : 'Create Category'}
        </button>
      </form>
    </div>
  );
}