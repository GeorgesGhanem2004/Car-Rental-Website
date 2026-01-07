// backend/controllers/invoiceController.js

const Invoice = require('../models/Invoice');

exports.listInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user._id })
      .populate({
        path: 'reservations',
        populate: { path: 'car', select: 'brand model group dailyRate' }
      })
      .sort('-createdAt');

    res.json(invoices);
  } catch (err) {
    console.error('Error listing invoices:', err);
    res.status(500).json({ error: 'Failed to retrieve invoices' });
  }
};