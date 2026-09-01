'use client';

import { useState } from 'react';

export default function NotifySubscribeForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, whatsappNumber: number, interestedIn: 'PLC & Robotics courses' }),
    });

    const data = await res.json();
    if (!data.success) {
      setError(data.error);
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="border border-green-200 bg-green-50 rounded-lg p-4 text-center text-sm text-green-800">
        ✓ Thanks! We'll notify you on WhatsApp when new batches open.
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-slate-50">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full text-sm font-medium text-[#2C6E9E] flex items-center justify-center gap-2"
        >
          📱 Notify me about new workshops &amp; batches
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <p className="text-sm font-medium mb-2">Get a WhatsApp message when new courses open</p>
          <input
            type="text" placeholder="Your name" required value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded text-sm"
          />
          <input
            type="tel" placeholder="WhatsApp number (e.g. 07XXXXXXXX)" required value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full border p-2 rounded text-sm"
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full bg-[#2C6E9E] text-white py-2 rounded text-sm font-medium hover:bg-[#245a80] disabled:bg-gray-300"
          >
            {loading ? 'Submitting...' : 'Notify Me'}
          </button>
        </form>
      )}
    </div>
  );
}