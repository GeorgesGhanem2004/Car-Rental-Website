// backend/controllers/adminController.js
const User = require('../models/User');
const Car = require('../models/Car');
const Reservation = require('../models/Reservation');
const CarGroup = require('../models/CarGroup');


// Users Management
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -tokens');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isAdmin: req.body.isAdmin },
      { new: true, runValidators: true }
    ).select('-password -tokens');
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Update failed' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Deletion failed' });
  }
};

// Cars Management
exports.getAllCars = async (req, res) => {
  try {
    const cars = await Car.find().populate('group');
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
};

exports.createCar = async (req, res) => {
  try {
    const car = new Car(req.body);
    await car.save();
    res.status(201).json(car);
  } catch (error) {
    res.status(400).json({ error: 'Invalid car data' });
  }
};

exports.updateCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json(car);
  } catch (error) {
    res.status(400).json({ error: 'Update failed' });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Deletion failed' });
  }
};

// Reservations Management
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('user', 'name email')
      .populate('car');
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
};

exports.updateReservationStatus = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
    res.json(reservation);
  } catch (error) {
    res.status(400).json({ error: 'Update failed' });
  }
};

// Car Group Management
exports.getAllGroups = async (req, res) => {
    try {
      const groups = await CarGroup.find();
      res.json(groups);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch groups' });
    }
  };
  
  exports.createGroup = async (req, res) => {
    try {
      const group = new CarGroup(req.body);
      await group.save();
      res.status(201).json(group);
    } catch (err) {
      res.status(400).json({ error: 'Invalid group data' });
    }
  };
  
  exports.updateGroup = async (req, res) => {
    try {
      const group = await CarGroup.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!group) return res.status(404).json({ error: 'Group not found' });
      res.json(group);
    } catch (err) {
      res.status(400).json({ error: 'Update failed' });
    }
  };
  
  exports.deleteGroup = async (req, res) => {
    try {
      const group = await CarGroup.findByIdAndDelete(req.params.id);
      if (!group) return res.status(404).json({ error: 'Group not found' });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Deletion failed' });
    }
  };