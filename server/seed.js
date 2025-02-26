/**
 * seed.js
 * Usage:
 *   2) Run: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection details from environment variables
const DATABASE_HOST = process.env.DATABASE_HOST; 
const DATABASE_PORT = process.env.DATABASE_PORT;
const DATABASE_DB = process.env.MONGO_INITDB_DATABASE;
const DATABASE_USERNAME = process.env.MONGO_INITDB_ROOT_USERNAME; 
const DATABASE_PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD;

const URI = `mongodb://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_DB}?replicaSet=rs0&authSource=admin`;

// Import Models (adjust paths if your structure differs)
const Farm = require('./models/Farm');
const Barn = require('./models/Barn');
const Stall = require('./models/Stall');
const Pig = require('./models/Pig');
const PigHealthStatus = require('./models/PigHealthStatus');
const PigFertility = require('./models/PigFertility');
const PigHeatStatus = require('./models/PigHeatStatus');
const PigPosture = require('./models/PostureData');
const PigBCS = require('./models/BCSData');
const PigVulvaSwelling = require('./models/PigVulvaSwelling');
const PigBreathRate = require('./models/PigBreathRate');
const Device = require('./models/Device');
const DeviceData = require('./models/TemperatureData');

/** Helpers for random data generation */
function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  // inclusive of min..max
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max, decimals = 1) {
  const scale = Math.pow(10, decimals);
  return Math.round((Math.random() * (max - min) + min) * scale) / scale;
}

/**
 * Generate 30 timestamps spread over the last 30 days (one per day)
 */
function getDailyTimestamps(days = 30) {
  const timestamps = [];
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  for (let i = days - 1; i >= 0; i--) {
    timestamps.push(new Date(now - i * oneDay));
  }
  return timestamps;
}

