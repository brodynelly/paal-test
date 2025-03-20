// routes/farm.js
const express = require('express')
const router = express.Router()
const Farm = require('../models/Farm')
const Barn = require('../models/Barn')
const Stall = require('../models/Stall')
const Device = require('../models/Device')
const Pig = require('../models/Pig') // if pigs are associated at the farm level or indirectly through barns/stalls

// GET all farms
router.get('/', async (req, res) => {
  try {
    const farms = await Farm.find({})
      .populate('barns') // if you want to see associated barn data
      .sort({ name: 1 })
    res.json(farms)
  } catch (error) {
    console.error('Error fetching farms:', error)
    res.status(500).json({ error: 'Failed to fetch farms' })
  }
})

// GET single farm
router.get('/:id', async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id)
      .populate('barns')
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' })
    }
    res.json(farm)
  } catch (error) {
    console.error('Error fetching farm:', error)
    res.status(500).json({ error: 'Failed to fetch farm' })
  }
})

// CREATE new farm
router.post('/', async (req, res) => {
  try {
    const newFarm = await Farm.create({
      name: req.body.name,
      location: req.body.location,
      barns: []
    })
    res.status(201).json(newFarm)
  } catch (error) {
    console.error('Error creating farm:', error)
    res.status(500).json({ error: 'Failed to create farm' })
  }
})

// UPDATE farm
router.put('/:id', async (req, res) => {
  try {
    // Validate input
    const { name, location } = req.body;
    if (typeof name !== 'string' || typeof location !== 'string') {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const updatedFarm = await Farm.findByIdAndUpdate(
      req.params.id,
      { $set: { name, location } },
      { new: true }
    )
    if (!updatedFarm) {
      return res.status(404).json({ error: 'Farm not found' })
    }
    res.json(updatedFarm)
  } catch (error) {
    console.error('Error updating farm:', error)
    res.status(500).json({ error: 'Failed to update farm' })
  }
})

// DELETE farm
router.delete('/:id', async (req, res) => {
  try {
    const result = await Farm.findByIdAndDelete(req.params.id)
    if (!result) {
      return res.status(404).json({ error: 'Farm not found' })
    }
    // Optionally, delete or orphan barns/stalls/devices under this farm
    // e.g., await Barn.deleteMany({ _id: { $in: result.barns } })
    res.json({ message: 'Farm deleted successfully' })
  } catch (error) {
    console.error('Error deleting farm:', error)
    res.status(500).json({ error: 'Failed to delete farm' })
  }
})

// GET farm analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    // Basic farm document
    const farm = await Farm.findById(req.params.id).populate('barns')
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' })
    }

    // Count barns in this farm
    const barnCount = farm.barns ? farm.barns.length : 0

    // Collect all barn IDs (for stalls/devices queries)
    const barnIds = farm.barns.map(b => b._id)

    // Count stalls in these barns
    const stallCount = await Stall.countDocuments({ barnId: { $in: barnIds } })

    // Count devices in these barns’ stalls or, if you have a direct reference, adjust accordingly
    // If devices are directly associated with stalls, we might store stallId in device or pig
    // This example assumes you store no direct reference from device to barn or stall, so adjust as needed
    const deviceCount = await Device.countDocuments({ 
      // For a more advanced approach, you'd need to store farmId or barnId in Device
      // If you do: farmId: req.params.id
    })

    // Count pigs associated with these barns/stalls
    // This also depends on how you associate pigs to a location. Adjust the query as needed:
    const pigCount = await Pig.countDocuments({
      // If Pig has a farmId or barnId field, filter by it
    })

    // Return any other aggregated data you want
    res.json({
      farmName: farm.name,
      location: farm.location,
      barnCount,
      stallCount,
      deviceCount,
      pigCount
    })
  } catch (error) {
    console.error('Error fetching farm analytics:', error)
    res.status(500).json({ error: 'Failed to fetch farm analytics' })
  }
})

module.exports = router
