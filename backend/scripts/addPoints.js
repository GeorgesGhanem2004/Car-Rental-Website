// backend/scripts/addPoints.js
require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  // change this to match your test user
  const email = 'admin@example.com';
  const incAmt = 5000;

  const user = await User.findOne({ email });
  if (!user) {
    console.error('❌ User not found:', email);
    process.exit(1);
  }

  user.points += incAmt;
  await user.save();
  console.log(`✅ ${incAmt} points added. New balance: ${user.points}`);
  await mongoose.disconnect();
}
main().catch(err => {
  console.error(err);
  process.exit(1);
});