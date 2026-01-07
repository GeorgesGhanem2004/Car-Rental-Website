/*
  Run once:
     node scripts/seedCars.js
*/

require('dotenv').config();
const mongoose  = require('mongoose');
const Car       = require('../models/Car');
const CarGroup  = require('../models/CarGroup');
const carsData  = require('../data/cars.json');

const groupSpecs = {
  Convertible : { engineSize:2500, numDoors:2, numPassengers:2, fuelType:'Gasoline', gearbox:'Automatic', hasAC:true, electricWindows:true },
  EV          : { engineSize:0,    numDoors:4, numPassengers:5, fuelType:'Electric', gearbox:'Single‑speed', hasAC:true, electricWindows:true },
  Hybrid      : { engineSize:1800, numDoors:4, numPassengers:5, fuelType:'Hybrid',   gearbox:'CVT',          hasAC:true, electricWindows:true },
  'Luxury Sedan':{engineSize:3500, numDoors:4, numPassengers:5, fuelType:'Gasoline', gearbox:'Automatic',    hasAC:true, electricWindows:true },
  Minivan     : { engineSize:3500, numDoors:5, numPassengers:7, fuelType:'Gasoline', gearbox:'Automatic',    hasAC:true, electricWindows:true },
  SUV         : { engineSize:3500, numDoors:5, numPassengers:7, fuelType:'Gasoline', gearbox:'Automatic',    hasAC:true, electricWindows:true }
};

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  /* 1) upsert each group spec */
  for (const [name, specs] of Object.entries(groupSpecs)) {
    await CarGroup.findOneAndUpdate({ name }, { name, ...specs }, { upsert:true, new:true });
  }

  /* 2) clear cars then insert fresh */
  await Car.deleteMany({});
  await Car.insertMany(carsData);

  console.log('✅ Groups & cars seeded');
  process.exit();
})();
