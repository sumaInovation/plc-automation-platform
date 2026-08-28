import mongoose from 'mongoose';

const BatchSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    batchName: {
      type: String,
      required: true, // e.g. "January 2027 Batch"
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    schedule: {
      type: String, // e.g. "Every Saturday, 9AM - 12PM"
    },
    location: {
      type: String, // Physical course නම් venue address, Online නම් "Zoom/Online"
    },
    seatsTotal: {
      type: Number,
      required: true,
    },
    seatsAvailable: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Batch || mongoose.model('Batch', BatchSchema);