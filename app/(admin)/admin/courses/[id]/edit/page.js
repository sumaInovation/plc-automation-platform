'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditCoursePage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '', slug: '', type: 'physical', description: '',
    price: '', duration: '', level: 'beginner', targetAudience: 'general', isActive: true,
  });
  const [syllabus, setSyllabus] = useState(['']);

  useEffect(() => {
    async function fetchCourse() {
      const res = await fetch(`/api/admin/courses/${id}`);
      const data = await res.json();
      if (data.success) {
        const c = data.course;
        setForm({
          title: c.title, slug: c.slug, type: c.type, description: c.description,
          price: c.price, duration: c.duration || '', level: c.level,
          targetAudience: c.targetAudience, isActive: c.isActive,
        });
        setSyllabus(c.syllabus?.length > 0 ? c.syllabus : ['']);
      }
      setLoading(false);
    }
    fetchCourse();
  }, [id]);

  const handleSyllabusChange = (index, value) => {
    const updated = [...syllabus];
    updated[index] = value;
    setSyllabus(updated);
  };
  const addSyllabusRow = () => setSyllabus([...syllabus, '']);
  const removeSyllabusRow = (index) => setSyllabus(syllabus.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      price: Number(form.price),
      syllabus: syllabus.filter((s) => s.trim() !== ''),
    };

    const res = await fetch(`/api/admin/courses/${id}`, {
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

    router.push('/admin/courses');
  };

  const handleDeactivate = async () => {
    if (!confirm('Course එක deactivate කරන්නද?')) return;
    const res = await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) router.push('/admin/courses');
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Course</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Course Title</label>
          <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border p-2 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border p-2 rounded">
              <option value="physical">Physical</option>
              <option value="online">Online</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Level</label>
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="w-full border p-2 rounded">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
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
            <label className="block text-sm font-medium mb-1">Duration</label>
            <input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full border p-2 rounded" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Target Audience</label>
          <select value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} className="w-full border p-2 rounded">
            <option value="general">General</option>
            <option value="university">University Students</option>
            <option value="school">School Students</option>
            <option value="employee">Employees</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Syllabus</label>
          {syllabus.map((item, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input type="text" placeholder={`Module ${i + 1}`} value={item} onChange={(e) => handleSyllabusChange(i, e.target.value)} className="flex-1 border p-2 rounded text-sm" />
              <button type="button" onClick={() => removeSyllabusRow(i)} className="text-red-500 px-2">×</button>
            </div>
          ))}
          <button type="button" onClick={addSyllabusRow} className="text-blue-600 text-sm">+ Add Module</button>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          Active (visible in courses)
        </label>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-3">
          <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={handleDeactivate} className="px-6 py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-100">
            Deactivate
          </button>
        </div>
      </form>
    </div>
  );
}