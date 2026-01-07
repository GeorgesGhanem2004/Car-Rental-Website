// backend/models/CarGroup.js
const mongoose = require('mongoose');

const carGroupSchema = new mongoose.Schema({
  name:            { type: String, unique: true },

  /* Common specs */
  engineSize:      Number,       // in cc (0 for EV)
  numDoors:        Number,
  numPassengers:   Number,
  fuelType:        String,       // Gasoline, Diesel, Hybrid, Electric
  gearbox:         String,       // Automatic, Manual, CVT, Single‑speed
  hasAC:           Boolean,
  electricWindows: Boolean
});

module.exports = mongoose.model('CarGroup', carGroupSchema);
