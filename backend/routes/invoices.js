// backend/routes/invoices.js

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { listInvoices } = require('../controllers/invoiceController');

// GET /api/invoices
router.get('/', auth, listInvoices);

module.exports = router;