// const mongoose = require('mongoose')

// const schema = new mongoose.Schema({
//   recordId: { type: Number, required: true, unique: true, auto: true },
//   pigId: { type: Number, required: true },
//   posture: { type: Number, required: true },
//   timestamp: { type: Date, default: Date.now }
// })

// module.exports = mongoose.model('PostureData', schema)

const mongoose = require('mongoose');
const { Schema } = mongoose;

const PigPostureSchema = new Schema({
  pigId: { type: Schema.Types.ObjectId, ref: 'Pig', required: true },
  timestamp: { type: Date, default: Date.now },
  score: { type: Number, min: 1, max: 5, required: true }
});

module.exports = mongoose.model('PigPosture', PigPostureSchema);
