const mongoose = require('mongoose');
const { Schema } = mongoose;

const PigVulvaSwellingSchema = new Schema({
  pigId: { type: Schema.Types.ObjectId, ref: 'Pig', required: true },
  timestamp: { type: Date, default: Date.now },
  // Use an enum if you have fixed categories, for example:
  value: { type: String, enum: ['low', 'moderate', 'high'], required: true }
});

module.exports = mongoose.model('PigVulvaSwelling', PigVulvaSwellingSchema);
