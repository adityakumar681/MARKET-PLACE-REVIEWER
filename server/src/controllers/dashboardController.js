import Listing from '../models/Listing.js';
import Review from '../models/Review.js';

export async function getDashboard(req, res, next) {
  try {
    const [totalListings, totalReviews, attention, recentReviews] = await Promise.all([
      Listing.countDocuments(), Review.countDocuments(), Listing.countDocuments({ status: 'needs_attention' }),
      Review.find().populate('listing').sort({ createdAt: -1 }).limit(5).lean()
    ]);
    res.json({ totalListings, totalReviews, attention, recentReviews });
  } catch (error) { next(error); }
}
