// backend/routes/stats.js
const express     = require('express');
const router      = express.Router();
const Reservation = require('../models/Reservation');
const Car         = require('../models/Car');
const mongoose    = require('mongoose');

/**
 * GET /api/stats/popular-car
 * Returns the single most-booked car (brand & model & count)
 */
router.get('/popular-car', async (req, res) => {
  try {
    const result = await Reservation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$car', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
      // join to Car to get brand/model
      {
        $lookup: {
          from: 'cars',
          localField: '_id',
          foreignField: '_id',
          as: 'carInfo'
        }
      },
      { $unwind: '$carInfo' },
      {
        $project: {
          _id: 0,
          carId: '$_id',
          brand: '$carInfo.brand',
          model: '$carInfo.model',
          bookings: '$count'
        }
      }
    ]);

    if (result.length === 0) {
      return res.json({ message: 'No completed reservations yet.' });
    }
    res.json(result[0]);
  } catch (err) {
    console.error('Error in popular-car:', err);
    res.status(500).json({ error: 'Failed to compute popular car' });
  }
});

/**
 * GET /api/stats/average-rate
 * Returns the average daily rental fee actually paid
 */
router.get('/average-rate', async (req, res) => {
  try {
    const result = await Reservation.aggregate([
      { $match: { status: 'completed' } },
      {
        $project: {
          // compute days as fractional days
          days: {
            $divide: [
              { $subtract: ['$returnAt', '$pickupAt'] },
              1000 * 60 * 60 * 24
            ]
          },
          totalPrice: 1
        }
      },
      // guard against zero-day (shouldn't happen)
      { $match: { days: { $gt: 0 } } },
      {
        $project: {
          dailyRatePaid: { $divide: ['$totalPrice', '$days'] }
        }
      },
      {
        $group: {
          _id: null,
          avgDailyRate: { $avg: '$dailyRatePaid' }
        }
      },
      {
        $project: {
          _id: 0,
          averageDailyRate: { $round: ['$avgDailyRate', 2] }
        }
      }
    ]);

    res.json(result[0] || { averageDailyRate: 0 });
  } catch (err) {
    console.error('Error in average-rate:', err);
    res.status(500).json({ error: 'Failed to compute average rate' });
  }
});

module.exports = router;