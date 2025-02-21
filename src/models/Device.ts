import mongoose from 'mongoose';

const modelName = 'Device';

const schema = new mongoose.Schema({
  deviceId: { type: Number, required: true, unique: true },
  deviceName: { type: String, required: true },
  deviceType: { type: String },
  status: { type: String, enum: ['online', 'offline', 'warning'], default: 'offline' },
  temperature: { type: Number },
  lastUpdate: { type: Date, default: Date.now },
  insertionTime: { type: Date, default: Date.now }
});

export const Device = (mongoose.models[modelName] || mongoose.model(modelName, schema)) as ReturnType<typeof mongoose.model>;