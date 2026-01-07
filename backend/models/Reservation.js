// backend/models/Reservation.js
const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  car:  { type: mongoose.Schema.Types.ObjectId, ref: 'Car',  required: true },

  pickupBranch:  { type: String, required: true },
  returnBranch:  { type: String, required: true },
  pickupAt:      { type: Date,   required: true },
  returnAt:      { type: Date,   required: true },

  driver: {
    name: { type: String, required: true },
    age:  { type: Number, min: 18, max: 75, required: true }
  },

  services: {
    chauffeur:   { type: Boolean, default: false },
    babySeat:    { type: Boolean, default: false },
    gps:         { type: Boolean, default: false },
    insurance:   { type: String,
                   enum: ['none','full','tires','additionalDriver'],
                   default: 'none' },
    fuel:        { type: String,
                   enum: ['prepaid','onReturn'],
                   required: true }
  },

  totalPrice: { type: Number, required: true },
  status:     { type: String,
                enum: ['saved','completed','cancelled','quoted'],
                default: 'saved' }

}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
