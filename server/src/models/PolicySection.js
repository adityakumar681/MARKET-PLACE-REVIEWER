import mongoose from 'mongoose';

const policySectionSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  keywords: { type: [String], default: [] },
  embedding: { type: [Number], default: [] }
}, { timestamps: true });
export default mongoose.model('PolicySection', policySectionSchema);
