import connectDB from '@/lib/db';
import Review from '@/models/Review';
import Order from '@/models/Order';
import Enrollment from '@/models/Enrollment';
import { auth } from '@/auth';

export async function POST(request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ success: false, error: 'Please login to leave a review' }, { status: 401 });
  }

  try {
    await connectDB();
    const { targetType, targetId, rating, comment } = await request.json();

    if (!['product', 'course'].includes(targetType)) {
      return Response.json({ success: false, error: 'Invalid target type' }, { status: 400 });
    }
    if (!rating || rating < 1 || rating > 5) {
      return Response.json({ success: false, error: 'Rating must be between 1-5' }, { status: 400 });
    }

    // Verified purchase check — order/enrollment confirmed කරලා තියෙනවද verify කරනවා
    if (targetType === 'product') {
      const hasPurchased = await Order.exists({
        user: session.user.id,
        'items.product': targetId,
        status: { $in: ['confirmed', 'shipped', 'delivered'] },
      });
      if (!hasPurchased) {
        return Response.json({ success: false, error: 'You can only review products you have purchased' }, { status: 403 });
      }
    } else {
      const hasEnrolled = await Enrollment.exists({
        user: session.user.id,
        course: targetId,
        status: { $in: ['confirmed', 'completed'] },
      });
      if (!hasEnrolled) {
        return Response.json({ success: false, error: 'You can only review courses you are enrolled in' }, { status: 403 });
      }
    }

    const reviewData = {
      user: session.user.id,
      targetType,
      rating,
      comment,
      [targetType]: targetId, // 'product' හෝ 'course' field එකට targetId දානවා
    };

    const review = await Review.create(reviewData);
    return Response.json({ success: true, review }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return Response.json({ success: false, error: 'You have already reviewed this item' }, { status: 409 });
    }
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product');
    const courseId = searchParams.get('course');

    const filter = productId ? { product: productId } : { course: courseId };

    const reviews = await Review.find(filter)
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .lean();

    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    return Response.json({
      success: true,
      reviews: JSON.parse(JSON.stringify(reviews)),
      avgRating: Number(avgRating),
      count: reviews.length,
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}