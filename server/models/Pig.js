// const mongoose = require('mongoose')

// const schema = new mongoose.Schema({
//   pigId: { type: Number, required: true, unique: true },
//   groupId: { type: Number, required: true },
//   breed: { type: String },
//   age: { type: Number },
//   bcsScore: { type: Number },
//   posture: { type: Number },
//   lastUpdate: { type: Date, default: Date.now },
//   insertionTime: { type: Date, default: Date.now }
// })

// module.exports = mongoose.model('Pig', schema)

const mongoose = require('mongoose');
const { Schema } = mongoose;

const PigSchema = new Schema({
  pigId: { type: Number, required: true, unique: true },
  tag: { type: String, required: true },
  breed: { type: String },
  age: { type: Number },
  currentLocation: {
    barnId: { type: Schema.Types.ObjectId, ref: 'Barn', required: true },
    stallId: { type: Schema.Types.ObjectId, ref: 'Stall', required: true }
  },
  lastUpdate: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Pig', PigSchema);
