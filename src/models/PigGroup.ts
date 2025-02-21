import mongoose from 'mongoose';

const modelName = 'pig_group';

const schema = new mongoose.Schema({
  groupId: { type: Number, required: true, unique: true },
  stallId: { type: Number },
  farmId: { type: Number },
  special: { type: String }
});

export const PigGroup = (mongoose.models[modelName] || mongoose.model(modelName, schema)) as ReturnType<typeof mongoose.model>;