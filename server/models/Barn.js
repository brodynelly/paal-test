const mongoose = require('mongoose');
const { Schema } = mongoose;

const BarnSchema = new Schema({
  name: { type: String, required: true },
  farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
  stalls: [{ type: Schema.Types.ObjectId, ref: 'Stall' }]
});

module.exports = mongoose.model('Barn', BarnSchema);
