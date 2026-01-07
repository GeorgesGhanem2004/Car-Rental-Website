const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true }, // e.g., 10 for 10% or 10$
  expiresAt: Date,
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Coupon', couponSchema);