async function seedDatabase() {
  try {
    // 1. Connect to MongoDB using Mongoose
    await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // 2. Clear existing data (optional but recommended for a fresh start)
    await Promise.all([
      Farm.deleteMany({}),
      Barn.deleteMany({}),
      Stall.deleteMany({}),
      Pig.deleteMany({}),
      PigHealthStatus.deleteMany({}),
      PigFertility.deleteMany({}),
      PigHeatStatus.deleteMany({}),
      PigPosture.deleteMany({}),
      PigBCS.deleteMany({}),
      PigVulvaSwelling.deleteMany({}),
      PigBreathRate.deleteMany({}),
      Device.deleteMany({}),
      DeviceData.deleteMany({})
    ]);

    // 3. Create 2 Farms
    const farms = [];
    for (let i = 1; i <= 2; i++) {
      const farm = await Farm.create({
        name: `Farm ${i}`,
        location: `Location ${i}`
      });
      farms.push(farm);
    }

    // 4. Create 3 Barns per Farm
    const barns = [];
    for (let farm of farms) {
      for (let j = 1; j <= 3; j++) {
        const barn = await Barn.create({
          name: `Barn ${j}`,
          farmId: farm._id
        });
        barns.push(barn);
      }
    }

    // 5. Create 5 Stalls per Barn
    const stalls = [];
    for (let barn of barns) {
      for (let k = 1; k <= 5; k++) {
        const stall = await Stall.create({
          name: `Stall ${k}`,
          barnId: barn._id, // reference to Barn
          farmId: barn.farmId
        });
        stalls.push(stall);
      }
    }

    // Pig Breeds -- for random selection
    const pigBreeds = ['Yorkshire', 'Landrace', 'Duroc',
      'Berkshire', 'Hampshire', 'Chester White', 'Tamworth'];

    let stallCount = 0; // for unique pig ids
    // 6. Create Pigs for each Stall (4-6 pigs per stall)
    const pigs = [];
    for (let stall of stalls) {
      const pigCount = getRandomInt(4, 6);
      for (let p = 1; p <= pigCount; p++) {
        const pig = await Pig.create({
          pigId: stallCount + p,              // unique pig id (within the stall)
          tag: `Tag-${p}`,                // unique tag for each pig
          /* grabbing farm and barn id from stall */
          currentLocation: { stallId: stall._id, barnId: stall.barnId, farmId: stall.farmId },
          lastUpdate: new Date(),
          breed: getRandomItem(pigBreeds),
          age: getRandomInt(1, 36),        // random months in age
          active: true
        });
        pigs.push(pig);
      }
      stallCount += pigCount; // increment for unique pig ids
    }

    // 7. Generate 30 daily timestamps (one for each day of the month)
    const timestamps = getDailyTimestamps(30);

    // Time series value options
    const healthStatuses = ['at risk', 'healthy', 'critical', 'no movement'];
    const fertilityStatuses = ['in heat', 'Pre-Heat', 'Open', 'ready to breed'];
    const heatStatuses = ['open', 'bred', 'pregnant', 'farrowing', 'weaning'];
    const vulvaSwellingValues = ['low', 'moderate', 'high'];

    // 8. Populate time series data for each pig (30 entries per metric)
    for (let pig of pigs) {
      // Health Status entries
      const healthEntries = timestamps.map(ts => ({
        pigId: pig._id,
        timestamp: ts,
        status: getRandomItem(healthStatuses)
      }));
      await PigHealthStatus.insertMany(healthEntries);

      // Fertility entries
      const fertilityEntries = timestamps.map(ts => ({
        pigId: pig._id,
        timestamp: ts,
        status: getRandomItem(fertilityStatuses)
      }));
      await PigFertility.insertMany(fertilityEntries);

      // Heat Status entries
      const heatEntries = timestamps.map(ts => ({
        pigId: pig._id,
        timestamp: ts,
        status: getRandomItem(heatStatuses)
      }));
      await PigHeatStatus.insertMany(heatEntries);

      // Posture entries (score between 1 and 5)
      const postureEntries = timestamps.map(ts => ({
        pigId: pig._id,
        timestamp: ts,
        score: getRandomInt(1, 5)
      }));
      await PigPosture.insertMany(postureEntries);

      // BCS entries (score between 2.0 and 4.0)
      const bcsEntries = timestamps.map(ts => ({
        pigId: pig._id,
        timestamp: ts,
        score: getRandomFloat(2, 4, 1)
      }));
      await PigBCS.insertMany(bcsEntries);

      // Vulva Swelling entries
      const vulvaEntries = timestamps.map(ts => ({
        pigId: pig._id,
        timestamp: ts,
        value: getRandomItem(vulvaSwellingValues)
      }));
      await PigVulvaSwelling.insertMany(vulvaEntries);

      // Breath Rate entries (value between 15 and 30)
      const breathEntries = timestamps.map(ts => ({
        pigId: pig._id,
        timestamp: ts,
        rate: getRandomInt(15, 30)
      }));
      await PigBreathRate.insertMany(breathEntries);

      // Update the pig's lastUpdate to the latest timestamp
      await Pig.findByIdAndUpdate(pig._id, { lastUpdate: timestamps[timestamps.length - 1] });
    }

    // 9. Create 10 Devices (Realtime Temperature Sensors)
    const deviceStatus = ['online', 'offline', 'warning'];
    const devices = [];
    for (let i = 1; i <= 10; i++) {
      const device = await Device.create({
        deviceId: i,
        deviceName: `Sensor-${i}`,
        deviceType: 'Temperature',
        status: getRandomItem(deviceStatus),
        temperature: getRandomFloat(20, 30, 1)
      });
      devices.push(device);
    }

    // 10. Create DeviceData for each Device (30 entries per device for the month)
    let p = 1; // cheap fix for unique record id, should fix later
    for (let device of devices) {
      const deviceDataEntries = timestamps.map(ts => ({
        recordId: p++, // cheap fix unique record id, should fix later
        deviceId: device.deviceId, 
        timestamp: ts,
        temperature: getRandomFloat(20, 30, 1)
      }));
      await DeviceData.insertMany(deviceDataEntries);
    }

    console.log('\nDatabase seeded successfully!');
    console.log(`
      Created:
        - ${farms.length} Farms
        - ${barns.length} Barns
        - ${stalls.length} Stalls
        - ${pigs.length} Pigs
        - Realtime data for ${devices.length} Devices
    `);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
