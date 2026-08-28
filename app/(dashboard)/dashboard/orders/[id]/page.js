import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { auth } from '@/auth';
import { notFound, redirect } from 'next/navigation';
import SlipUpload from '@/components/dashboard/SlipUpload';

async function getOrder(id, userId) {
  await connectDB();
  const order = await Order.findOne({ _id: id, user: userId }).lean();
  if (!order) return null;
  return JSON.parse(JSON.stringify(order));
}

export default async function OrderDetailPage({ params, searchParams }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const { new: isNew } = await searchParams;

  const order = await getOrder(id, session.user.id);
  if (!order) notFound();

  const statusLabels = {
    pending_payment: 'Awaiting Payment',
    payment_slip_uploaded: 'Slip Uploaded — Under Review',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {isNew === 'true' && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mb-6">
          ✓ Order placed successfully! Order Number: <strong>{order.orderNumber}</strong>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-2">Order {order.orderNumber}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Status: <span className="font-medium">{statusLabels[order.status]}</span>
      </p>

      <div className="border rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-3">Items</h2>
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm py-1">
            <span>{item.name} × {item.qty}</span>
            <span>Rs. {(item.price * item.qty).toLocaleString()}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold pt-2 mt-2 border-t">
          <span>Total</span>
          <span>Rs. {order.total.toLocaleString()}</span>
        </div>
      </div>

      {order.status === 'pending_payment' && (
        <div className="border rounded-lg p-4 mb-6 bg-blue-50">
          <h2 className="font-semibold mb-3">Bank Transfer Details</h2>
          <p className="text-sm">Bank: {process.env.BANK_NAME}</p>
          <p className="text-sm">Account Name: {process.env.BANK_ACCOUNT_NAME}</p>
          <p className="text-sm">Account Number: {process.env.BANK_ACCOUNT_NUMBER}</p>
          <p className="text-sm">Branch: {process.env.BANK_BRANCH}</p>
          <p className="text-sm mt-2 font-medium">Amount: Rs. {order.total.toLocaleString()}</p>

          <SlipUpload orderId={order._id} />
        </div>
      )}

      {order.status === 'payment_slip_uploaded' && (
        <p className="text-sm text-gray-600">
          ඔයාගේ payment slip එක upload කරලා තියෙනවා — admin verify කරලා confirm කරන තුරු wait කරන්න.
        </p>
      )}
    </div>
  );
}