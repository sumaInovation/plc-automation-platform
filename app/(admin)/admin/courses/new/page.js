'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCoursePage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    type: 'physical',
    description: '',
    price: '',
    duration: '',
    level: 'beginner',
    targetAudience: 'general',
  });

  const [syllabus, setSyllabus] = useState(['']);

  const handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setForm({ ...form, title, slug });
  };

  const handleSyllabusChange = (index, value) => {
    const updated = [...syllabus];
    updated[index] = value;
    setSyllabus(updated);
  };

  const addSyllabusRow = () => setSyllabus([...syllabus, '']);
  const removeSyllabusRow = (index) => setSyllabus(syllabus.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...form,
      price: Number(form.price),
      syllabus: syllabus.filter((s) => s.trim() !== ''),
    };

    const res = await fetch('/api/admin/courses', {
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

    // Course create උනාට පස්සේ, ඒම course එකට Batch එකක් add කරන්න redirect කරනවා
    router.push(`/admin/batches/new?courseId=${data.course._id}&courseTitle=${encodeURIComponent(data.course.title)}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Course</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Course Title</label>
          <input
            type="text" required value={form.title} onChange={handleTitleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            type="text" required value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full border p-2 rounded bg-gray-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border p-2 rounded"
            >
              <option value="physical">Physical</option>
              <option value="online">Online</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Level</label>
            <select
              value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="w-full border p-2 rounded"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            required rows={3} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price (Rs.)</label>
            <input
              type="number" required min="0" value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duration</label>
            <input
              type="text" placeholder="e.g. 4 weeks" value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Target Audience</label>
          <select
            value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
            className="w-full border p-2 rounded"
          >
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
              <input
                type="text" placeholder={`Module ${i + 1}`} value={item}
                onChange={(e) => handleSyllabusChange(i, e.target.value)}
                className="flex-1 border p-2 rounded text-sm"
              />
              <button type="button" onClick={() => removeSyllabusRow(i)} className="text-red-500 px-2">×</button>
            </div>
          ))}
          <button type="button" onClick={addSyllabusRow} className="text-blue-600 text-sm">+ Add Module</button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300"
        >
          {loading ? 'Creating...' : 'Create Course → Add Batch'}
        </button>
      </form>
    </div>
  );
}