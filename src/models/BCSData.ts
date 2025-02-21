import mongoose from 'mongoose';

const modelName = 'bcs_data';

// Only create model if it doesn't already exist
const schema = new mongoose.Schema({
  recordId: { type: Number, required: true, unique: true, auto: true },
  pigId: { type: Number, required: true },
  bcsScore: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Use type assertion to handle potential undefined case
export const BCSData = (mongoose.models[modelName] || mongoose.model(modelName, schema)) as ReturnType<typeof mongoose.model>;