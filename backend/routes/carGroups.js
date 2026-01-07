// backend/routes/carGroups.js
const express = require('express');
const router  = express.Router();
const { getGroup } = require('../controllers/carGroupController');

router.get('/:name', getGroup);   // no auth middleware

module.exports = router;
