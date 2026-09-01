import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

async function getOrders(userId) {
  await connectDB();
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(orders));
}

const statusColors = {
  pending_payment: 'bg-gray-100 text-gray-700',
  payment_slip_uploaded: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  shipped: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default async function MyOrdersPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const orders = await getOrders(session.user.id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="border rounded-lg p-8 text-center">
          <p className="text-slate-500 mb-3">You haven't placed any orders yet.</p>
          <Link href="/shop" className="text-[#2C6E9E] font-medium hover:underline">Browse products →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order._id}
              href={`/dashboard/orders/${order._id}`}
              className="block border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-sm">{order.orderNumber}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status]}`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-1">
                {new Date(order.createdAt).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-sm text-slate-600">
                {order.items.map((i) => i.name).join(', ')}
              </p>
              <p className="font-bold text-sm mt-2">Rs. {order.total.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}