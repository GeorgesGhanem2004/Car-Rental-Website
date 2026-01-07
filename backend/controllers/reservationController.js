// backend/controllers/reservationController.js

const Reservation = require('../models/Reservation');
const Car         = require('../models/Car');
const { calculateTotalPrice } = require('../utils/pricingCalculator');
const { checkCarAvailability } = require('../utils/availabilityCheck');

exports.createReservation = async (req, res) => {
  try {
    console.log('Incoming reservation request:', JSON.stringify(req.body, null, 2));

    // 1) Car lookup
    const car = await Car.findById(req.body.car);
    if (!car) {
      console.error('❌ Car not found:', req.body.car);
      return res.status(404).json({ error: 'Car not found' });
    }

    // 2) Date parsing & validation
    const pickupAt = new Date(req.body.pickupAt);
    const returnAt = new Date(req.body.returnAt);
    if (isNaN(pickupAt)) return res.status(400).json({ error: 'Invalid pickup date' });
    if (isNaN(returnAt)) return res.status(400).json({ error: 'Invalid return date' });
    if (pickupAt <= Date.now())        return res.status(400).json({ error: 'Pickup must be in future' });
    if (returnAt <= pickupAt)          return res.status(400).json({ error: 'Return must be after pickup' });

    // 3) Availability check
    const available = await checkCarAvailability(car._id, pickupAt, returnAt);
    if (!available) return res.status(409).json({ error: 'Car not available for those dates' });

    // 4) Build services object from extras + options
    const extras = Array.isArray(req.body.extras) ? req.body.extras : [];
    const services = {
      chauffeur:        extras.includes('chauffeur'),
      babySeat:         extras.includes('baby-seat'),
      gps:              extras.includes('gps'),
      insurance:        req.body.insuranceOption === 'additional-driver'
                          ? 'additionalDriver'
                          : req.body.insuranceOption,
      fuel:             req.body.fuelOption         // 'prepaid' or 'onReturn'
    };

    // 5) Calculate total price using the full services object
    const totalPrice = calculateTotalPrice(car, { pickupAt, returnAt, services });
    console.log('💰 Calculated price:', totalPrice);

    // 6) Assemble reservation payload matching your schema
    const reservationData = {
      user:          req.user._id,
      car:           car._id,
      pickupBranch:  req.body.pickupBranch,
      returnBranch:  req.body.returnBranch,
      pickupAt,
      returnAt,
      driver: {
        name:        req.body.driverName,
        age:         req.body.driverAge
      },
      services,
      totalPrice
    };

    // 7) Create & respond
    const reservation = await Reservation.create(reservationData);
    console.log('✅ Reservation created:', reservation);
    return res.status(201).json(reservation);

  } catch (err) {
    console.error('🔥 FULL ERROR:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({
      error: 'Reservation failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


exports.listReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('car', 'brand model dailyRate')
      .sort('-createdAt');
    res.json(reservations);
  } catch (err) {
    console.error('Error listing reservations:', err);
    res.status(500).json({ error: 'Failed to retrieve reservations' });
  }
};
