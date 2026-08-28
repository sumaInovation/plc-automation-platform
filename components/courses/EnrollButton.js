'use client';

import { useState } from 'react';

export default function EnrollButton({ course, batch }) {
  const [loading, setLoading] = useState(false);

  const handleEnroll = () => {
    alert(`Enroll flow — ${course.title} / ${batch.batchName} (ඊළඟට implement කරමු)`);
  };

  return (
    <button
      onClick={handleEnroll}
      disabled={batch.seatsAvailable === 0 || loading}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
    >
      Enroll Now
    </button>
  );
}