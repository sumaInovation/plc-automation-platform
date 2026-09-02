import connectDB from '@/lib/db';
import Quotation from '@/models/Quotation';
import { auth } from '@/auth';
import { notFound, redirect } from 'next/navigation';

async function getQuotation(id, userId) {
  await connectDB();
  const quotation = await Quotation.findOne({ _id: id, user: userId }).lean();
  if (!quotation) return null;
  return JSON.parse(JSON.stringify(quotation));
}

const statusColors = {
  pending: 'bg-gray-100 text-gray-700',
  quoted: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
};

export default async function QuotationDetailPage({ params, searchParams }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const { new: isNew } = await searchParams;

  const quotation = await getQuotation(id, session.user.id);
  if (!quotation) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {isNew === 'true' && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mb-6">
          ✓ Quote request sent! We'll respond within 1 business day.
        </div>
      )}

      <h1 className="text-2xl font-bold mb-2">{quotation.quotationNumber}</h1>
      <p className="text-sm text-slate-500 mb-6">
        Status: <span className={`text-xs px-2 py-1 rounded-full ${statusColors[quotation.status]}`}>{quotation.status}</span>
      </p>

      <div className="border rounded-lg p-4 mb-4">
        <h2 className="font-semibold mb-3">Items Requested</h2>
        {quotation.items && quotation.items.length > 0 ? (
          <table className="w-full text-sm">
            <tbody>
              {quotation.items.map((item, i) => (
                <tr key={i} className="border-b">
                  <td className="py-1.5">{item.name}</td>
                  <td className="py-1.5 text-right">Qty: {item.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-slate-500">No items data.</p>
        )}
        {quotation.message && <p className="text-sm text-slate-600 mt-3">"{quotation.message}"</p>}
      </div>

      {quotation.status === 'pending' && (
        <div className="border rounded-lg p-4 bg-slate-50 text-sm text-slate-600">
          We're preparing your quote. You'll get an email once it's ready.
        </div>
      )}
{quotation.status === 'quoted' && (
  <div className="border rounded-lg p-4 bg-blue-50">
    <h2 className="font-semibold mb-2">Quoted Price</h2>
    <p className="text-2xl font-bold mb-2">Rs. {quotation.quotedPrice?.toLocaleString()}</p>
    {quotation.adminNote && <p className="text-sm text-slate-600 mb-3">{quotation.adminNote}</p>}
    <a href={`/api/quotations/${quotation._id}/pdf`} target="_blank" rel="noopener noreferrer"
      className="inline-block bg-[#131B22] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black">
      📄 Download PDF Quotation
    </a>
  </div>
)}
    
    </div>
  );
}