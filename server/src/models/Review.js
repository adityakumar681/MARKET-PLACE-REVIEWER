import mongoose from 'mongoose';

const findingSchema = new mongoose.Schema({
  issue: String,
  explanation: String,
  severity: { type: String, enum: ['Low', 'Medium', 'High'] },
  confidence: { type: Number, min: 0, max: 100 },
  policyCode: String,
  sourceText: String,
  suggestedRevision: String,
  evidenceType: { type: String, enum: ['confirmed', 'unverifiable'] },
  action: { type: String, enum: ['pending', 'approved', 'edited', 'rejected'], default: 'pending' },
  editedRevision: { type: String, default: '' }
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  findings: { type: [findingSchema], default: [] },
  policySections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PolicySection' }],
  model: String,
  status: { type: String, enum: ['complete', 'failed'], default: 'complete' },
  summary: String
}, { timestamps: true });
export default mongoose.model('Review', reviewSchema);
