const express = require('express');
const router  = express.Router();
const Coupon  = require('../models/Coupon');
const { auth }= require('../middleware/auth');

// GET /api/coupons/:code
router.get('/:code', auth, async (req, res) => {
  const code = req.params.code.toUpperCase();
  const coupon = await Coupon.findOne({ code });
  if (!coupon) return res.status(404).json({ error: 'Invalid code' });
  if (coupon.expires && coupon.expires < new Date()) {
    return res.status(410).json({ error: 'Coupon expired' });
  }
  res.json({ code: coupon.code, discount: coupon.discount });
});

module.exports = router;