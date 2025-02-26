const mongoose = require('mongoose');
const { Schema } = mongoose;

const PigHeatStatusSchema = new Schema({
  pigId: { type: Schema.Types.ObjectId, ref: 'Pig', required: true },
  timestamp: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['open', 'bred', 'pregnant', 'farrowing', 'weaning'], 
    required: true 
  }
});

module.exports = mongoose.model('PigHeatStatus', PigHeatStatusSchema);
