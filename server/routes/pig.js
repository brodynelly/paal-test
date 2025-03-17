// routes/pig.js
const express = require('express')
const router = express.Router()
const Pig = require('../models/Pig')
const BCSData = require('../models/BCSData')
const PostureData = require('../models/PostureData')
const PigFertility = require('../models/PigFertility');
const PigHeatStatus = require('../models/PigHeatStatus');

// Get all pigs
router.get('/', async (req, res) => {
  try {
    const pigs = await Pig.find({}).sort({ lastUpdate: -1 })
    
    const transformedPigs = pigs.map(pig => ({
      owner: `PIG-${pig.pigId.toString().padStart(3, '0')}`,
      status: pig.bcsScore >= 4 ? "critical" : pig.bcsScore >= 3 ? "healthy" : "suspicious",
      costs: pig.age,
      region: `Group ${pig.currentLocation.stallId}`,
      stability: Math.floor(Math.random() * 100),
      lastEdited: pig.lastUpdate
        ? new Date(pig.lastUpdate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
      breed: pig.breed
    }))

    res.json(transformedPigs)
  } catch (error) {
    console.error('Error fetching pigs:', error)
    res.status(500).json({ error: 'Failed to fetch pigs' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid pig id' });
    }
    const pig = await Pig.findOne({ pigId: id });
    if (!pig) {
      return res.status(404).json({ error: 'Pig not found' });
    }
    res.json(pig);
  } catch (error) {
    console.error('Error fetching pig:', error);
    res.status(500).json({ error: 'Failed to fetch pig' });
  }
});


// Get pig BCS history
router.get('/:id/bcs', async (req, res) => {
  try {

    // all of the bcs tables are calling the obj id, we need to fix this by: 
    //    1. calling the pigId and then 
    //    2. finding the obj id

     // Step 1: Find the corresponding ObjectId for the pigId (which is a number)
     const pig = await Pig.findOne({ pigId: parseInt(req.params.id) });

     if (!pig) {
       return res.status(404).json({ error: 'Pig not found' });
     }

    const bcsData = await BCSData.find({  pigId: pig._id  })
      .sort({ timestamp: -1 })
      .limit(100)

    // Step 3: Manipulate the bcsData to include the pigId in the result
    const result = bcsData.map((data) => ({
      ...data.toObject(),
      pigId: pig.pigId  // replace the pigId with the original pigId
    }));

    res.json(result)
  } catch (error) {
    console.error('Error fetching BCS data:', error)
    res.status(500).json({ error: 'Failed to fetch BCS data' })
  }
})

// creating a new pig 
router.post('/', async (req, res) => {
  try {
    const { pigId, tag, breed, age, currentLocation } = req.body;
    
    // Check if a pig with the given pigId already exists.
    const existingPig = await Pig.findOne({ pigId });
    if (existingPig) {
      return res.status(400).json({ error: 'Pig with this pigId already exists.' });
    }

    // Create a new pig document using currentLocation directly.
    const newPig = await Pig.create({
      pigId: Number(pigId),
      tag,
      breed,
      age: Number(age),
      currentLocation: { 
        stallId: currentLocation.stallId, 
        barnId: currentLocation.barnId, 
        farmId: currentLocation.farmId 
      },
      lastUpdate: new Date(),
      active: true,
    });

    // Make sure you push the newPig, not an undefined variable.
    // Pig.push(newPig);
    
    res.status(201).json(newPig);
  } catch (error) {
    console.error("Error creating pig:", error);
    res.status(500).json({ error: "Failed to create pig" });
  }
});


// Get pig posture history
router.get('/:id/posture', async (req, res) => {
  try {
    // all of the bcs tables are calling the obj id, we need to fix this by: 
    //    1. calling the pigId and then 
    //    2. finding the obj id

     // Step 1: Find the corresponding ObjectId for the pigId (which is a number)
    const pig = await Pig.findOne({ pigId: parseInt(req.params.id) });

    if (!pig) {
      return res.status(404).json({ error: 'Pig not found' });
    }

    const postureData = await PostureData.find({ pigId: pig._id })
      .sort({ timestamp: -1 })
      .limit(100)

    // Step 3: Manipulate the bcsData to include the pigId in the result
    const result = postureData.map((data) => ({
      ...data.toObject(),
      pigId: pig.pigId  // replace the pigId with the original pigId
    }));

    res.json(result)
  } catch (error) {
    console.error('Error fetching posture data:', error)
    res.status(500).json({ error: 'Failed to fetch posture data' })
  }
})

// Update pig
router.put('/:id', async (req, res) => {
  try {
    const pigId = parseInt(req.params.id)
    const updates = {
      breed: req.body.breed,
      age: parseInt(req.body.age),
      groupId: parseInt(req.body.group),
      lastUpdate: new Date()
    }
    
    const updatedPig = await Pig.findOneAndUpdate(
      { pigId },
      updates,
      { new: true }
    )

    if (!updatedPig) {
      return res.status(404).json({ error: 'Pig not found' })
    }

    res.json(updatedPig)
  } catch (error) {
    console.error('Error updating pig:', error)
    res.status(500).json({ error: 'Failed to update pig' })
  }
})


// Get time-series data for pig metrics, including fertility and heat status
router.get('/analytics/time-series', async (req, res) => {
  try {
    const { period = 'daily' } = req.query; // Default to daily data

    // Define the date range for the time series
    const endDate = new Date();
    const startDate = new Date();
    if (period === 'daily') {
      startDate.setDate(endDate.getDate() - 30); // Last 30 days
    } else if (period === 'weekly') {
      startDate.setDate(endDate.getDate() - 90); // Last 12 weeks
    } else if (period === 'monthly') {
      startDate.setMonth(endDate.getMonth() - 12); // Last 12 months
    }

    // Fetch fertility and heat status data within the date range
    const fertilityData = await PigFertility.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          inHeat: { $sum: { $cond: [{ $eq: ['$status', 'in heat'] }, 1, 0] } },
          preHeat: { $sum: { $cond: [{ $eq: ['$status', 'Pre-Heat'] }, 1, 0] } },
          open: { $sum: { $cond: [{ $eq: ['$status', 'Open'] }, 1, 0] } },
          readyToBreed: { $sum: { $cond: [{ $eq: ['$status', 'ready to breed'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const heatStatusData = await PigHeatStatus.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
          bred: { $sum: { $cond: [{ $eq: ['$status', 'bred'] }, 1, 0] } },
          pregnant: { $sum: { $cond: [{ $eq: ['$status', 'pregnant'] }, 1, 0] } },
          farrowing: { $sum: { $cond: [{ $eq: ['$status', 'farrowing'] }, 1, 0] } },
          weaning: { $sum: { $cond: [{ $eq: ['$status', 'weaning'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Initialize the time-series data structure
    const timeSeriesData = {};

    // Iterate through each day/week/month and calculate metrics
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

      // Find fertility and heat status data for the current date
      const fertilityOnDate = fertilityData.find((entry) => entry._id === dateKey) || {
        inHeat: 0,
        preHeat: 0,
        open: 0,
        readyToBreed: 0,
      };

      const heatStatusOnDate = heatStatusData.find((entry) => entry._id === dateKey) || {
        open: 0,
        bred: 0,
        pregnant: 0,
        farrowing: 0,
        weaning: 0,
      };

      // Calculate total pigs (assuming total pigs is the sum of all fertility statuses)
      const totalPigs =
        fertilityOnDate.inHeat +
        fertilityOnDate.preHeat +
        fertilityOnDate.open +
        fertilityOnDate.readyToBreed;

      // Add to time-series data
      timeSeriesData[dateKey] = {
        totalPigs,
        totalPigsInHeat: fertilityOnDate.inHeat,
        totalPigsReadyToBreed: fertilityOnDate.readyToBreed,
        fertilityStatus: {
          inHeat: fertilityOnDate.inHeat,
          preHeat: fertilityOnDate.preHeat,
          open: fertilityOnDate.open,
          readyToBreed: fertilityOnDate.readyToBreed,
        },
        heatStatus: {
          open: heatStatusOnDate.open,
          bred: heatStatusOnDate.bred,
          pregnant: heatStatusOnDate.pregnant,
          farrowing: heatStatusOnDate.farrowing,
          weaning: heatStatusOnDate.weaning,
        },
      };

      // Move to the next day/week/month
      if (period === 'daily') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (period === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (period === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    res.json(timeSeriesData);
  } catch (error) {
    console.error('Error fetching time-series data:', error);
    res.status(500).json({ error: 'Failed to fetch time-series data' });
  }
});



router.delete('/', async (req, res) => {
  try {
    const { pigIds } = req.body;
    // Convert string IDs to numbers if necessary
    const numericPigIds = pigIds.map(id => parseInt(id)).filter(id => !isNaN(id));
    
    // Find all Pig documents that match the numeric pigIds
    const pigs = await Pig.find({ pigId: { $in: numericPigIds } });
    
    if (!pigs.length) {
      return res.status(404).json({ error: 'No pigs found with the given IDs' });
    }
    
    // Collect the ObjectIds from the found pigs
    const pigObjectIds = pigs.map(pig => pig._id);
    
    // Delete pigs based on their numeric pigId
    const result = await Pig.deleteMany({ pigId: { $in: numericPigIds } });
    
    // Use pigObjectIds for related collections
    await Promise.all([
      BCSData.deleteMany({ pigId: { $in: pigObjectIds } }),
      PostureData.deleteMany({ pigId: { $in: pigObjectIds } })
    ]);

    res.json({ 
      message: 'Pigs deleted successfully',
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error deleting pigs:', error);
    res.status(500).json({ error: 'Failed to delete pigs' });
  }
});


// ADDITIONAL: Pig analytics
router.get('/analytics/summary', async (req, res) => {
  try {
    const pigs = await Pig.find({})
    const totalPigs = pigs.length

    // Average BCS
    // If you store the current BCS in Pig, use pig.bcsScore
    const totalBCS = pigs.reduce((acc, p) => acc + (p.bcsScore || 0), 0)
    const avgBCS = totalPigs > 0 ? (totalBCS / totalPigs).toFixed(2) : 0

    // Age distribution or average age
    const totalAge = pigs.reduce((acc, p) => acc + (p.age || 0), 0)
    const avgAge = totalPigs > 0 ? (totalAge / totalPigs).toFixed(2) : 0

    // Breed distribution
    const breedCountMap = {}
    for (const pig of pigs) {
      if (!breedCountMap[pig.breed]) {
        breedCountMap[pig.breed] = 0
      }
      breedCountMap[pig.breed] += 1
    }
    // Convert to array if needed
    const breedDistribution = Object.entries(breedCountMap).map(([breed, count]) => ({
      breed,
      count,
      percentage: totalPigs > 0 ? ((count / totalPigs) * 100).toFixed(2) : 0
    }))

    res.json({
      totalPigs,
      avgBCS: Number(avgBCS),
      avgAge: Number(avgAge),
      breedDistribution
    })
  } catch (error) {
    console.error('Error fetching pig analytics:', error)
    res.status(500).json({ error: 'Failed to fetch pig analytics' })
  }
})

module.exports = router
