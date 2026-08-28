'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      const res = await fetch(`/api/admin/orders?status=${statusFilter}`);
      const data = await res.json();
      if (data.success) setOrders(data.orders);
      setLoading(false);
    }
    fetchOrders();
  }, [statusFilter]);

  const statusColors = {
    pending_payment: 'bg-gray-100 text-gray-700',
    payment_slip_uploaded: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    shipped: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin — Orders</h1>

      <div className="flex gap-2 mb-6">
        {['all', 'pending_payment', 'payment_slip_uploaded', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded text-sm ${
              statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order._id}
              href={`/admin/orders/${order._id}`}
              className="block border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-gray-600">{order.user?.name} — {order.user?.email}</p>
                  <p className="text-sm text-gray-500">{order.deliveryDetails?.phone}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">Rs. {order.total.toLocaleString()}</p>
                  <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${statusColors[order.status]}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}