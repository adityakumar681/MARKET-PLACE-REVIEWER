import Listing from '../models/Listing.js';
import Review from '../models/Review.js';
import ReviewAction from '../models/ReviewAction.js';
import { retrieveRelevantPolicies } from '../services/retrievalService.js';
import { runGroqReview } from '../services/groqReviewService.js';

async function performReview(listing) {
  const listingData = listing.toObject({ flattenMaps: true });
  const policies = await retrieveRelevantPolicies(listingData);
  if (!policies.length) {
    const error = new Error('No policy sections are seeded. Run npm run seed first.');
    error.statusCode = 503;
    throw error;
  }
  const result = await runGroqReview(listingData, policies);
  const review = await Review.create({ listing: listing._id, findings: result.findings, policySections: policies.map((policy) => policy._id), model: result.model, summary: result.summary });
  listing.status = result.findings.some((finding) => finding.severity === 'High') ? 'needs_attention' : 'reviewed';
  await listing.save();
  return review.populate(['listing', 'policySections']);
}

export async function createReview(req, res, next) {
  try {
    const listing = await Listing.findById(req.body.listingId);
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    res.status(201).json(await performReview(listing));
  } catch (error) { next(error); }
}

export async function createBatchReviews(req, res, next) {
  try {
    const { listingIds } = req.body;
    if (!Array.isArray(listingIds) || !listingIds.length || listingIds.length > 20) return res.status(400).json({ message: 'Provide between 1 and 20 listing IDs.' });
    const results = [];
    // Sequential calls intentionally keep Groq requests predictable and preserve per-listing results.
    for (const listingId of listingIds) {
      try {
        const listing = await Listing.findById(listingId);
        if (!listing) { results.push({ listingId, status: 'failed', error: 'Listing not found.' }); continue; }
        const review = await performReview(listing);
        results.push({ listingId, status: 'complete', review });
      } catch (error) {
        results.push({ listingId, status: 'failed', error: error.message });
      }
    }
    res.status(201).json({ results });
  } catch (error) { next(error); }
}

export async function getReviews(req, res, next) {
  try { res.json(await Review.find().populate('listing').populate('policySections').sort({ createdAt: -1 }).lean()); } catch (error) { next(error); }
}

export async function getReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id).populate('listing').populate('policySections').lean();
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    res.json(review);
  } catch (error) { next(error); }
}

export async function recordAction(req, res, next) {
  try {
    const { action, editedRevision = '' } = req.body;
    if (!['approved', 'edited', 'rejected'].includes(action)) return res.status(400).json({ message: 'Action must be approved, edited, or rejected.' });
    if (action === 'edited' && !editedRevision.trim()) return res.status(422).json({ message: 'Enter the reviewer’s revised wording.' });
    const review = await Review.findById(req.params.reviewId);
    const index = Number(req.params.findingIndex);
    if (!review || !review.findings[index]) return res.status(404).json({ message: 'Review finding not found.' });
    review.findings[index].action = action; review.findings[index].editedRevision = action === 'edited' ? editedRevision.trim() : '';
    await review.save();
    await ReviewAction.create({ review: review._id, findingIndex: index, action, suggestedRevision: review.findings[index].suggestedRevision, editedRevision: review.findings[index].editedRevision });
    res.json(await review.populate(['listing', 'policySections']));
  } catch (error) { next(error); }
}
