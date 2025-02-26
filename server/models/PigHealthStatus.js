const mongoose = require('mongoose');
const { Schema } = mongoose;

const PigHealthStatusSchema = new Schema({
  pigId: { type: Schema.Types.ObjectId, ref: 'Pig', required: true },
  timestamp: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['at risk', 'healthy', 'critical', 'no movement'], 
    required: true 
  }
});

module.exports = mongoose.model('PigHealthStatus', PigHealthStatusSchema);
