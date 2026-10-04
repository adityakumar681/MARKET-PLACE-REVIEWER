import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  attributes: { type: Map, of: String, default: {} },
  seller: { type: String, required: true, trim: true },
  tags: { type: [String], default: [] },
  status: { type: String, enum: ['draft', 'ready', 'reviewed', 'needs_attention'], default: 'ready' }
}, { timestamps: true });

listingSchema.index({ title: 1, seller: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
export default mongoose.model('Listing', listingSchema);
