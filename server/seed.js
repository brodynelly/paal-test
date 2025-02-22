/**
 * seed.js
 *
 * Generates 40 documents in each of the following collections:
 *   - Device
 *   - Pig
 *   - BCSData
 *   - PostureData
 *   - TemperatureData
 *
 * Each collection references each other in a consistent way:
 *   - pigId in [1..40]
 *   - deviceId in [1..40]
 *   - recordId in [1..40] for BCS/Posture/Temperature
 *
 * Usage:
 *   1) Create a .env file with MONGODB_URI=your_connection_string
 *   2) Run: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import Models (adjust paths if your structure differs)
const Device = require('./models/Device');
const Pig = require('./models/Pig');
const BCSData = require('./models/BCSData');
const PostureData = require('./models/PostureData');
const TemperatureData = require('./models/TemperatureData');

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

function getRandomDateWithinLastDays(days = 30) {
  const now = Date.now();
  const past = now - days * 24 * 60 * 60 * 1000;
  const randomTime = getRandomInt(past, now);
  return new Date(randomTime);
}

async function seedDatabase() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 2. Clear existing data (optional but recommended for a fresh start)
    await Promise.all([
      Device.deleteMany({}),
      Pig.deleteMany({}),
      BCSData.deleteMany({}),
      PostureData.deleteMany({}),
      TemperatureData.deleteMany({})
    ]);

    // 3. Create 40 Devices
    const statusList = ['online', 'offline', 'warning'];
    const devicesData = [];
    for (let i = 1; i <= 40; i++) {
      devicesData.push({
        deviceId: i,
        deviceName: `TempSensor-${i}`,
        deviceType: 'Temperature',
        status: getRandomItem(statusList),
        temperature: getRandomFloat(20, 30, 1), // random between 20.0 and 30.0
      });
    }
    const devices = await Device.create(devicesData);

    // 4. Create 40 Pigs
    const pigBreeds = ['Large White', 'Yorkshire', 'Duroc', 'Hampshire', 'Berkshire'];
    const pigsData = [];
    for (let i = 1; i <= 40; i++) {
      pigsData.push({
        pigId: i,
        groupId: getRandomInt(1, 5), // random group 1..5
        breed: getRandomItem(pigBreeds),
        age: getRandomInt(1, 36),        // random months in age
        bcsScore: getRandomFloat(2, 4),  // typical BCS range, can be 2.0..4.0
        posture: getRandomInt(1, 3)      // 1..3
      });
    }
    const pigs = await Pig.create(pigsData);

    // 5. Create 40 BCSData entries (one per pigId)
    const bcsDataArray = [];
    for (let i = 1; i <= 40; i++) {
      bcsDataArray.push({
        recordId: i,                     // required/unique
        pigId: i,                        // one-to-one for demonstration
        bcsScore: getRandomFloat(2, 4),
        timestamp: getRandomDateWithinLastDays(30) // random date in last 30 days
      });
    }
    const bcsData = await BCSData.create(bcsDataArray);

    // 6. Create 40 PostureData entries (one per pigId)
    const postureDataArray = [];
    for (let i = 1; i <= 40; i++) {
      postureDataArray.push({
        recordId: i,
        pigId: i,
        posture: getRandomInt(1, 3), // e.g., 1..3
        timestamp: getRandomDateWithinLastDays(30)
      });
    }
    const postureData = await PostureData.create(postureDataArray);

    // 7. Create 40 TemperatureData entries (one per deviceId)
    const temperatureDataArray = [];
    for (let i = 1; i <= 40; i++) {
      temperatureDataArray.push({
        recordId: i,
        deviceId: i,
        temperature: getRandomFloat(20, 30),
        timestamp: getRandomDateWithinLastDays(30)
      });
    }
    const temperatureData = await TemperatureData.create(temperatureDataArray);

    // 8. Confirm success
    console.log('\nDatabase seeded successfully!');
    console.log(`
      Created:
        - ${devices.length} Devices
        - ${pigs.length} Pigs
        - ${bcsData.length} BCSData records
        - ${postureData.length} PostureData records
        - ${temperatureData.length} TemperatureData records
    `);

    // 9. Close the script
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
