// backend/routes/cars.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth'); // Added auth middleware
const Car = require('../models/Car');

// GET /api/cars[?group=…]
router.get('/', async (req, res) => { // Added auth
  try {
    const filter = {};
    if (req.query.fuelType)    filter.fuelType    = req.query.fuelType;
    if (req.query.numDoors)     filter.numDoors     = Number(req.query.numDoors);
     if (req.query.passengers)   filter.numPassengers = Number(req.query.passengers);
    const cars = await Car.find(filter).sort({ brand:1, model:1 });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
});

// GET /api/cars/:id
router.get('/:id', auth, async (req, res) => { // Added auth
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ error: 'Not found' });
    res.json(car);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch car' });
  }
});

module.exports = router;