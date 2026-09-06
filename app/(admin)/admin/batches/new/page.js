'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function NewBatchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');
  const courseTitle = searchParams.get('courseTitle');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    batchName: '',
    startDate: '',
    endDate: '',
    schedule: '',
    location: '',
    seatsTotal: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = { ...form, course: courseId, seatsTotal: Number(form.seatsTotal) };

    const res = await fetch('/api/admin/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!data.success) {
      setError(data.error);
      setLoading(false);
      return;
    }

    router.push('/admin/courses');
  };

  if (!courseId) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Course එකක් select කරලා නෑ — <a href="/admin/courses/new" className="text-blue-600 underline">Course අලුතෙන් හදන්න</a>.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Add Batch</h1>
      <p className="text-gray-500 text-sm mb-6">For: {courseTitle}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text" placeholder="Batch Name (e.g. January 2027 Batch)" required
          value={form.batchName} onChange={(e) => setForm({ ...form, batchName: e.target.value })}
          className="w-full border p-2 rounded"
        />

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date" required value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date" value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <input
          type="text" placeholder="Schedule (e.g. Every Saturday, 9AM-12PM)"
          value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })}
          className="w-full border p-2 rounded"
        />

        <input
          type="text" placeholder="Location / Venue"
          value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
          className="w-full border p-2 rounded"
        />

        <div>
          <label className="block text-sm font-medium mb-1">Total Seats</label>
          <input
            type="number" required min="1" value={form.seatsTotal}
            onChange={(e) => setForm({ ...form, seatsTotal: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300"
        >
          {loading ? 'Creating...' : 'Create Batch'}
        </button>
      </form>
    </div>
  );
}

export default function NewBatchPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-8">Loading...</div>}>
      <NewBatchForm />
    </Suspense>
  );
}