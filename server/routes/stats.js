



























// const express = require('express')
// const router = express.Router()
// const Device = require('../models/Device')
// const BCSData = require('../models/BCSData')
// const PostureData = require('../models/PostureData')
// const TemperatureData = require('../models/TemperatureData')

// router.get('/', async (req, res) => {
//   try {
//     // Get device stats
//     const devices = await Device.find({})
//     const onlineDevices = devices.filter(d => d.status === 'online').length
//     const totalDevices = devices.length
//     const deviceUsage = totalDevices > 0 ? Math.round((onlineDevices / totalDevices) * 100) : 0

//     // Get latest temperature readings
//     const latestTemps = await TemperatureData.find({})
//       .sort({ timestamp: -1 })
//       .limit(devices.length)
//     const avgTemp = latestTemps.length > 0 
//       ? latestTemps.reduce((acc, curr) => acc + curr.temperature, 0) / latestTemps.length 
//       : 0

//     // Get BCS distribution
//     const bcsData = await BCSData.find({}).sort({ timestamp: -1 })
//     const avgBCS = bcsData.length > 0 
//       ? bcsData.reduce((acc, curr) => acc + curr.bcsScore, 0) / bcsData.length 
//       : 0

//     // Get posture distribution
//     const postureData = await PostureData.find({}).sort({ timestamp: -1 })
//     const postureCounts = postureData.reduce((acc, curr) => {
//       acc[curr.posture] = (acc[curr.posture] || 0) + 1
//       return acc
//     }, {})

//     const totalPostures = postureData.length
//     const postureDistribution = Object.entries(postureCounts).map(([posture, count]) => ({
//       posture: Number(posture),
//       count,
//       percentage: totalPostures > 0 ? Math.round((count / totalPostures) * 100) : 0
//     }))

//     res.json({
//       deviceStats: {
//         onlineDevices,
//         totalDevices,
//         deviceUsage,
//         averageTemperature: Number(avgTemp.toFixed(1))
//       },
//       bcsStats: {
//         averageBCS: Number(avgBCS.toFixed(1))
//       },
//       postureDistribution
//     })
//   } catch (error) {
//     console.error('Error fetching statistics:', error)
//     res.status(500).json({ error: 'Failed to fetch statistics' })
//   }
// })

// module.exports = router

// routes/stats.js
const express = require('express')
const router = express.Router()
const Device = require('../models/Device')
const BCSData = require('../models/BCSData')
const PostureData = require('../models/PostureData')
const TemperatureData = require('../models/TemperatureData')
const Pig = require('../models/Pig')
const Farm = require('../models/Farm')
const Barn = require('../models/Barn')
const Stall = require('../models/Stall')
const PigHealth = require('../models/PigHealthStatus')
const PigFertility = require('../models/PigFertility')
const PigHeatStatus = require('../models/PigHeatStatus'); // Adjust the path as necessary


