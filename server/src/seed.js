import 'dotenv/config';
import { connectDatabase } from './config/db.js';
import Listing from './models/Listing.js';
import PolicySection from './models/PolicySection.js';
import { makeEmbedding } from './utils/embedding.js';

const policies = [
  { code: 'TITLE-01', title: 'Title clarity and accuracy', keywords: ['title', 'brand', 'model'], content: 'Titles must accurately identify the item or service. Do not use unverifiable superlatives, excessive capitals, emojis, keyword stuffing, or claims not supported in the listing.' },
  { code: 'DESC-01', title: 'Complete description', keywords: ['description', 'condition', 'details'], content: 'Descriptions must state material product or service details, condition where relevant, and any important limitations. Content must be clear, specific, and consistent with the title and attributes.' },
  { code: 'CLAIM-01', title: 'Prohibited and high-risk claims', keywords: ['guaranteed', 'cure', 'medical', 'certified', 'safe'], content: 'Do not state that a product cures, treats, prevents, or guarantees an outcome. Do not claim certification, testing, endorsement, or safety unless verifiable evidence is supplied in the listing.' },
  { code: 'MISLEAD-01', title: 'Misleading information', keywords: ['best', 'free', 'official', 'comparison'], content: 'Listings may not contain false, deceptive, or materially incomplete information. Comparative claims, availability promises, and performance claims require a clear basis and must not mislead buyers.' },
  { code: 'PRICE-01', title: 'Transparent pricing', keywords: ['price', 'fee', 'tax', 'shipping'], content: 'The stated price must be a real, non-negative amount for the advertised item or service. Required fees or material purchase conditions must be disclosed clearly before purchase.' },
  { code: 'CAT-01', title: 'Supported categories', keywords: ['category', 'product', 'service'], content: 'Listings must be assigned to the category that most accurately represents the offering. Regulated, illegal, adult, weapons, and controlled-substance content is not permitted.' },
  { code: 'BRAND-01', title: 'Brand and content guide', keywords: ['brand', 'professional', 'format'], content: 'Use professional, plain language. Do not impersonate a brand or marketplace, use pressure tactics, all caps, excessive punctuation, unsupported slogans, or misleading before-and-after claims.' }
];
const listings = [
  { title: 'Wireless Noise-Cancelling Headphones', description: 'Over-ear wireless headphones with Bluetooth 5.3, foldable design, USB-C charging cable, and carrying pouch. Black. Battery life is up to 30 hours based on manufacturer specifications.', category: 'Electronics', price: 79.99, attributes: { color: 'Black', connectivity: 'Bluetooth 5.3' }, seller: 'Northstar Audio', tags: ['headphones', 'wireless'] },
  { title: 'Adjustable Aluminum Laptop Stand', description: 'Ventilated aluminum stand for laptops from 11 to 16 inches. Height and angle adjust for desk use. Includes non-slip silicone pads. Laptop is not included.', category: 'Home & Office', price: 34.5, attributes: { material: 'Aluminum', compatibility: '11–16 inch laptops' }, seller: 'Deskform Supply', tags: ['office', 'ergonomic'] },
  { title: 'MIRACLE ACNE CURE - Guaranteed Results!!!', description: 'Our revolutionary serum permanently cures acne overnight and is 100% dermatologist certified. Works for everyone with instant results. Limited time only!!!', category: 'Beauty & Personal Care', price: 29.99, attributes: { size: '30 ml' }, seller: 'GlowWorks', tags: ['skincare', 'acne'] },
  { title: 'Elite Running Shoes', description: 'The best running shoes ever made. Makes every runner 30% faster, guaranteed. Lightweight everyday trainers in blue, sizes 6–12.', category: 'Fashion', price: 110, attributes: { color: 'Blue', sizes: '6–12' }, seller: 'Stride Shop', tags: ['running', 'shoes'] },
  { title: 'Online Algebra Tutoring — 60 Minutes', description: 'One live 60-minute online algebra tutoring session for grades 8–10. The tutor will review current topics and practice problems. Scheduling is arranged after purchase; learner should share their goals in advance.', category: 'Services', price: 45, attributes: { duration: '60 minutes', delivery: 'Online' }, seller: 'ClearPath Learning', tags: ['tutoring', 'math'] }
];

async function seed() {
  await connectDatabase();
  let policiesInserted = 0;
  let policiesSkipped = 0;
  let listingsInserted = 0;
  let listingsSkipped = 0;

  for (const policy of policies) {
    const existing = await PolicySection.findOne({ code: policy.code }).select('_id').lean();
    if (existing) {
      policiesSkipped += 1;
      continue;
    }

    await PolicySection.create({
      ...policy,
      embedding: makeEmbedding(`${policy.title} ${policy.content} ${policy.keywords.join(' ')}`),
    });
    policiesInserted += 1;
  }

  for (const listing of listings) {
    const existing = await Listing.findOne({ title: listing.title, seller: listing.seller }).select('_id').lean();
    if (existing) {
      listingsSkipped += 1;
      continue;
    }

    await Listing.create(listing);
    listingsInserted += 1;
  }

  console.log(`Policies: ${policiesInserted} inserted, ${policiesSkipped} already existing.`);
  console.log(`Listings: ${listingsInserted} inserted, ${listingsSkipped} already existing.`);
  process.exit(0);
}
seed().catch((error) => { console.error(error); process.exit(1); });
