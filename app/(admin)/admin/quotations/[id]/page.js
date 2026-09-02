'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function AdminQuotationDetailPage() {
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    async function fetchQuotation() {
      const res = await fetch(`/api/quotations/${id}`);
      const data = await res.json();
      if (data.success) {
        setQuotation(data.quotation);
        setItems((data.quotation.items || []).map((it) => ({
          ...it, unitPrice: it.unitPrice || 0, discountPercent: it.discountPercent || 0,
        })));
        setShippingCharge(data.quotation.shippingCharge || 0);
        setAdminNote(data.quotation.adminNote || '');
      }
      setLoading(false);
    }
    fetchQuotation();
  }, [id]);

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = Number(value);
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.unitPrice * (1 - (item.discountPercent || 0) / 100), 0);
  const grandTotal = subtotal + Number(shippingCharge || 0);

  const handleRespond = async () => {
    setSaving(true);
    const res = await fetch(`/api/quotations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((it) => ({
          product: it.product?._id || it.product,
          name: it.name, qty: it.qty, unitPrice: it.unitPrice, discountPercent: it.discountPercent,
        })),
        shippingCharge: Number(shippingCharge),
        adminNote,
        status: 'quoted',
      }),
    });
    const data = await res.json();
    if (data.success) setQuotation(data.quotation);
    setSaving(false);
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8">Loading...</div>;
  if (!quotation) return <div className="max-w-2xl mx-auto px-4 py-8">Not found</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">{quotation.quotationNumber}</h1>
      <p className="text-sm text-slate-500 mb-6">Status: <strong>{quotation.status}</strong></p>

      <div className="border rounded-lg p-4 mb-4">
        <p className="text-sm"><strong>Customer:</strong> {quotation.user?.name} — {quotation.user?.email}</p>
        <p className="text-sm"><strong>Phone:</strong> {quotation.contactPhone}</p>
        {quotation.message && <p className="text-sm text-slate-600 mt-2">"{quotation.message}"</p>}
      </div>

      <div className="border rounded-lg p-4 mb-4">
        <h2 className="font-semibold mb-3">Set Pricing</h2>

        {items.map((item, i) => (
          <div key={i} className="border-b pb-3 mb-3">
            <p className="text-sm font-medium mb-2">{item.name} — Qty: {item.qty}</p>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Unit price (Rs.)" value={item.unitPrice}
                onChange={(e) => updateItem(i, 'unitPrice', e.target.value)}
                className="border p-2 rounded text-sm" />
              <input type="number" placeholder="Discount %" value={item.discountPercent}
                onChange={(e) => updateItem(i, 'discountPercent', e.target.value)}
                className="border p-2 rounded text-sm" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Line total: Rs. {(item.qty * item.unitPrice * (1 - (item.discountPercent || 0) / 100)).toLocaleString()}
            </p>
          </div>
        ))}

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Shipping / Delivery Charge (Rs.)</label>
          <input type="number" value={shippingCharge} onChange={(e) => setShippingCharge(e.target.value)} className="w-full border p-2 rounded text-sm" />
        </div>

        <div className="mt-4 pt-3 border-t space-y-1">
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between text-sm"><span>Shipping</span><span>Rs. {Number(shippingCharge || 0).toLocaleString()}</span></div>
          <div className="flex justify-between font-bold text-base pt-1 border-t"><span>Grand Total</span><span>Rs. {grandTotal.toLocaleString()}</span></div>
        </div>

        <textarea placeholder="Note for customer (optional)" rows={3} value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          className="w-full border p-2 rounded text-sm mt-4" />

        <button onClick={handleRespond} disabled={saving}
          className="w-full mt-3 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300">
          {saving ? 'Sending...' : 'Send Quote to Customer'}
        </button>
      </div>

      {quotation.status !== 'pending' && (
        <a href={`/api/quotations/${id}/pdf`} target="_blank" rel="noopener noreferrer"
          className="block text-center border border-slate-300 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50">
          📄 Download PDF
        </a>
      )}
    </div>
  );
}