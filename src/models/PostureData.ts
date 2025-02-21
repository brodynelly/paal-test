import mongoose from 'mongoose';

const modelName = 'posture_data';

const schema = new mongoose.Schema({
  recordId: { type: Number, required: true, unique: true, auto: true },
  pigId: { type: Number, required: true },
  posture: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

export const PostureData = (mongoose.models[modelName] || mongoose.model(modelName, schema)) as ReturnType<typeof mongoose.model>;