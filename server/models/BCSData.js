// const mongoose = require('mongoose')

// const schema = new mongoose.Schema({
//   recordId: { type: Number, required: true, unique: true, auto: true },
//   pigId: { type: Number, required: true },
//   bcsScore: { type: Number, required: true },
//   timestamp: { type: Date, default: Date.now }
// })

// module.exports = mongoose.model('BCSData', schema)

const mongoose = require('mongoose');
const { Schema } = mongoose;

const PigBCSSchema = new Schema({
  pigId: { type: Schema.Types.ObjectId, ref: 'Pig', required: true },
  timestamp: { type: Date, default: Date.now },
  score: { type: Number, required: true }
});

module.exports = mongoose.model('PigBCS', PigBCSSchema);
