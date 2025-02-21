const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  recordId: { type: Number, required: true, unique: true, auto: true },
  deviceId: { type: Number, required: true },
  temperature: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
})

module.exports = mongoose.model('TemperatureData', schema)