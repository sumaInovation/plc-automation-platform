import mongoose from 'mongoose';

const EnrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
    },
    courseName: String,   // Snapshot — course/batch පස්සේ වෙනස් උනත් history එක නොවෙනස්
    batchName: String,
    price: Number,
    status: {
      type: String,
      enum: [
        'pending_payment',
        'payment_slip_uploaded',
        'confirmed',
        'completed',
        'cancelled',
      ],
      default: 'pending_payment',
    },
    paymentSlip: {
      type: String, // Cloudinary URL
    },
    enrollmentNumber: {
      type: String,
      unique: true,
    },
    progress: {
      completedLessons: [{ type: String }], // Online course lesson tracking (පස්සේ ඕන වෙනවා)
    },
  },
  { timestamps: true }
);

EnrollmentSchema.pre('save', function () {
  if (!this.enrollmentNumber) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.enrollmentNumber = `ENR-${date}-${random}`;
  }
});

export default mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema);