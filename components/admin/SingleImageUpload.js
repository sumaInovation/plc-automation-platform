'use client';

import { useState } from 'react';

export default function SingleImageUpload({ image, setImage, label = 'Image' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!data.success) throw new Error('Upload failed');
      setImage(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>

      {image ? (
        <div className="relative w-32 h-32 group">
          <img src={image} alt="Thumbnail" className="w-full h-full object-cover rounded border" />
          <button
            type="button"
            onClick={() => setImage(null)}
            className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove"
          >
            ×
          </button>
        </div>
      ) : (
        <label className="w-32 h-32 border-2 border-dashed border-slate-300 rounded flex items-center justify-center cursor-pointer hover:border-blue-400 text-slate-400 text-xs text-center">
          {uploading ? 'Uploading...' : '+ Add Image'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}