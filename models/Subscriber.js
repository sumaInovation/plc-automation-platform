import mongoose from 'mongoose';

const SubscriberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    whatsappNumber: {
      type: String,
      required: true,
      trim: true,
    },
    interestedIn: {
      type: String,
      trim: true, // e.g. "PLC courses", "Robotics workshops" — free text, optional
    },
    notified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Subscriber || mongoose.model('Subscriber', SubscriberSchema);