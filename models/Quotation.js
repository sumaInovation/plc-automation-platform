import mongoose from 'mongoose';

const QuotationItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    qty: { type: Number, required: true, min: 1 },
     unitPrice: { type: Number, default: 0 }, 
    discountPercent: { type: Number, default: 0 },
  },
  { _id: false }
);

const QuotationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [QuotationItemSchema],
    message: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    contactPhone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'quoted', 'accepted', 'declined'],
      default: 'pending',
    },
    quotedPrice: {
      type: Number, // Total quote (all items)
    },
    adminNote: {
      type: String,
      trim: true,
    },
    quotationNumber: {
      type: String,
      unique: true,
    },
    shippingCharge: {
  type: Number,
  default: 0,
},
  },
  { timestamps: true }
);

QuotationSchema.pre('save', function () {
  if (!this.quotationNumber) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.quotationNumber = `QUO-${date}-${random}`;
  }
});

export default mongoose.models.Quotation || mongoose.model('Quotation', QuotationSchema);