router.get('/', async (req, res) => {
  try {
    const devices = await Device.find({})
    const pigs = await Pig.find({})

    const onlineDevices = devices.filter(d => d.status === 'online').length
    const totalDevices = devices.length
    const deviceUsage = totalDevices > 0 ? Math.round((onlineDevices / totalDevices) * 100) : 0

    const avgDeviceTemp = devices.length > 0
      ? devices.reduce((acc, d) => acc + (d.temperature || 0), 0) / devices.length
      : 0

    const latestTemps = await TemperatureData.find({}).sort({ timestamp: -1 })
    const avgTemp = latestTemps.length
      ? latestTemps.reduce((acc, curr) => acc + curr.temperature, 0) / latestTemps.length
      : 0

    const bcsData = await BCSData.find({}).sort({ timestamp: -1 })
    const avgBCS = bcsData.length
      ? bcsData.reduce((acc, curr) => acc + curr.bcsScore, 0) / bcsData.length
      : 0

    const postureData = await PostureData.find({})
    const postureCounts = postureData.reduce((acc, curr) => {
      acc[curr.posture] = (acc[curr.posture] || 0) + 1
      return acc
    }, {})

    const postureDistribution = Object.entries(postureCounts).map(([posture, count]) => ({
      posture: Number(posture),
      count,
      percentage: (count / postureData.length) * 100
    }))

    const pigHealthData = await PigHealth.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: "$pigId", status: { $first: "$status" } } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ])

    const pigFertilityData = await PigFertility.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: "$pigId", status: { $first: "$status" } } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ])

    const healthStats = pigHealthData.reduce((acc, curr) => {
      acc[curr._id.replace(' ', '')] = curr.count
      return acc
    }, {})

    const fertilityStats = pigHealthData.reduce((acc, curr) => {
      acc[curr._id] = curr.count
      return acc
    }, {})

    const fertilityStatuses = ["In-Heat", "Pre-Heat", "Open", "Ready-To-Breed"];

    const pigFertilityAggregated = await PigFertility.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: "$pigId", status: { $first: "$status" } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      {
        $unionWith: {
          coll: "PigFertility", // Ensure collection name is correct
          pipeline: [
            { $match: { status: { $nin: fertilityStatuses } } },
            { $group: { _id: "$status", count: { $sum: 0 } } }, // Add missing statuses with 0 count
          ],
        },
      },
    ]);

    const pigHeatStatusData = await PigHeatStatus.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: "$pigId", status: { $first: "$status" } } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Calculate totals for each heat status
    const pigHeatStats = {
      totalOpen: pigHeatStatusData.find(h => h._id === 'open')?.count || 0,
      totalBred: pigHeatStatusData.find(h => h._id === 'bred')?.count || 0,
      totalPregnant: pigHeatStatusData.find(h => h._id === 'pregnant')?.count || 0,
      totalFarrowing: pigHeatStatusData.find(h => h._id === 'farrowing')?.count || 0,
      totalWeaning: pigHeatStatusData.find(h => h._id === 'weaning')?.count || 0,
    };
    
    const normalizeStatus = (status) => status?.trim().toLowerCase().replace(/\s+/g, "-");

    const pigFertilityStats = pigFertilityAggregated.reduce((acc, curr) => {
      acc[curr._id.replace(/\s+/g, '')] = curr.count;
      return acc;
    }, {});

    // New: Calculate total pigs per barn and per stall
    const pigsPerBarn = await Pig.aggregate([
      { $group: { _id: "$currentLocation.barnId", totalPigs: { $sum: 1 } } }
    ]);

    const pigsPerStall = await Pig.aggregate([
      { $group: { _id: "$currentLocation.stallId", totalPigs: { $sum: 1 } } }
    ]);

    // Fetch barn and stall names
    const barns = await Barn.find({});
    const stalls = await Stall.find({});

    // Create a map of barnId to barn name
    const barnMap = barns.reduce((acc, barn) => {
      acc[barn._id.toString()] = barn.name;
      return acc;
    }, {});

    // Create a map of stallId to stall name and barnId
    const stallMap = stalls.reduce((acc, stall) => {
      acc[stall._id.toString()] = {
        name: stall.name,
        barnId: stall.barnId.toString()
      };
      return acc;
    }, {});

    // Format the results for barns
    const barnStats = {};
    barns.forEach(barn => {
      const barnId = barn._id.toString();
      const barnName = barnMap[barnId];
      const totalPigs = pigsPerBarn.find(b => b._id.toString() === barnId)?.totalPigs || 0;
      barnStats[barnName] = totalPigs;
    });

    // Format the results for stalls, grouped by barn
    const stallStats = {};
    barns.forEach(barn => {
      const barnId = barn._id.toString();
      const barnName = barnMap[barnId];
      stallStats[barnName] = {};

      // Find all stalls in this barn
      const stallsInBarn = stalls.filter(stall => stall.barnId.toString() === barnId);
      stallsInBarn.forEach(stall => {
        const stallId = stall._id.toString();
        const stallName = stallMap[stallId].name;
        const totalPigs = pigsPerStall.find(s => s._id.toString() === stallId)?.totalPigs || 0;
        stallStats[barnName][stallName] = totalPigs;
      });
    });

    res.json({
      deviceStats: {
        onlineDevices,
        totalDevices: devices.length,
        deviceUsage: devices.length ? Math.round((onlineDevices / devices.length) * 100) : 0,
        averageTemperature: Number(avgDeviceTemp.toFixed(1)),
        latestTemperatureStats: Number(avgTemp.toFixed(1))
      },
      bcsStats: {
        averageBCS: Number(avgBCS.toFixed(1))
      },
      postureDistribution,
      pigStats: {
        totalPigs: pigs.length,
        averageAge: pigs.length ? Number((pigs.reduce((acc, p) => acc + (p.age || 0), 0) / pigs.length).toFixed(1)) : 0
      },
      pigHealthStats: {
        totalAtRisk: pigHealthData.filter(h => h._id === 'at risk')[0]?.count || 0,
        totalHealthy: pigHealthData.filter(h => h._id === 'healthy').length,
        totalCritical: pigHealthData.filter(h => h._id === 'critical').length,
        totalNoMovement: pigHealthData.filter(h => h._id === 'no movement').length
      },
      pigHeatStats, // Add heat stats to the response
      barnStats, // Add total pigs per barn
      stallStats, // Add total pigs per stall
      pigFertilityStats: {
        InHeat: pigFertilityAggregated.find(f => normalizeStatus(f._id) === "in-heat")?.count || 0,
        PreHeat: pigFertilityAggregated.find(f => normalizeStatus(f._id) === "pre-heat")?.count || 0,
        Open: pigFertilityAggregated.find(f => normalizeStatus(f._id) === "open")?.count || 0,
        ReadyToBreed: pigFertilityAggregated.find(f => normalizeStatus(f._id) === "ready-to-breed")?.count || 0,
      },
      farmBarnStallStats: {
        totalFarms: await Farm.countDocuments({}),
        totalBarns: await Barn.countDocuments({}),
        totalStalls: await Stall.countDocuments({})
      }
    })

  } catch (error) {
    console.error('Error fetching statistics:', error)
    res.status(500).json({ error: 'Failed to retrieve statistics' })
  }
})

module.exports = router
