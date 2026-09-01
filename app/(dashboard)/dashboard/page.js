import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Enrollment from '@/models/Enrollment';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

async function getDashboardData(userId) {
  await connectDB();

  const [orders, enrollments] = await Promise.all([
    Order.find({ user: userId }).sort({ createdAt: -1 }).limit(3).lean(),
    Enrollment.find({ user: userId }).sort({ createdAt: -1 }).limit(3).lean(),
  ]);

  const [totalOrders, totalEnrollments] = await Promise.all([
    Order.countDocuments({ user: userId }),
    Enrollment.countDocuments({ user: userId }),
  ]);

  return {
    orders: JSON.parse(JSON.stringify(orders)),
    enrollments: JSON.parse(JSON.stringify(enrollments)),
    totalOrders,
    totalEnrollments,
  };
}

const statusColors = {
  pending_payment: 'bg-gray-100 text-gray-700',
  payment_slip_uploaded: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  shipped: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { orders, enrollments, totalOrders, totalEnrollments } = await getDashboardData(session.user.id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Hi, {session.user.name?.split(' ')[0]} 👋</h1>
      <p className="text-slate-500 text-sm mb-8">{session.user.email}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <Link href="/dashboard/orders" className="border rounded-lg p-5 hover:shadow-md transition-shadow bg-white">
          <p className="text-3xl font-bold text-[#2C6E9E]">{totalOrders}</p>
          <p className="text-sm text-slate-500 mt-1">Total Orders</p>
        </Link>
        <Link href="/dashboard/learning" className="border rounded-lg p-5 hover:shadow-md transition-shadow bg-white">
          <p className="text-3xl font-bold text-[#2C6E9E]">{totalEnrollments}</p>
          <p className="text-sm text-slate-500 mt-1">Enrolled Courses</p>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Recent Orders</h2>
          {totalOrders > 0 && (
            <Link href="/dashboard/orders" className="text-sm text-[#2C6E9E] hover:underline">View all →</Link>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="border rounded-lg p-6 text-center bg-white">
            <p className="text-slate-500 text-sm mb-3">No orders yet.</p>
            <Link href="/shop" className="text-sm text-[#2C6E9E] font-medium hover:underline">Browse products →</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <Link
                key={order._id}
                href={`/dashboard/orders/${order._id}`}
                className="flex justify-between items-center border rounded-lg p-4 hover:shadow-sm transition-shadow bg-white"
              >
                <div>
                  <p className="font-medium text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-slate-500">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''} — Rs. {order.total.toLocaleString()}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status]}`}>
                  {order.status.replace('_', ' ')}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Enrollments */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">My Courses</h2>
          {totalEnrollments > 0 && (
            <Link href="/dashboard/learning" className="text-sm text-[#2C6E9E] hover:underline">View all →</Link>
          )}
        </div>

        {enrollments.length === 0 ? (
          <div className="border rounded-lg p-6 text-center bg-white">
            <p className="text-slate-500 text-sm mb-3">No enrollments yet.</p>
            <Link href="/courses" className="text-sm text-[#2C6E9E] font-medium hover:underline">Browse courses →</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {enrollments.map((enrollment) => (
              <Link
                key={enrollment._id}
                href={`/dashboard/learning/${enrollment._id}`}
                className="flex justify-between items-center border rounded-lg p-4 hover:shadow-sm transition-shadow bg-white"
              >
                <div>
                  <p className="font-medium text-sm">{enrollment.courseName}</p>
                  <p className="text-xs text-slate-500">{enrollment.batchName}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColors[enrollment.status]}`}>
                  {enrollment.status.replace('_', ' ')}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}