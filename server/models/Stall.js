const mongoose = require('mongoose');
const { Schema } = mongoose;

const StallSchema = new Schema({
  name: { type: String, required: true },
  barnId: { type: Schema.Types.ObjectId, ref: 'Barn', required: true },
  farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true }  
});

module.exports = mongoose.model('Stall', StallSchema);
