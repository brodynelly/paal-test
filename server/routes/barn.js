// routes/barn.js
const express = require('express')
const router = express.Router()
const Barn = require('../models/Barn')
const Stall = require('../models/Stall')
const Device = require('../models/Device')
const Pig = require('../models/Pig') // if pigs are associated or relevant at barn level


// GET all barns
router.get('/', async (req, res) => {
  try {
    const barns = await Barn.find({}).sort({ name: 1 })
    res.json(barns)
  } catch (error) {
    console.error('Error fetching barns:', error)
    res.status(500).json({ error: 'Failed to fetch barns' })
  }
})

// GET single barn
router.get('/:id', async (req, res) => {
  try {
    const barn = await Barn.findById(req.params.id)
    if (!barn) {
      return res.status(404).json({ error: 'Barn not found' })
    }
    res.json(barn)
  } catch (error) {
    console.error('Error fetching barn:', error)
    res.status(500).json({ error: 'Failed to fetch barn' })
  }
})

// CREATE barn
router.post('/', async (req, res) => {
  try {
    const newBarn = await Barn.create({
      name: req.body.name,
      description: req.body.description,
      farmId: req.body.farmId
    })
    res.status(201).json(newBarn)
  } catch (error) {
    console.error('Error creating barn:', error)
    res.status(500).json({ error: 'Failed to create barn' })
  }
})

// UPDATE barn
router.put('/:id', async (req, res) => {
  try {
    const updatedBarn = await Barn.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        farmId: req.body.farmId
      },
      { new: true }
    )
    if (!updatedBarn) {
      return res.status(404).json({ error: 'Barn not found' })
    }
    res.json(updatedBarn)
  } catch (error) {
    console.error('Error updating barn:', error)
    res.status(500).json({ error: 'Failed to update barn' })
  }
})

// DELETE barn
router.delete('/:id', async (req, res) => {
  try {
    const barn = await Barn.findByIdAndDelete(req.params.id)
    if (!barn) {
      return res.status(404).json({ error: 'Barn not found' })
    }
    // Optionally, delete or reassign stalls/devices under this barn
    res.json({ message: 'Barn deleted successfully' })
  } catch (error) {
    console.error('Error deleting barn:', error)
    res.status(500).json({ error: 'Failed to delete barn' })
  }
})

// GET barn analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const barn = await Barn.findById(req.params.id)
    if (!barn) {
      return res.status(404).json({ error: 'Barn not found' })
    }

    // Count stalls
    const stallCount = await Stall.countDocuments({ barnId: barn._id })

    // Count devices (if devices or pigs reference a barnId or if you need to look up stall => device)
    const deviceCount = await Device.countDocuments({
      // If your Device model stores barnId or farmId, you'd filter by it here
    })

    // Count pigs (if referencing barnId or associated stalls)
    const pigCount = await Pig.countDocuments({
      // Similarly, if Pig references barnId directly or indirectly
    })

    // Return analytics data
    res.json({
      barnName: barn.name,
      stallCount,
      deviceCount,
      pigCount
    })
  } catch (error) {
    console.error('Error fetching barn analytics:', error)
    res.status(500).json({ error: 'Failed to fetch barn analytics' })
  }
})

module.exports = router
