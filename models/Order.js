import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: String,       // Order place කරන වෙලාවේ product name එක snapshot කරගන්නවා
    price: Number,       // ඒ වෙලාවේ price එක (product price පස්සේ වෙනස් උනත් order එකේ history එක නොවෙනස්)
    qty: Number,
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [OrderItemSchema],
    total: {
      type: Number,
      required: true,
    },
    deliveryDetails: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      notes: String,
    },
    status: {
      type: String,
      enum: [
        'pending_payment',       // Order created, payment ලැබිලා නෑ තාම
        'payment_slip_uploaded', // Customer slip upload කරලා, admin review කරන්න ඉන්නවා
        'confirmed',             // Admin verify කරලා, processing
        'shipped',
        'delivered',
        'cancelled',
      ],
      default: 'pending_payment',
    },
    paymentSlip: {
      type: String, // Cloudinary URL
    },
    orderNumber: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Order number auto-generate කරනවා: ORD-20260828-XXXX

OrderSchema.pre('save', function () {
  if (!this.orderNumber) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `ORD-${date}-${random}`;
  }
});
export default mongoose.models.Order || mongoose.model('Order', OrderSchema);