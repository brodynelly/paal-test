// routes/stall.js
const express = require('express')
const router = express.Router()
const Stall = require('../models/Stall')
const Device = require('../models/Device')
const Pig = require('../models/Pig') // If pigs reference a stall, or if you want to track it

// GET all stalls
router.get('/', async (req, res) => {
  try {
    const stalls = await Stall.find({}).sort({ name: 1 })
    res.json(stalls)
  } catch (error) {
    console.error('Error fetching stalls:', error)
    res.status(500).json({ error: 'Failed to fetch stalls' })
  }
})

// GET single stall
router.get('/:id', async (req, res) => {
  try {
    const stall = await Stall.findById(req.params.id)
    if (!stall) {
      return res.status(404).json({ error: 'Stall not found' })
    }
    res.json(stall)
  } catch (error) {
    console.error('Error fetching stall:', error)
    res.status(500).json({ error: 'Failed to fetch stall' })
  }
})

// CREATE stall
router.post('/', async (req, res) => {
  try {
    const newStall = await Stall.create({
      name: req.body.name,
      barnId: req.body.barnId,
      farmId: req.body.farmId
    })
    res.status(201).json(newStall)
  } catch (error) {
    console.error('Error creating stall:', error)
    res.status(500).json({ error: 'Failed to create stall' })
  }
})

// UPDATE stall
router.put('/:id', async (req, res) => {
  try {
    const updatedStall = await Stall.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        barnId: req.body.barnId,
        farmId: req.body.farmId
      },
      { new: true }
    )
    if (!updatedStall) {
      return res.status(404).json({ error: 'Stall not found' })
    }
    res.json(updatedStall)
  } catch (error) {
    console.error('Error updating stall:', error)
    res.status(500).json({ error: 'Failed to update stall' })
  }
})

// DELETE stall
router.delete('/:id', async (req, res) => {
  try {
    const stall = await Stall.findByIdAndDelete(req.params.id)
    if (!stall) {
      return res.status(404).json({ error: 'Stall not found' })
    }
    // Optionally, reassign or remove devices/pigs in this stall
    res.json({ message: 'Stall deleted successfully' })
  } catch (error) {
    console.error('Error deleting stall:', error)
    res.status(500).json({ error: 'Failed to delete stall' })
  }
})

// GET stall analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const stall = await Stall.findById(req.params.id)
    if (!stall) {
      return res.status(404).json({ error: 'Stall not found' })
    }

    // Count devices in this stall if you store stallId in Device
    const deviceCount = await Device.countDocuments({ 
      // stallId: stall._id
    })

    // Count pigs in this stall if you store stallId in Pig
    const pigCount = await Pig.countDocuments({
      // stallId: stall._id
    })

    res.json({
      stallName: stall.name,
      deviceCount,
      pigCount
    })
  } catch (error) {
    console.error('Error fetching stall analytics:', error)
    res.status(500).json({ error: 'Failed to fetch stall analytics' })
  }
})

module.exports = router
