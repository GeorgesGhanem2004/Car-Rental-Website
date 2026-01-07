// backend/server.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const morgan = require('morgan');

const app = express();

// 1) Connect to MongoDB (updated options for Mongoose 6+)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// 2) Global middleware
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Remove session middleware (no longer needed with JWT)
// --- DELETED SESSION CONFIGURATION ---

// 3) Debug middleware (optional)
app.use((req, res, next) => {
  if (req.method === 'POST') console.log('BODY:', req.body);
  next();
});

// 4) API Routes (added auth middleware protection example)
app.use('/api/users',   require('./routes/users'))
app.use('/api', require('./routes/auth'));
app.use('/api/reservations', require('./routes/reservation'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/carGroups', require('./routes/carGroups'));
app.use('/api/checkout', require('./routes/checkout'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/stats', require('./routes/stats'));


// 5) Serve frontend (unchanged)
const FRONT = path.join(__dirname, '../frontend');
app.use('/css', express.static(path.join(FRONT, 'css')));
app.use('/js', express.static(path.join(FRONT, 'js')));
app.use('/assets', express.static(path.join(FRONT, 'assets')));
app.use('/', express.static(path.join(FRONT, 'views')));


// 6) 404 fallback
app.use((req, res) => {
  res.status(404).send('Not found');
});

// 7) Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});