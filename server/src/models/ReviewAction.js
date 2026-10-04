import mongoose from 'mongoose';

const reviewActionSchema = new mongoose.Schema({
  review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', required: true },
  findingIndex: { type: Number, required: true },
  action: { type: String, enum: ['approved', 'edited', 'rejected'], required: true },
  suggestedRevision: String,
  editedRevision: String
}, { timestamps: true });
export default mongoose.model('ReviewAction', reviewActionSchema);
