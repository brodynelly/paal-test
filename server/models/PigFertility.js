const mongoose = require('mongoose');
const { Schema } = mongoose;

const PigFertilitySchema = new Schema({
  pigId: { type: Schema.Types.ObjectId, ref: 'Pig', required: true },
  timestamp: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['in heat', 'Pre-Heat', 'Open', 'ready to breed'], 
    required: true 
  }
});

module.exports = mongoose.model('PigFertility', PigFertilitySchema);
