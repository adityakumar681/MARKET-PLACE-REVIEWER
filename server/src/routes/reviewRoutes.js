import { Router } from 'express';
import { createBatchReviews, createReview, getReview, getReviews, recordAction } from '../controllers/reviewController.js';
const router = Router();
router.get('/', getReviews); router.post('/', createReview); router.post('/batch', createBatchReviews); router.get('/:id', getReview); router.patch('/:reviewId/findings/:findingIndex/action', recordAction);
export default router;
