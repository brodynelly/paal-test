const express = require('express')
const router = express.Router()
const Device = require('../models/Device')
const BCSData = require('../models/BCSData')
const PostureData = require('../models/PostureData')
const TemperatureData = require('../models/TemperatureData')

router.get('/', async (req, res) => {
  try {
    // Get device stats
    const devices = await Device.find({})
    const onlineDevices = devices.filter(d => d.status === 'online').length
    const totalDevices = devices.length
    const deviceUsage = totalDevices > 0 ? Math.round((onlineDevices / totalDevices) * 100) : 0

    // Get latest temperature readings
    const latestTemps = await TemperatureData.find({})
      .sort({ timestamp: -1 })
      .limit(devices.length)
    const avgTemp = latestTemps.length > 0 
      ? latestTemps.reduce((acc, curr) => acc + curr.temperature, 0) / latestTemps.length 
      : 0

    // Get BCS distribution
    const bcsData = await BCSData.find({}).sort({ timestamp: -1 })
    const avgBCS = bcsData.length > 0 
      ? bcsData.reduce((acc, curr) => acc + curr.bcsScore, 0) / bcsData.length 
      : 0

    // Get posture distribution
    const postureData = await PostureData.find({}).sort({ timestamp: -1 })
    const postureCounts = postureData.reduce((acc, curr) => {
      acc[curr.posture] = (acc[curr.posture] || 0) + 1
      return acc
    }, {})

    const totalPostures = postureData.length
    const postureDistribution = Object.entries(postureCounts).map(([posture, count]) => ({
      posture: Number(posture),
      count,
      percentage: totalPostures > 0 ? Math.round((count / totalPostures) * 100) : 0
    }))

    res.json({
      deviceStats: {
        onlineDevices,
        totalDevices,
        deviceUsage,
        averageTemperature: Number(avgTemp.toFixed(1))
      },
      bcsStats: {
        averageBCS: Number(avgBCS.toFixed(1))
      },
      postureDistribution
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    res.status(500).json({ error: 'Failed to fetch statistics' })
  }
})

module.exports = router