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
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT"],
  }
})

const port = 5005

// ──────────────────────────────────────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────────────────────────────────────
app.use(cors())
app.use(express.json())

// ──────────────────────────────────────────────────────────────────────────────
// Routes
// Update these paths to match your new route files exactly.
// For instance, if your device route file is named './routes/device.js':
//   app.use('/api/devices', require('./routes/device'))
// Adjust the naming as needed for consistency.
// ──────────────────────────────────────────────────────────────────────────────
app.use('/api/farms', require('./routes/farm'))
app.use('/api/barns', require('./routes/barn'))
app.use('/api/stalls', require('./routes/stall'))
app.use('/api/devices', require('./routes/devices'))      // updated to match your device.js
app.use('/api/pigs', require('./routes/pig'))            // updated to match your pig.js
app.use('/api/temperature', require('./routes/temperatureData'))
app.use('/api/stats', require('./routes/stats'))

// ──────────────────────────────────────────────────────────────────────────────
// Database Connection
// ──────────────────────────────────────────────────────────────────────────────
const DATABASE_HOST = process.env.DATABASE_HOST
const DATABASE_PORT = process.env.DATABASE_PORT
const DATABASE_DB = process.env.MONGO_INITDB_DATABASE
const DATABASE_USERNAME = process.env.MONGO_INITDB_ROOT_USERNAME
const DATABASE_PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD

const URI = `mongodb://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_DB}?replicaSet=rs0&authSource=admin`;

mongoose.connect(URI)
  .then(() => {
    console.log('MongoDB Connected')

    // Set up change stream for the Pig collection
    const Pig = require('./models/Pig')
    const pigChangeStream = Pig.watch([], { fullDocument: 'updateLookup' })
    pigChangeStream.on('change', async (change) => {
      await emitUpdatedStats()
    })

    // Set up change stream for the Device collection
    const Device = require('./models/Device')
    const deviceChangeStream = Device.watch([], { fullDocument: 'updateLookup' })
    deviceChangeStream.on('change', async (change) => {
      await emitUpdatedStats()
    })
  })
  .catch(err => console.error('MongoDB Connection Error:', err))

// ──────────────────────────────────────────────────────────────────────────────
// Socket.IO Event Handlers
// ──────────────────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// Function to Emit Updated Stats
// (Called periodically and on collection changes)
// ──────────────────────────────────────────────────────────────────────────────
const emitUpdatedStats = async () => {
  try {
    // Import any models needed to build stats
    const Device = require('./models/Device')
    const BCSData = require('./models/BCSData')
    const PostureData = require('./models/PostureData')
    const TemperatureData = require('./models/TemperatureData')
    const Pig = require('./models/Pig')
    const PigHealthStatus = require('./models/PigHealthStatus')
    const PigFertility = require('./models/PigFertility')
    const PigHeatStatus = require('./models/PigHeatStatus')
    // If you also want Farm, Barn, Stall stats in real time:
    // const Farm = require('./models/Farm')
    // const Barn = require('./models/Barn')
    // const Stall = require('./models/Stall')

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

    // BCS distribution
    const bcsData = await BCSData.find({}).sort({ timestamp: -1 })
    const avgBCS = bcsData.length > 0 
      ? bcsData.reduce((acc, curr) => acc + curr.bcsScore, 0) / bcsData.length 
      : 0

    // Posture distribution
    const postureData = await PostureData.find({}).sort({ timestamp: -1 })
    const postureCounts = postureData.reduce((acc, curr) => {
      acc[curr.score] = (acc[curr.score] || 0) + 1
      return acc
    }, {})
    const totalPostures = postureData.length
    const postureDistribution = Object.entries(postureCounts).map(([score, count]) => ({
      score: Number(score),
      count,
      percentage: totalPostures > 0 ? Math.round((count / totalPostures) * 100) : 0
    }))

    // Get all pigs
    const pigs = await Pig.find({}).sort({ lastUpdate: -1 })
    // If you also store bcsScore or other fields directly in `Pig`, you can derive analytics from them

    // Optionally get extended pig health/fertility data
    const pigHealthStatuses = await PigHealthStatus.find({ pigId: { $in: pigs.map(pig => pig._id) } })
    const pigFertilityStatuses = await PigFertility.find({ pigId: { $in: pigs.map(pig => pig._id) } })
    const pigHeatStatuses = await PigHeatStatus.find({ pigId: { $in: pigs.map(pig => pig._id) } })

    // Transform devices for UI
    const transformedDevices = devices.map(device => ({
      id: device.deviceId,
      created: device.insertionTime || new Date().toISOString(),
      deviceName: device.deviceName,
      type: device.deviceType,
      status: device.status,
      priority: device.status === 'online'
        ? 'low'
        : device.status === 'warning'
          ? 'medium'
          : 'high',
      lastDataPoint: device.lastUpdate
        ? new Date(device.lastUpdate).toISOString()
        : new Date().toISOString()
    }))

    // Transform pigs for UI
    const selectedPig = pigs.find((pig) => pig._id === formData.pigId)
    const stallId = selectedPig ? selectedPig.stall : null


    
    const transformedPigs = pigs.map(pig => ({
      
      owner: `PIG-${pig.pigId.toString().padStart(3, '0')}`,
      status: pig.bcsScore >= 4 ? "critical" : pig.bcsScore >= 3 ? "healthy" : "suspicious",
      costs: pig.age,
      region: stallId, 
      stability: pig.stability, // random example
      lastEdited: pig.lastUpdate
        ? new Date(pig.lastUpdate).toLocaleDateString('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })
        : new Date().toLocaleDateString('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          }),
      breed: pig.breed,
      healthStatus: pigHealthStatuses.find(status => status.pigId.toString() === pig._id.toString())?.status,
      fertilityStatus: pigFertilityStatuses.find(status => status.pigId.toString() === pig._id.toString())?.status,
      heatStatus: pigHeatStatuses.find(status => status.pigId.toString() === pig._id.toString())?.status
    }))

    // Emit aggregated stats
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
      // You can include more combined stats here if you want.
    })

    // Emit lists for devices and pigs
    io.emit('devices_update', transformedDevices)
    io.emit('pigs_update', transformedPigs)

  } catch (error) {
    console.error('Error emitting updates:', error)
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Periodically Emit Stats
// ──────────────────────────────────────────────────────────────────────────────
setInterval(emitUpdatedStats, 5000)

// ─────────────────────


httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`)
})