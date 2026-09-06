'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditBatchPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [bookedCount, setBookedCount] = useState(0);

  const [form, setForm] = useState({
    batchName: '', startDate: '', endDate: '', schedule: '', location: '', seatsTotal: '', status: 'upcoming',
  });

  useEffect(() => {
    async function fetchBatch() {
      const res = await fetch(`/api/admin/batches/${id}`);
      const data = await res.json();
      if (data.success) {
        const b = data.batch;
        setForm({
          batchName: b.batchName,
          startDate: b.startDate?.slice(0, 10) || '',
          endDate: b.endDate?.slice(0, 10) || '',
          schedule: b.schedule || '',
          location: b.location || '',
          seatsTotal: b.seatsTotal,
          status: b.status,
        });
        setCourseTitle(b.course?.title || '');
        setBookedCount(b.seatsTotal - b.seatsAvailable);
      }
      setLoading(false);
    }
    fetchBatch();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch(`/api/admin/batches/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, seatsTotal: Number(form.seatsTotal) }),
    });

    const data = await res.json();
    if (!data.success) {
      setError(data.error);
      setSaving(false);
      return;
    }

    router.push('/admin/courses');
  };

  const handleCancel = async () => {
    if (!confirm('Batch එක cancel කරන්නද? Enrolled students ලට visible වෙන්නෙ නෑ.')) return;
    const res = await fetch(`/api/admin/batches/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) router.push('/admin/courses');
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Edit Batch</h1>
      <p className="text-gray-500 text-sm mb-6">For: {courseTitle}</p>

      {bookedCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded-lg mb-4">
          ⚠️ {bookedCount} student{bookedCount !== 1 ? 's' : ''} already enrolled in this batch.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text" placeholder="Batch Name" required
          value={form.batchName} onChange={(e) => setForm({ ...form, batchName: e.target.value })}
          className="w-full border p-2 rounded"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full border p-2 rounded" />
          </div>
        </div>

        <input type="text" placeholder="Schedule" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} className="w-full border p-2 rounded" />
        <input type="text" placeholder="Location / Venue" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full border p-2 rounded" />

        <div>
          <label className="block text-sm font-medium mb-1">Total Seats</label>
          <input
            type="number" required min={bookedCount} value={form.seatsTotal}
            onChange={(e) => setForm({ ...form, seatsTotal: e.target.value })}
            className="w-full border p-2 rounded"
          />
          {bookedCount > 0 && (
            <p className="text-xs text-slate-500 mt-1">Minimum {bookedCount} (already booked)</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border p-2 rounded">
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-3">
          <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={handleCancel} className="px-6 py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-100">
            Cancel Batch
          </button>
        </div>
      </form>
    </div>
  );
}