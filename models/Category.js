import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    image: {
      type: String,
    },
    // ✅ NEW: Hide/show categories
    isActive: {
      type: Boolean,
      default: true,
    },
    // ✅ NEW: Custom ordering
    order: {
      type: Number,
      default: 0,
    },
    // ✅ NEW: SEO meta fields
    metaTitle: {
      type: String,
      trim: true,
    },
    metaDescription: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// ✅ NEW: Indexes for faster queries
CategorySchema.index({ slug: 1, isActive: 1 });
CategorySchema.index({ parent: 1, order: 1 });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);