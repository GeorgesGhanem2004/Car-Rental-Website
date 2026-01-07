// backend/routes/users.js
const express      = require('express');
const router       = express.Router();
const User         = require('../models/User');
const Coupon       = require('../models/Coupon');
const { auth }     = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// GET /api/users/me
// Returns name, email, points, and profilePicture
router.get('/me', auth, (req, res) => {
  const { name, email, points, profilePicture } = req.user;
  res.json({ name, email, points, profilePicture });
});

// PATCH /api/users/me
// { name?: string, email?: string, profilePicture?: string }
router.patch('/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowed = ['name', 'email', 'profilePicture'];
  if (!updates.every(u => allowed.includes(u))) {
    return res.status(400).json({ error: 'Invalid updates' });
  }
  try {
    updates.forEach(field => req.user[field] = req.body[field]);
    await req.user.save();
    const { name, email, points, profilePicture } = req.user;
    res.json({ name, email, points, profilePicture });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});


// POST /api/users/redeem
// { pointsCost: number, rewardType: string }
router.post('/redeem', auth, async (req, res) => {
  const { pointsCost, rewardType } = req.body;
  const cost = Number(pointsCost);
  if (isNaN(cost) || cost <= 0) {
    return res.status(400).json({ error: 'Invalid points cost.' });
  }
  if (req.user.points < cost) {
    return res.status(400).json({ error: 'Insufficient points.' });
  }

  // 1) Deduct points
  req.user.points -= cost;
  await req.user.save();

  // 2) Map rewardType to discount fraction
  let discountFraction = 0;
  if (rewardType.startsWith('25%')) discountFraction = 0.25;
  else if (rewardType.startsWith('50%')) discountFraction = 0.5;
  else discountFraction = 1.0; // Free ride

  // 3) Generate a one-time coupon
  const code = uuidv4().split('-')[0].toUpperCase();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

  const coupon = await Coupon.create({
    user: req.user._id,
    code,
    discount: discountFraction,
    expires
  });

  // 4) Return both new balance and the coupon data
  res.json({
    success: true,
    newBalance: req.user.points,
    redeemed: rewardType,
    couponCode: coupon.code,
    discount: coupon.discount,
    expires: coupon.expires
  });
});

module.exports = router;