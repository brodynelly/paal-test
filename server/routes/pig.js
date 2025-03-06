// routes/pig.js
const express = require('express')
const router = express.Router()
const Pig = require('../models/Pig')
const BCSData = require('../models/BCSData')
const PostureData = require('../models/PostureData')

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
