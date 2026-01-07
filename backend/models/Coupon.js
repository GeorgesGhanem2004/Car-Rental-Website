// backend/models/Coupon.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  discount: {         // fraction, e.g. 0.25 = 25%
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expires: {           // optional expiry date
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Coupon', couponSchema);