'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cartStore';
import { useHasHydrated } from '@/hooks/useHasHydrated';

export default function CheckoutPage() {
  const { data: authSession, status } = useSession();
  const hasHydrated = useHasHydrated();
  const items = useCartStore((state) => state.items);
  const getTotal = useCartStore((state) => state.getTotal);
  const clearCart = useCartStore((state) => state.clearCart);
  const router = useRouter();

  const [form, setForm] = useState({ fullName: '', phone: '', address: '', city: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!hasHydrated || status === 'loading') {
    return <div className="max-w-2xl mx-auto px-4 py-8">Loading...</div>;
  }

  if (!authSession) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="mb-4">Order එකක් place කරන්න කලින් login වෙන්න ඕන.</p>
        <a href="/login" className="text-blue-600 underline">Login කරන්න</a>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p>Cart එක empty — order place කරන්න products add කරන්න.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, deliveryDetails: form }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        setLoading(false);
        return;
      }

      clearCart();
      router.push(`/dashboard/orders/${data.order._id}?new=true`);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="border rounded-lg p-4 mb-6 bg-gray-50">
        <h2 className="font-semibold mb-3">Order Summary</h2>
        {items.map((item) => (
          <div key={item._id} className="flex justify-between text-sm py-1">
            <span>{item.name} × {item.qty}</span>
            <span>Rs. {(item.price * item.qty).toLocaleString()}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold pt-2 mt-2 border-t">
          <span>Total</span>
          <span>Rs. {getTotal().toLocaleString()}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="font-semibold">Delivery Details</h2>

        <input
          type="text" placeholder="Full Name" required
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <input
          type="tel" placeholder="Phone Number" required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <input
          type="text" placeholder="Address" required
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <input
          type="text" placeholder="City" required
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <textarea
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full border p-2 rounded"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300"
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}