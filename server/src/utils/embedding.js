// A compact local hashed-token embedding. It avoids a vector DB dependency while
// still storing vectors and scoring policy relevance with cosine similarity.
const SIZE = 128;
const tokens = (text) => (text.toLowerCase().match(/[a-z0-9]{2,}/g) || []);
const hash = (word) => [...word].reduce((value, char) => ((value * 31) + char.charCodeAt(0)) >>> 0, 7) % SIZE;

export function makeEmbedding(text) {
  const vector = Array(SIZE).fill(0);
  tokens(text).forEach((word) => { vector[hash(word)] += 1; });
  const magnitude = Math.hypot(...vector) || 1;
  return vector.map((value) => value / magnitude);
}

export function cosineSimilarity(left, right) {
  return left.reduce((sum, value, index) => sum + value * (right[index] || 0), 0);
}
