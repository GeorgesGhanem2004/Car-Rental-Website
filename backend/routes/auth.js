// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// POST /api/signup
router.post('/signup', authController.signup);

// POST /api/login
router.post('/login', authController.login);

// POST /api/logout
router.post('/logout', auth, authController.logout);

// GET /api/me
router.get('/me', auth, authController.getProfile);

module.exports = router;