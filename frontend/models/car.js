const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  brand: String,
  model: String,
  dailyRate: Number,
  imageUrls: [String],
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'CarGroup' }
});

module.exports = mongoose.model('Car', carSchema);
