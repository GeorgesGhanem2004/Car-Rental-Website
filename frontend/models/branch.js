const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  openHour: String,
  closeHour: String,
  coordinates: {
    lat: Number,
    lng: Number
  }
});

module.exports = mongoose.model('Branch', branchSchema);
