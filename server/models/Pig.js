const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  pigId: { type: Number, required: true, unique: true },
  groupId: { type: Number, required: true },
  breed: { type: String },
  age: { type: Number },
  bcsScore: { type: Number },
  posture: { type: Number },
  lastUpdate: { type: Date, default: Date.now },
  insertionTime: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Pig', schema)