const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  deviceId: { type: Number, required: true, unique: true },
  deviceName: { type: String, required: true },
  deviceType: { type: String },
  status: { type: String, enum: ['online', 'offline', 'warning'], default: 'offline' },
  temperature: { type: Number },
  lastUpdate: { type: Date, default: Date.now },
  insertionTime: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Device', schema)