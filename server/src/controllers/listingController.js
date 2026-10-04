import Listing from '../models/Listing.js';
import { validateListing } from '../utils/validation.js';

const normalize = (body) => ({
  ...body,
  price: Number(body.price),
  tags: Array.isArray(body.tags) ? body.tags.filter(Boolean) : String(body.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
  attributes: typeof body.attributes === 'string' ? parseAttributes(body.attributes) : (body.attributes || {})
});
function parseAttributes(value) {
  return value.split('\n').reduce((result, line) => {
    const [key, ...rest] = line.split(':');
    if (key?.trim() && rest.length) result[key.trim()] = rest.join(':').trim();
    return result;
  }, {});
}

export async function createListing(req, res, next) {
  try {
    const listing = normalize(req.body);
    const errors = validateListing(req.body);
    if (Object.keys(errors).length) return res.status(422).json({ message: 'Fix the validation errors before submitting.', errors });
    const duplicate = await Listing.findOne({ title: new RegExp(`^${listing.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'), seller: new RegExp(`^${listing.seller.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
    if (duplicate) return res.status(409).json({ message: 'A listing with this title already exists for this seller.', errors: { title: 'Duplicate listing.' } });
    const created = await Listing.create(listing);
    res.status(201).json(created);
  } catch (error) { next(error); }
}

export async function getListings(req, res, next) {
  try { res.json(await Listing.find().sort({ createdAt: -1 }).lean()); } catch (error) { next(error); }
}

export async function getListing(req, res, next) {
  try {
    const listing = await Listing.findById(req.params.id).lean();
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    res.json(listing);
  } catch (error) { next(error); }
}

export async function createBatch(req, res, next) {
  try {
    if (!Array.isArray(req.body.listings) || !req.body.listings.length) return res.status(400).json({ message: 'Provide a non-empty listings array.' });
    if (req.body.listings.length > 20) return res.status(400).json({ message: 'Batch size is limited to 20 listings.' });
    const results = [];
    for (const raw of req.body.listings) {
      const input = normalize(raw); const errors = validateListing(raw);
      if (Object.keys(errors).length) { results.push({ title: raw.title || 'Untitled', status: 'invalid', errors }); continue; }
      const duplicate = await Listing.findOne({ title: new RegExp(`^${input.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'), seller: new RegExp(`^${input.seller.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
      if (duplicate) { results.push({ title: input.title, status: 'duplicate', errors: { title: 'Duplicate listing.' } }); continue; }
      const listing = await Listing.create(input); results.push({ title: listing.title, status: 'ready', listing });
    }
    res.status(201).json({ results });
  } catch (error) { next(error); }
}
