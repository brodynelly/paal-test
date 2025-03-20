const express = require('express')
const router = express.Router()
const Pig = require('../models/Pig')
const BCSData = require('../models/BCSData')
const PostureData = require('../models/PostureData')
const validator = require('validator')

// Get all pigs
router.get('/', async (req, res) => {
  try {
    const pigs = await Pig.find({}).sort({ lastUpdate: -1 })
    
    const transformedPigs = pigs.map(pig => ({
      owner: `PIG-${pig.pigId.toString().padStart(3, '0')}`,
      status: pig.bcsScore >= 4 ? "critical" : pig.bcsScore >= 3 ? "healthy" : "suspicious",
      costs: pig.age,
      region: `Group ${pig.groupId}`,
      stability: Math.floor(Math.random() * 100), // Random health risk for demo
      lastEdited: pig.lastUpdate ? new Date(pig.lastUpdate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : new Date().toLocaleDateString('en-GB', {
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

// Get single pig
router.get('/:id', async (req, res) => {
  try {
    const pig = await Pig.findOne({ pigId: parseInt(req.params.id) })
    if (!pig) {
      return res.status(404).json({ error: 'Pig not found' })
    }
    res.json(pig)
  } catch (error) {
    console.error('Error fetching pig:', error)
    res.status(500).json({ error: 'Failed to fetch pig' })
  }
})

// Get pig BCS history
router.get('/:id/bcs', async (req, res) => {
  try {
    const bcsData = await BCSData.find({ 
      pigId: parseInt(req.params.id) 
    }).sort({ timestamp: -1 }).limit(100)

    res.json(bcsData)
  } catch (error) {
    console.error('Error fetching BCS data:', error)
    res.status(500).json({ error: 'Failed to fetch BCS data' })
  }
})

// Get pig posture history
router.get('/:id/posture', async (req, res) => {
  try {
    const postureData = await PostureData.find({ 
      pigId: parseInt(req.params.id) 
    }).sort({ timestamp: -1 }).limit(100)

    res.json(postureData)
  } catch (error) {
    console.error('Error fetching posture data:', error)
    res.status(500).json({ error: 'Failed to fetch posture data' })
  }
})

// Update pig
router.put('/:id', async (req, res) => {
  try {
    const pigId = parseInt(req.params.id)
    const updates = {}
    if (req.body.breed && validator.isAlpha(req.body.breed, 'en-US', { ignore: ' ' })) {
      updates.breed = req.body.breed.trim()
    }
    if (req.body.age && validator.isInt(req.body.age, { min: 0 })) {
      updates.age = parseInt(req.body.age, 10)
    }
    if (req.body.group && validator.isInt(req.body.group, { min: 0 })) {
      updates.groupId = parseInt(req.body.group, 10)
    }
    updates.lastUpdate = new Date()
    
    const updatedPig = await Pig.findOneAndUpdate(
      { pigId },
      { $set: updates },
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

// Delete pigs
router.delete('/', async (req, res) => {
  try {
    const { pigIds } = req.body
    const result = await Pig.deleteMany({ 
      pigId: { $in: pigIds.map(id => parseInt(id)) } 
    })
    
    // Also delete related data
    await Promise.all([
      BCSData.deleteMany({ pigId: { $in: pigIds } }),
      PostureData.deleteMany({ pigId: { $in: pigIds } })
    ])

    res.json({ 
      message: 'Pigs deleted successfully',
      deletedCount: result.deletedCount 
    })
  } catch (error) {
    console.error('Error deleting pigs:', error)
    res.status(500).json({ error: 'Failed to delete pigs' })
  }
})

module.exports = router