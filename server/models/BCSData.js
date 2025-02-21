const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  recordId: { type: Number, required: true, unique: true, auto: true },
  pigId: { type: Number, required: true },
  bcsScore: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
})

module.exports = mongoose.model('BCSData', schema)