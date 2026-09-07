'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState('');

  useEffect(() => {
    async function fetchOrder() {
      const res = await fetch(`/api/admin/orders/${id}`);
      const data = await res.json();
      if (data.success) setOrder(data.order);
      setLoading(false);
    }
    fetchOrder();
  }, [id]);

  const handleAction = async (action) => {
    setActionLoading(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (data.success) {
      setOrder(data.order);
    }
    setActionLoading(false);
  };

  const handleSetDeliveryCharge = async () => {
  if (!deliveryCharge || Number(deliveryCharge) < 0) {
    setError('Enter a valid delivery charge');
    return;
  }
  setActionLoading(true);
  const res = await fetch(`/api/admin/orders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_delivery_charge', deliveryCharge }),
  });
  const data = await res.json();
  if (data.success) setOrder(data.order);
  setActionLoading(false);
};

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8">Loading...</div>;
  if (!order) return <div className="max-w-2xl mx-auto px-4 py-8">Order not found</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">{order.orderNumber}</h1>
      <p className="text-sm text-gray-500 mb-6">Status: <strong>{order.status}</strong></p>

      <div className="border rounded-lg p-4 mb-4">
        <h2 className="font-semibold mb-2">Customer</h2>
        <p className="text-sm">{order.user?.name} — {order.user?.email}</p>
        <p className="text-sm">{order.deliveryDetails?.phone}</p>
        <p className="text-sm">{order.deliveryDetails?.address}, {order.deliveryDetails?.city}</p>
      </div>

      <div className="border rounded-lg p-4 mb-4">
        <h2 className="font-semibold mb-2">Items</h2>
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm py-1">
            <span>{item.name} × {item.qty}</span>
            <span>Rs. {(item.price * item.qty).toLocaleString()}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold pt-2 mt-2 border-t">
          <span>Total</span>
          <div className="border-t pt-2 mt-2">
  <div className="flex justify-between text-sm"><span>Subtotal</span><span>Rs. {order.subtotal.toLocaleString()}</span></div>
  {order.deliveryCharge > 0 && (
    <div className="flex justify-between text-sm"><span>Delivery</span><span>Rs. {order.deliveryCharge.toLocaleString()}</span></div>
  )}
  <div className="flex justify-between font-bold pt-1"><span>Total</span><span>Rs. {order.total.toLocaleString()}</span></div>
</div>
        </div>
      </div>

      {order.paymentSlip && (
        <div className="border rounded-lg p-4 mb-4">
          <h2 className="font-semibold mb-2">Payment Slip</h2>
          <img src={order.paymentSlip} alt="Payment slip" className="max-w-sm rounded border" />
        </div>
      )}
        {order.status === 'pending_delivery_charge' && (
  <div className="border rounded-lg p-4 mb-4 bg-amber-50">
    <h2 className="font-semibold mb-3">Set Delivery Charge</h2>

    <div className="mb-4 text-sm">
      <p><strong>Delivery Address:</strong></p>
      <p>{order.deliveryDetails.fullName} — {order.deliveryDetails.phone}</p>
      <p>{order.deliveryDetails.address}, {order.deliveryDetails.city}</p>
      {order.deliveryDetails.notes && <p className="text-slate-500">Note: {order.deliveryDetails.notes}</p>}
    </div>

    <p className="text-sm mb-2">Items subtotal: <strong>Rs. {order.subtotal.toLocaleString()}</strong></p>

    <input
      type="number" placeholder="Delivery charge (Rs.)" value={deliveryCharge}
      onChange={(e) => setDeliveryCharge(e.target.value)}
      className="w-full border p-2 rounded mb-3"
    />

    <button
      onClick={handleSetDeliveryCharge}
      disabled={actionLoading}
      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300"
    >
      {actionLoading ? 'Saving...' : 'Set Charge & Notify Customer'}
    </button>
  </div>
)}
      {order.status === 'payment_slip_uploaded' && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleAction('confirm')}
            disabled={actionLoading}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300"
          >
            ✓ Confirm Order
          </button>
          <button
            onClick={() => handleAction('reject')}
            disabled={actionLoading}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300"
          >
            ✗ Reject & Restore Stock
          </button>
        </div>
      )}

      {order.status === 'confirmed' && (
        <p className="text-green-700 font-medium">✓ This order has been confirmed.</p>
      )}
      {order.status === 'cancelled' && (
        <p className="text-red-700 font-medium">✗ This order was rejected. Stock restored.</p>
      )}
    </div>
  );
}