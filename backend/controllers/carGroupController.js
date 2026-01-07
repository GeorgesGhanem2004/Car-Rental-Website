// backend/controllers/carGroupController.js
const CarGroup = require('../models/CarGroup');
const Car      = require('../models/Car');

/* GET /api/carGroups/:name
   returns { specs:{…}, cars:[…] } */
exports.getGroup = async (req, res) => {
  try {
    const groupName = req.params.name;
    const specs     = await CarGroup.findOne({ name: groupName });
    if (!specs) return res.status(404).json({ error: 'Group not found' });

    const cars = await Car.find({ group: groupName })
                          .select('brand model dailyRate imagePath');

    res.json({ specs, cars });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
