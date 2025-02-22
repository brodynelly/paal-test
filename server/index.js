require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const { createServer } = require('http')
const { Server } = require('socket.io')

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: "https://paal-test.onrender.com/",
    methods: ["GET", "POST"]
  }
})

const port = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/stats', require('./routes/stats'))
app.use('/api/devices', require('./routes/devices'))
app.use('/api/pigs', require('./routes/pigs'))

// MongoDB Connection and Change Streams Setup
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected')
    
    // Set up change stream for the Pig collection
    const Pig = require('./models/Pig')
    const pigChangeStream = Pig.watch([], { fullDocument: 'updateLookup' })
    
    pigChangeStream.on('change', async (change) => {
      // Trigger immediate data update when pig collection changes
      await emitUpdatedStats()
    })

    // Set up change stream for the Device collection
    const Device = require('./models/Device')
    const deviceChangeStream = Device.watch([], { fullDocument: 'updateLookup' })
    
    deviceChangeStream.on('change', async (change) => {
      // Trigger immediate data update when device collection changes
      await emitUpdatedStats()
    })
  })
  .catch(err => console.error('MongoDB Connection Error:', err))

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Function to emit updated stats
const emitUpdatedStats = async () => {
  try {
    const Device = require('./models/Device')
    const BCSData = require('./models/BCSData')
    const PostureData = require('./models/PostureData')
    const TemperatureData = require('./models/TemperatureData')
    const Pig = require('./models/Pig')

    // Get device stats and list
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

    // Get all pigs
    const pigs = await Pig.find({}).sort({ lastUpdate: -1 })
    
    // Transform devices for the UI
    const transformedDevices = devices.map(device => ({
      id: device.deviceId,
      created: device.insertionTime || new Date().toISOString(),
      deviceName: device.deviceName,
      type: device.deviceType,
      status: device.status,
      priority: device.status === 'online' ? 'low' : device.status === 'warning' ? 'medium' : 'high',
      lastDataPoint: device.lastUpdate ? new Date(device.lastUpdate).toISOString() : new Date().toISOString()
    }))

    // Transform pigs for the UI
    const transformedPigs = pigs.map(pig => ({
      owner: `PIG-${pig.pigId.toString().padStart(3, '0')}`,
      status: pig.bcsScore >= 4 ? "critical" : pig.bcsScore >= 3 ? "healthy" : "suspicious",
      costs: pig.age,
      region: `Group ${pig.groupId}`,
      stability: Math.floor(Math.random() * 100),
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

    // Emit different types of updates
    io.emit('stats_update', {
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

    io.emit('devices_update', transformedDevices)
    io.emit('pigs_update', transformedPigs)

  } catch (error) {
    console.error('Error emitting updates:', error)
  }
}

// Emit updates every 5 seconds
setInterval(emitUpdatedStats, 5000)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something broke!' })
})

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
