#!/usr/bin/env node
// backend/scripts/resetAdminPassword.js

const path = require('path');
// Tell dotenv exactly where your .env lives:
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Replace these with your admin’s email & desired new password:
    const email   = 'admin@example.com';
    const newPass = 'MyNewAdminPass123!';

    const hash = await bcrypt.hash(newPass, 12);
    const user = await User.findOneAndUpdate(
      { email },
      { password: hash },
      { new: true }
    );

    if (!user) {
      console.error(`❌ No user found with email ${email}`);
      process.exit(1);
    }

    console.log(`✅ Password for ${email} has been reset to: ${newPass}`);
    process.exit(0);
  } catch (err) {
    console.error('Error resetting password:', err);
    process.exit(1);
  }
})();