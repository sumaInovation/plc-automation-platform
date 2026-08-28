import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    stock_qty: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    images: [
      {
        type: String, // Cloudinary URLs
      },
    ],
    specs: {
      type: Map,
      of: String, // Flexible key-value: { voltage: "24V", brand: "Siemens", inputs: "8" }
    },
    brand: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true, // Admin ට product එකක් temporarily hide කරන්න පුළුවන් (delete නොකර)
    },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);