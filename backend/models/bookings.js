const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pickupBranch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  returnBranch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  driverName: String,
  driverAge: Number,
  pickupDate: Date,
  dropoffDate: Date,
  cars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Car' }],
  services: {
    chauffeur: Boolean,
    babySeat: Boolean,
    navigator: Boolean,
    insurance: String, // 'full', 'tires', 'driver'
    fuelOption: String, // 'prepaid', 'return'
    gps: Boolean
  },
  totalPrice: Number,
  status: { type: String, enum: ['saved', 'completed', 'cancelled'], default: 'saved' },
  discountUsed: Boolean
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
