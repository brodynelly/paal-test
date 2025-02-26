const mongoose = require('mongoose');
const { Schema } = mongoose;

const FarmSchema = new Schema({
  name: { type: String, required: true },
  location: { type: String },
  // You can either embed barns or reference them
  barns: [{ type: Schema.Types.ObjectId, ref: 'Barn' }]
});

module.exports = mongoose.model('Farm', FarmSchema);