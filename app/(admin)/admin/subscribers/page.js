'use client';

import { useState, useEffect } from 'react';

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Hi! We just opened a new PLC/Robotics batch — check it out: https://sumaautomation.lk/courses');

  useEffect(() => {
    async function fetchSubscribers() {
      const res = await fetch('/api/subscribers');
      const data = await res.json();
      if (data.success) setSubscribers(data.subscribers);
      setLoading(false);
    }
    fetchSubscribers();
  }, []);

  // Sri Lanka number normalize කරනවා — 07XXXXXXXX → 947XXXXXXXX (wa.me international format ඕන)
  function formatNumber(number) {
    let clean = number.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '94' + clean.slice(1);
    if (!clean.startsWith('94')) clean = '94' + clean;
    return clean;
  }

  function getWaLink(number) {
    return `https://wa.me/${formatNumber(number)}?text=${encodeURIComponent(message)}`;
  }

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">WhatsApp Subscribers</h1>
      <p className="text-sm text-slate-500 mb-6">{subscribers.length} people waiting for course updates</p>

      <div className="border rounded-lg p-4 mb-6 bg-slate-50">
        <label className="block text-sm font-medium mb-2">Message to send (click a contact below to open WhatsApp with this pre-filled)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          className="w-full border p-2 rounded text-sm"
        />
      </div>

      {subscribers.length === 0 ? (
        <p className="text-slate-500 text-sm">No subscribers yet.</p>
      ) : (
        <div className="space-y-2">
          {subscribers.map((s) => (
            <div key={s._id} className="flex justify-between items-center border rounded-lg p-3">
              <div>
                <p className="font-medium text-sm">{s.name}</p>
                <p className="text-xs text-slate-500">{s.whatsappNumber}</p>
              </div>
              <a
                href={getWaLink(s.whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-green-700"
              >
                💬 Send on WhatsApp
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}