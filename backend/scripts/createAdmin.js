// backend/scripts/createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdmin() {
  try {
    // Connect without deprecated options
    await mongoose.connect(process.env.MONGODB_URI);

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      if (existingAdmin.isAdmin) {
        console.log('✅ Admin already exists:', existingAdmin.email);
      } else {
        // Update existing user to admin
        existingAdmin.isAdmin = true;
        await existingAdmin.save();
        console.log('⚠️  Existing user promoted to admin:', existingAdmin.email);
      }
    } else {
      // Create new admin
      const admin = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'SecurePassword123',
        isAdmin: true
      });
      await admin.save();
      console.log('✅ New admin created:', admin.email);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();