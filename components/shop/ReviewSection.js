'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

function StarDisplay({ rating }) {
  return (
    <span className="text-amber-500">
      {'★'.repeat(Math.round(rating))}
      <span className="text-slate-300">{'★'.repeat(5 - Math.round(rating))}</span>
    </span>
  );
}

function StarInput({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl ${star <= value ? 'text-amber-500' : 'text-slate-300'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ targetType, targetId }) {
  const { data: authSession } = useSession();
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const queryParam = targetType === 'product' ? `product=${targetId}` : `course=${targetId}`;

  useEffect(() => {
    fetchReviews();
  }, [targetId]);

  async function fetchReviews() {
    setLoading(true);
    const res = await fetch(`/api/reviews?${queryParam}`);
    const data = await res.json();
    if (data.success) {
      setReviews(data.reviews);
      setAvgRating(data.avgRating);
      setCount(data.count);
    }
    setLoading(false);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType, targetId, rating, comment }),
    });

    const data = await res.json();

    if (!data.success) {
      setError(data.error);
      setSubmitting(false);
      return;
    }

    setShowForm(false);
    setRating(0);
    setComment('');
    setSubmitting(false);
    fetchReviews();
  };

  return (
    <div className="mt-8 border-t pt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="font-semibold text-lg">Reviews</h2>
          {count > 0 && (
            <p className="text-sm text-slate-500">
              <StarDisplay rating={avgRating} /> {avgRating} ({count} review{count !== 1 ? 's' : ''})
            </p>
          )}
        </div>

        {authSession && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            Write a review
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded-lg p-4 mb-4 bg-slate-50">
          <p className="text-sm font-medium mb-2">Your rating</p>
          <StarInput value={rating} onChange={setRating} />

          <textarea
            placeholder="Share your experience (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full border p-2 rounded text-sm mt-3"
          />

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              disabled={rating === 0 || submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:bg-gray-300"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-slate-500 px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-slate-500">No reviews yet. Be the first to share your experience.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="border-b pb-4">
              <div className="flex justify-between items-center mb-1">
                <p className="font-medium text-sm">{review.user?.name}</p>
                <StarDisplay rating={review.rating} />
              </div>
              {review.comment && <p className="text-sm text-slate-600">{review.comment}</p>}
              <p className="text-xs text-slate-400 mt-1">
                {new Date(review.createdAt).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}