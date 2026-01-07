// backend/models/Car.js
const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  brand:     { type: String, required: true },
  model:     { type: String, required: true },
  year:      { type: Number, required: true },
  group:     { type: String, required: true },    // e.g. "Convertible"
  dailyRate: { type: Number, required: true },    // in USD
  imagePath: { type: String, required: true }     // e.g. "Convertible/foo.jpg"
});

module.exports = mongoose.model('Car', carSchema);