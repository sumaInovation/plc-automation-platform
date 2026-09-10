'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function EnrollButton({ course, batch }) {
  const { data: authSession } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Safety - batch nathnam crash wenne na
  if (!course ||!batch) {
    return (
      <div className="w-full bg-gray-200 text-gray-500 px-4 py-3 rounded-lg text-sm text-center">
        No active batch
      </div>
    );
  }

  const handleEnroll = async () => {
    if (!authSession) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course._id,
          batchId: batch._id
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        setLoading(false);
        return;
      }

      router.push(`/dashboard/learning/${data.enrollment._id}?new=true`);
    } catch (err) {
      setError('Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleEnroll}
        disabled={batch?.seatsAvailable === 0 || loading}
        className="w-full bg-[#febd69] hover:bg-[#f3a847] text-[#0f1111] px-4 py-3 rounded-full text-sm font-bold disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {loading? 'Enrolling...' : batch?.seatsAvailable === 0? 'Full' : 'Enroll Now'}
      </button>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
}