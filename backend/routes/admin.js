// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, admin } = require('../middleware/auth');

// Users
router.get('/users', auth, admin, adminController.getAllUsers);
router.put('/users/:id', auth, admin, adminController.updateUserRole);
router.delete('/users/:id', auth, admin, adminController.deleteUser);

// Cars
router.get('/cars', auth, admin, adminController.getAllCars);
router.post('/cars', auth, admin, adminController.createCar);
router.put('/cars/:id', auth, admin, adminController.updateCar);
router.delete('/cars/:id', auth, admin, adminController.deleteCar);

// Car Groups (admin CRUD)
router.get   ('/groups',      auth, admin, adminController.getAllGroups);
router.post  ('/groups',      auth, admin, adminController.createGroup);
router.put   ('/groups/:id',  auth, admin, adminController.updateGroup);
router.delete('/groups/:id',  auth, admin, adminController.deleteGroup);

// Reservations
router.get('/reservations', auth, admin, adminController.getAllReservations);
router.put('/reservations/:id', auth, admin, adminController.updateReservationStatus);

module.exports = router;