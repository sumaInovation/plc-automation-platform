'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EnrollmentSlipUpload({ enrollmentId }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        setError('Upload failed. Try again.');
        setUploading(false);
        return;
      }

      const res = await fetch(`/api/enrollments/${enrollmentId}/upload-slip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slipUrl: uploadData.url }),
      });
      const data = await res.json();

      if (data.success) {
        router.refresh();
      } else {
        setError('Failed to save slip.');
      }
    } catch (err) {
      setError('Something went wrong.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      <p className="font-medium text-sm mb-2">Upload Payment Slip</p>
      <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm mb-2" />
      {preview && <img src={preview} alt="Slip preview" className="w-32 h-32 object-cover rounded border mb-2" />}
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:bg-gray-300"
      >
        {uploading ? 'Uploading...' : 'Upload Slip'}
      </button>
    </div>
  );
}