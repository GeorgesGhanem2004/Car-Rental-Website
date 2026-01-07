// backend/controllers/reviewController.js
const Review = require('../models/Review');

// POST /api/reviews
exports.postReview = async (req, res) => {
  try {
    const { title, rating, comment } = req.body;
    if (!title || !rating || !comment) {
      return res.status(400).json({ error: 'Title, rating and comment are all required.' });
    }
    const review = await Review.create({
      user: req.user._id,
      title,
      rating,
      comment
    });
    return res.status(201).json(review);
  } catch (err) {
    console.error('❌ Failed to save review:', err);
    return res.status(500).json({ error: 'Failed to save review.' });
  }
};

// GET /api/reviews[?random=3]
exports.getReviews = async (req, res) => {
  try {
    if (req.query.random) {
      const size = Number(req.query.random) || 3;
      // aggregate sample for true random, then bring in user's name & profilePicture
      const reviews = await Review.aggregate([
        { $sample: { size } },
        { $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        { $project: {
            'user._id': 1,
            'user.name': 1,
            'user.profilePicture': 1,
            title: 1,
            rating: 1,
            comment: 1,
            createdAt: 1
        } }
      ]);
      return res.json(reviews);
    }
    // otherwise return all, populating name & profilePicture
    const reviews = await Review.find()
      .populate('user', 'name profilePicture')
      .sort('-createdAt');
    return res.json(reviews);
  } catch (err) {
    console.error('❌ Failed to fetch reviews:', err);
    return res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
};