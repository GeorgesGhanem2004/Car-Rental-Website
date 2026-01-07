// backend/scripts/seedReviews.js

require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

const User   = require('../models/User');
const Review = require('../models/Review');

async function main() {
  // 1) Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected for seeding reviews');

  // 2) Fetch all user IDs
  const users = await User.find().select('_id');
  if (users.length === 0) {
    console.error('❌ No users found! Create at least one user first.');
    process.exit(1);
  }

  // 3) Prepare some realistic English titles & comments
  const sampleTitles = [
    'Amazing Service',
    'Great Experience',
    'Highly Recommend',
    'Five Stars',
    'Will Rent Again',
    'Clean & Comfortable',
    'Fantastic Support',
    'Smooth Booking',
    'Excellent Car',
    'Exceptional Quality'
  ];

  const sampleComments = [
    'The car was clean and comfortable, and the staff was friendly.',
    'I had an amazing experience from start to finish.',
    'Highly recommended for anyone needing a reliable rental service.',
    'The booking process was smooth and easy.',
    'Excellent customer service and great selection of cars.',
    'The vehicle performed perfectly, no issues at all.',
    'Affordable rates and professional staff.',
    'I will definitely rent from them again.',
    'Quick pickup and drop-off, hassle-free experience.',
    'The insurance add-on gave me peace of mind.'
  ];

  // 4) Build 50 random reviews with English text
  const reviewsToInsert = Array.from({ length: 50 }).map(() => {
    const randomUser = faker.helpers.arrayElement(users);
    return {
      user:    randomUser._id,
      title:   faker.helpers.arrayElement(sampleTitles),
      rating:  faker.number.int({ min: 1, max: 5 }),
      comment: faker.helpers.arrayElement(sampleComments)
    };
  });

  // 5) Insert and report
  const inserted = await Review.insertMany(reviewsToInsert);
  console.log(`✅ Seeded ${inserted.length} English‐language reviews.`);

  // 6) Disconnect
  await mongoose.disconnect();
  console.log('🚪 Disconnected, done.');
}

main().catch(err => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});