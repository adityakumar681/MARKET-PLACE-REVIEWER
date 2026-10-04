import { Router } from 'express';
import { createBatch, createListing, getListing, getListings } from '../controllers/listingController.js';
const router = Router();
router.get('/', getListings); router.post('/', createListing); router.post('/batch', createBatch); router.get('/:id', getListing);
export default router;
