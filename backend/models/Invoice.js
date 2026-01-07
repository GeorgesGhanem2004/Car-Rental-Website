// backend/models/Invoice.js
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reservations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      required: true
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  discountApplied: {    // amount subtracted by coupon
    type: Number,
    default: 0
  },
  couponCode: {         // code used, if any
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);