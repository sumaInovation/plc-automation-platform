'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuotations() {
      setLoading(true);
      const res = await fetch(`/api/quotations?status=${statusFilter}`);
      const data = await res.json();
      if (data.success) setQuotations(data.quotations);
      setLoading(false);
    }
    fetchQuotations();
  }, [statusFilter]);

  const statusColors = {
    pending: 'bg-gray-100 text-gray-700',
    quoted: 'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700',
    declined: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Quotation Requests</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'quoted', 'accepted', 'declined'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded text-sm ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : quotations.length === 0 ? (
        <p className="text-slate-500 text-sm">No quotations found.</p>
      ) : (
        <div className="space-y-2">
          {quotations.map((q) => (
            <Link key={q._id} href={`/admin/quotations/${q._id}`} className="block border rounded-lg p-4 hover:shadow-sm transition-shadow bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm">{q.quotationNumber}</p>
                  <p className="text-sm text-slate-600">{q.productName} — Qty: {q.qty}</p>
                  <p className="text-xs text-slate-500">{q.user?.name} — {q.user?.email} — {q.contactPhone}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColors[q.status]}`}>{q.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}