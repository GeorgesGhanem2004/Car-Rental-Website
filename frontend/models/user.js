const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  profilePicture: String,
  earnedPoints: { type: Number, default: 0 },
  savedTransaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
