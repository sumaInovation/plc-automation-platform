import connectDB from '@/lib/db';
import Quotation from '@/models/Quotation';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

async function getQuotations(userId) {
  await connectDB();
  const quotations = await Quotation.find({ user: userId }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(quotations));
}

const statusColors = {
  pending: 'bg-gray-100 text-gray-700',
  quoted: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
};

export default async function MyQuotationsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const quotations = await getQuotations(session.user.id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Quotation Requests</h1>

      {quotations.length === 0 ? (
        <p className="text-slate-500 text-sm">No quotation requests yet.</p>
      ) : (
        <div className="space-y-3">
          {quotations.map((q) => (
            <div key={q._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-sm">{q.quotationNumber}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColors[q.status]}`}>{q.status}</span>
              </div>
              
              <p className="text-sm text-slate-600">
  {q.items && q.items.length > 0 ? q.items.map((i) => `${i.name} (×${i.qty})`).join(', ') : 'Legacy quotation'}
</p>


          {q.status === 'quoted' && (
                <p className="font-bold text-lg mt-2">Rs. {q.quotedPrice.toLocaleString()}</p>
              )}
              {q.adminNote && <p className="text-xs text-slate-500 mt-1">{q.adminNote}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}