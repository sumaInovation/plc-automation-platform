'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuoteStore } from '@/store/quoteStore';
import { useHasHydrated } from '@/hooks/useHasHydrated';

export const dynamic = 'force-dynamic';

export default function QuoteCartPage() {
  const { data: authSession, status } = useSession();
  const hasHydrated = useHasHydrated();
  const items = useQuoteStore((state) => state.items);
  const updateQty = useQuoteStore((state) => state.updateQty);
  const removeItem = useQuoteStore((state) => state.removeItem);
  const clearQuote = useQuoteStore((state) => state.clearQuote);
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!hasHydrated || status === 'loading') {
    return <div className="max-w-2xl mx-auto px-4 py-8">Loading...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold mb-2">No items in your quote request</h1>
        <p className="text-slate-500 mb-4">Add products from the shop to request a bulk quote.</p>
        <Link href="/shop" className="text-[#2C6E9E] underline">Browse products →</Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authSession) {
      router.push('/login?callbackUrl=/quote-cart');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ product: i._id, name: i.name, qty: i.qty, unitPrice: i.price })),
          contactPhone: phone,
          message,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to send quote');
        setLoading(false);
        return;
      }
      clearQuote();
      router.push(`/dashboard/quotations/${data.quotation._id}?new=true`);
    } catch (err) {
      setError('Network error, try again');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Request a Quote</h1>
      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item._id} className="flex items-center gap-3 border rounded-lg p-3 bg-white">
            <div className="relative w-14 h-14 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
              {item.image ? <Image src={item.image} alt={item.name} fill sizes="56px" className="object-contain" /> : <span className="text-gray-400 text-xs">No image</span>}
            </div>
            <p className="flex-1 text-sm font-medium line-clamp-2">{item.name}</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => updateQty(item._id, item.qty - 1)} className="w-7 h-7 border rounded hover:bg-gray-100">−</button>
              <span className="w-8 text-center text-sm">{item.qty}</span>
              <button type="button" onClick={() => updateQty(item._id, item.qty + 1)} className="w-7 h-7 border rounded hover:bg-gray-100">+</button>
            </div>
            <button type="button" onClick={() => removeItem(item._id)} className="text-red-500 text-xs ml-2">Remove</button>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="space-y-3 bg-white p-4 rounded-lg border">
        <input type="tel" placeholder="Contact phone number" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border p-2.5 rounded outline-none focus:ring-2 focus:ring-[#2C6E9E]" />
        <textarea placeholder="Any specific requirements (optional)" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full border p-2.5 rounded outline-none focus:ring-2 focus:ring-[#2C6E9E]" />
        {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-[#2C6E9E] text-white py-3 rounded-lg font-medium hover:bg-[#245a80] disabled:bg-gray-300">{loading ? 'Sending...' : 'Send Quote Request'}</button>
      </form>
    </div>
  );
}