// backend/utils/availabilityCheck.js
const Reservation = require('../models/Reservation');

const checkCarAvailability = async (carId, pickupAt, returnAt) => {
  const existing = await Reservation.find({
    car: carId,
    status: { $nin: ['cancelled'] },
    $or: [
      { pickupAt: { $lt: returnAt }, returnAt: { $gt: pickupAt } },
      { pickupAt: { $gte: pickupAt, $lte: returnAt } }
    ]
  });

  return existing.length === 0;
};

module.exports = { checkCarAvailability };