'use client';

import { useState } from 'react';

export default function MultiImageUpload({ images, setImages }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFilesSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (images.length + files.length > 6) {
      setError('Maximum 6 images allowed per product');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Files ගණනාවක් parallel ලෙස upload කරනවා
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (!data.success) throw new Error('One or more uploads failed');
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages([...images, ...uploadedUrls]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = ''; // Same file ආයෙත් select කරන්න පුළුවන් වෙන්න input reset කරනවා
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const moveToFirst = (index) => {
    if (index === 0) return;
    const updated = [...images];
    const [item] = updated.splice(index, 1);
    updated.unshift(item);
    setImages(updated);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {images.map((url, i) => (
          <div key={url} className="relative group">
            <img
              src={url}
              alt={`Product image ${i + 1}`}
              className={`w-20 h-20 object-cover rounded border ${i === 0 ? 'ring-2 ring-blue-500' : ''}`}
            />
            {i === 0 && (
              <span className="absolute -top-2 -left-2 bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                Main
              </span>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-1">
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => moveToFirst(i)}
                  className="text-white text-[10px] bg-blue-600 px-1.5 py-0.5 rounded"
                  title="Set as main image"
                >
                  ★
                </button>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="text-white text-xs bg-red-600 w-5 h-5 rounded-full flex items-center justify-center"
                title="Remove"
              >
                ×
              </button>
            </div>
          </div>
        ))}

        {images.length < 6 && (
          <label className="w-20 h-20 border-2 border-dashed border-slate-300 rounded flex items-center justify-center cursor-pointer hover:border-blue-400 text-slate-400 text-xs text-center">
            {uploading ? '...' : '+ Add'}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}
      <p className="text-xs text-slate-400">First image (★) is shown as the main product image. {images.length}/6 images.</p>
    </div>
  );
}