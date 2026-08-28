import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['online', 'physical'],
      required: [true, 'Course type is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    syllabus: [
      {
        type: String, // e.g. "Module 1: Introduction to PLC", "Module 2: Ladder Logic"
      },
    ],
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    duration: {
      type: String, // e.g. "4 weeks", "20 hours"
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    image: {
      type: String, // Cloudinary URL
    },
    targetAudience: {
      type: String,
      enum: ['university', 'school', 'employee', 'general'],
      default: 'general',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);