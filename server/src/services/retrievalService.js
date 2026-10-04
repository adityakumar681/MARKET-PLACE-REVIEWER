import PolicySection from '../models/PolicySection.js';
import { cosineSimilarity, makeEmbedding } from '../utils/embedding.js';

export async function retrieveRelevantPolicies(listing, limit = 5) {
  const query = `${listing.title} ${listing.description} ${listing.category} ${listing.tags?.join(' ') || ''} ${Object.values(listing.attributes || {}).join(' ')}`;
  const embedding = makeEmbedding(query);
  const sections = await PolicySection.find().lean();
  return sections
    .map((section) => ({ ...section, score: cosineSimilarity(embedding, section.embedding?.length ? section.embedding : makeEmbedding(`${section.title} ${section.content}`)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
