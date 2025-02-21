import mongoose from 'mongoose';

const modelName = 'temperature_data';

const schema = new mongoose.Schema({
  recordId: { type: Number, required: true, unique: true, auto: true },
  deviceId: { type: Number, required: true },
  temperature: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

export const TemperatureData = (mongoose.models[modelName] || mongoose.model(modelName, schema)) as ReturnType<typeof mongoose.model>;