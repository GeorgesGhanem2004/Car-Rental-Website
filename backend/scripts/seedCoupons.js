// backend/scripts/seedCoupons.js
require('dotenv').config();
const mongoose = require('mongoose');
const Coupon   = require('../models/Coupon');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await Coupon.deleteMany({});
  await Coupon.insertMany([
    { code: "CAR10", discount: 0.10, expires: new Date("2025-12-31") },
    { code: "CAR20", discount: 0.20, expires: new Date("2025-12-31") }
  ]);
  console.log('✅ Coupons seeded');
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});