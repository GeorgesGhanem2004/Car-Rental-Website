// backend/routes/reviews.js
const express = require('express');
const router  = express.Router();
const { auth } = require('../middleware/auth');
const {
  postReview,
  getReviews
} = require('../controllers/reviewController');

// submit a new review (logged-in users only)
router.post('/', auth, postReview);

// fetch reviews; add ?random=N to get N random ones
router.get('/', getReviews);

module.exports = router;