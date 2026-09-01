'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function AdminEnrollmentDetailPage() {
  const { id } = useParams();
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchEnrollment() {
      const res = await fetch(`/api/admin/enrollments/${id}`);
      const data = await res.json();
      if (data.success) setEnrollment(data.enrollment);
      setLoading(false);
    }
    fetchEnrollment();
  }, [id]);

  const handleAction = async (action) => {
    setActionLoading(true);
    const res = await fetch(`/api/admin/enrollments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (data.success) setEnrollment(data.enrollment);
    setActionLoading(false);
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8">Loading...</div>;
  if (!enrollment) return <div className="max-w-2xl mx-auto px-4 py-8">Enrollment not found</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">{enrollment.enrollmentNumber}</h1>
      <p className="text-sm text-gray-500 mb-6">Status: <strong>{enrollment.status}</strong></p>

      <div className="border rounded-lg p-4 mb-4">
        <h2 className="font-semibold mb-2">Student</h2>
        <p className="text-sm">{enrollment.user?.name} — {enrollment.user?.email}</p>
      </div>

      <div className="border rounded-lg p-4 mb-4">
        <h2 className="font-semibold mb-2">Course</h2>
        <p className="text-sm">{enrollment.courseName}</p>
        <p className="text-sm text-gray-500">Batch: {enrollment.batchName}</p>
        <p className="text-sm font-bold mt-2">Rs. {enrollment.price.toLocaleString()}</p>
      </div>

      {enrollment.paymentSlip && (
        <div className="border rounded-lg p-4 mb-4">
          <h2 className="font-semibold mb-2">Payment Slip</h2>
          <img src={enrollment.paymentSlip} alt="Payment slip" className="max-w-sm rounded border" />
        </div>
      )}

      {enrollment.status === 'payment_slip_uploaded' && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleAction('confirm')}
            disabled={actionLoading}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300"
          >
            ✓ Confirm Enrollment
          </button>
          <button
            onClick={() => handleAction('reject')}
            disabled={actionLoading}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300"
          >
            ✗ Reject & Restore Seat
          </button>
        </div>
      )}

      {enrollment.status === 'confirmed' && (
        <p className="text-green-700 font-medium">✓ This enrollment has been confirmed.</p>
      )}
      {enrollment.status === 'cancelled' && (
        <p className="text-red-700 font-medium">✗ This enrollment was rejected. Seat restored.</p>
      )}
    </div>
  );
}