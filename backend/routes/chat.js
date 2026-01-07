// backend/routes/chat.js

const express = require('express');
const router  = express.Router();
const Car     = require('../models/Car');
const Review  = require('../models/Review');

// Your 10 branch locations
const branches = [
  { name: 'Beirut Airport', hours: '08:00–20:00 daily', address: 'Khalde, Beirut, Lebanon',        phone: '+961 1 628 195' },
  { name: 'Tripoli',        hours: '08:00–20:00 daily', address: 'Al-Mina District, Tripoli, Lebanon', phone: '+961 6 123 456' },
  { name: 'Sidon',          hours: '08:00–20:00 daily', address: 'Corniche Al-Mina, Sidon, Lebanon',    phone: '+961 7 234 567' },
  { name: 'Baalbek',        hours: '08:00–20:00 daily', address: 'Beqaa Valley Hwy, Baalbek, Lebanon',  phone: '+961 8 345 678' },
  { name: 'Zahle',          hours: '08:00–20:00 daily', address: 'Zahle Downtown, Zahle, Lebanon',      phone: '+961 8 456 789' },
  { name: 'Tyre',           hours: '08:00–20:00 daily', address: 'Tyre Main Street, Tyre, Lebanon',     phone: '+961 7 567 890' },
  { name: 'Jounieh',        hours: '08:00–20:00 daily', address: 'Bay Street, Jounieh, Lebanon',        phone: '+961 9 678 901' },
  { name: 'Byblos',         hours: '08:00–20:00 daily', address: 'Historic Souk Area, Jbeil, Lebanon',  phone: '+961 9 234 567' },
  { name: 'Batroun',        hours: '08:00–20:00 daily', address: 'Main Street, Batroun, Lebanon',       phone: '+961 6 234 567' },
  { name: 'Dbayeh',         hours: '08:00–20:00 daily', address: 'Highway 51 (Dbayeh), Matn, Lebanon',  phone: '+961 4 526 101' }
];

router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'No message provided' });
  }
  const text = message.trim().toLowerCase();

  try {
    // 1) Branch inquiries
    if (/\b(branch|location)\b/.test(text)) {
      const list = branches
        .map(b => `• ${b.name}: ${b.address} (Hours: ${b.hours}; Tel: ${b.phone})`)
        .join('\n');
      return res.json({ reply: `📍 Our branches:\n${list}` });
    }

    // 2) “Most expensive” car
    if (/\b(expensive)\b/.test(text)) {
      const car = await Car.findOne().sort({ dailyRate: -1 }).lean();
      if (car) {
        return res.json({
          reply: `💎 Our priciest car is the ${car.brand} ${car.model} (${car.group}) at $${car.dailyRate}/day.`
        });
      } else {
        return res.json({ reply: `⚠️ Sorry, I couldn’t find any cars right now.` });
      }
    }

    // 3) General car inquiries
    if (/\b(car|vehicle|rent)\b/.test(text)) {
      const cars = await Car.find().limit(5).lean();
      if (cars.length === 0) {
        return res.json({ reply: `⚠️ We have no cars listed at the moment.` });
      }
      const list = cars
        .map(c => `• ${c.brand} ${c.model} (${c.group}) — $${c.dailyRate}/day`)
        .join('\n');
      return res.json({ reply: `🚗 Here are some of our cars:\n${list}` });
    }

    // 4) Review inquiries
    if (/\b(review|feedback)\b/.test(text)) {
      const reviews = await Review.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('user', 'name')
        .lean();
      if (reviews.length === 0) {
        return res.json({ reply: `ℹ️ No reviews yet—be the first to leave one!` });
      }
      const list = reviews
        .map(r => `• ${r.user.name} (${r.rating}/5): "${r.title}"\n  ${r.comment}`)
        .join('\n\n');
      return res.json({ reply: `📝 Our latest reviews:\n\n${list}` });
    }

    // 5) Fallback—all other questions
    return res.json({
      reply: `🤖 I can only help with CarRental questions about branches, cars, reviews or booking.`
    });

  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Chat failed' });
  }
});

module.exports = router;