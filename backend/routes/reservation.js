// backend/routes/reservation.js
const express = require('express');
const router  = express.Router();
const { auth } = require('../middleware/auth');
const {
  createReservation,
  listReservations
} = require('../controllers/reservationController');

router.post('/', auth, createReservation);
router.get('/',  auth, listReservations);

module.exports = router;
