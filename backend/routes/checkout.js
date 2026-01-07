// backend/routes/checkout.js
const express     = require('express');
const router      = express.Router();
const { auth }    = require('../middleware/auth');
const Reservation = require('../models/Reservation');
const Invoice     = require('../models/Invoice');
const User        = require('../models/User');
const Coupon      = require('../models/Coupon');

// POST /api/checkout
router.post('/', auth, async (req, res) => {
  const { reservationIds, paymentMethod, personalInfo, couponCode } = req.body;
  if (!Array.isArray(reservationIds) || !reservationIds.length) {
    return res.status(400).json({ error: 'No reservations provided.' });
  }
  try {
    // 1) Mark reservations completed
    await Reservation.updateMany(
      { _id: { $in: reservationIds }, user: req.user._id },
      { status: 'completed' }
    );
    const reservations = await Reservation.find({
      _id: { $in: reservationIds },
      user: req.user._id
    });

    // 2) Compute raw total
    const rawTotal = reservations.reduce((sum, r) => sum + r.totalPrice, 0);

    // 3) If coupon, validate and calculate discount
    let discountAmount = 0;
    let discountFraction = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode,
        user: req.user._id,
        isUsed: false
      });
      if (!coupon) {
        return res.status(400).json({ error: 'Invalid or already used coupon.' });
      }
      if (coupon.expires && coupon.expires < new Date()) {
        return res.status(400).json({ error: 'Coupon expired.' });
      }

      discountFraction = coupon.discount;             // e.g. 0.25
      discountAmount   = rawTotal * discountFraction; // absolute
      // **Update every reservation’s price**
      await Reservation.updateMany(
        { _id: { $in: reservationIds }, user: req.user._id },
        { $mul: { totalPrice: 1 - discountFraction } }
      );

      coupon.isUsed = true;
      await coupon.save();
    }

    // 4) Final amount after discount
    const finalAmount = rawTotal - discountAmount;

    // 5) Award loyalty points on the discounted amount
    const user = await User.findById(req.user._id);
    user.points = (user.points || 0) + Math.floor(finalAmount);
    await user.save();

    // 6) Create Invoice (records discount for your records)
    const invoice = await Invoice.create({
      user: req.user._id,
      reservations: reservationIds,
      totalAmount: finalAmount,
      discountApplied: discountAmount,
      couponCode: couponCode || null
    });

    return res.json({
      success: true,
      message: 'Checkout completed.',
      invoiceId: invoice._id
    });
  } catch (err) {
    console.error('Checkout error:', err);
    return res.status(500).json({ error: 'Checkout failed.' });
  }
});

// POST /api/checkout/save
router.post('/save', auth, async (req, res) => {
  const { reservationIds } = req.body;
  if (!Array.isArray(reservationIds) || !reservationIds.length) {
    return res.status(400).json({ error: 'No reservations provided.' });
  }
  try {
    return res.json({ success: true, message: 'Transaction saved.' });
  } catch (err) {
    console.error('Save transaction error:', err);
    return res.status(500).json({ error: 'Save failed.' });
  }
});

// POST /api/checkout/quote
router.post('/quote', auth, async (req, res) => {
  const { reservationIds } = req.body;
  if (!Array.isArray(reservationIds) || !reservationIds.length) {
    return res.status(400).json({ error: 'No reservations provided.' });
  }
  try {
    await Reservation.updateMany(
      { _id: { $in: reservationIds }, user: req.user._id },
      { status: 'quoted' }
    );
    return res.json({ success: true, message: 'Quotation requested.' });
  } catch (err) {
    console.error('Quote error:', err);
    return res.status(500).json({ error: 'Quotation failed.' });
  }
});

// POST /api/checkout/cancel
router.post('/cancel', auth, async (req, res) => {
  const { reservationIds } = req.body;
  if (!Array.isArray(reservationIds) || !reservationIds.length) {
    return res.status(400).json({ error: 'No reservations provided.' });
  }
  try {
    await Reservation.updateMany(
      { _id: { $in: reservationIds }, user: req.user._id },
      { status: 'cancelled' }
    );
    return res.json({ success: true, message: 'Transaction cancelled.' });
  } catch (err) {
    console.error('Cancel error:', err);
    return res.status(500).json({ error: 'Cancellation failed.' });
  }
});

module.exports = router;