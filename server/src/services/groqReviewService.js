import Groq from 'groq-sdk';

const schema = {
  type: 'object', additionalProperties: false, required: ['summary', 'findings'],
  properties: {
    summary: { type: 'string' },
    findings: {
      type: 'array', items: {
        type: 'object', additionalProperties: false,
        required: ['issue', 'explanation', 'severity', 'confidence', 'policyCode', 'sourceText', 'suggestedRevision', 'evidenceType'],
        properties: {
          issue: { type: 'string' }, explanation: { type: 'string' }, severity: { type: 'string', enum: ['Low', 'Medium', 'High'] },
          confidence: { type: 'integer', minimum: 0, maximum: 100 }, policyCode: { type: 'string' }, sourceText: { type: 'string' },
          suggestedRevision: { type: 'string' }, evidenceType: { type: 'string', enum: ['confirmed', 'unverifiable'] }
        }
      }
    }
  }
};

export async function runGroqReview(listing, policies) {
  if (!process.env.GROQ_API_KEY) {
    const error = new Error('Groq is not configured. Add GROQ_API_KEY to server/.env before requesting a review.');
    error.statusCode = 503;
    throw error;
  }
  const allowedCodes = policies.map((policy) => policy.code);
  const context = policies.map((policy) => `[${policy.code}] ${policy.title}: ${policy.content}`).join('\n\n');
  const prompt = `Review this marketplace listing only against the supplied policy context. Identify unclear content, misleading or prohibited claims, missing information, unsupported/unverifiable claims, and brand-content violations. A statement in the listing can be confirmed as present; a claim about product performance, certification, results, or comparison is unverifiable unless the listing supplies concrete evidence. Do not treat unverifiable claims as proven false. Return no finding when there is no policy-grounded concern. Every policyCode MUST be one of ${JSON.stringify(allowedCodes)}; never invent a policy citation. Quote the relevant listing text in sourceText. SuggestedRevision must only remove, neutralize, or qualify the cited claim. It must never introduce facts, ingredients, certifications, benefits, measurements, or performance claims absent from the listing. Use a neutral instruction such as "Remove this unsupported claim." when a factual rewrite is not possible.\n\nLISTING:\n${JSON.stringify({ title: listing.title, description: listing.description, category: listing.category, price: listing.price, attributes: listing.attributes, seller: listing.seller, tags: listing.tags })}\n\nPOLICY CONTEXT:\n${context}`;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const response = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
    messages: [{ role: 'system', content: 'You are a precise marketplace policy reviewer. Follow the supplied JSON schema.' }, { role: 'user', content: prompt }],
    response_format: { type: 'json_schema', json_schema: { name: 'listing_review', strict: true, schema } },
    temperature: 0.1
  });
  const result = JSON.parse(response.choices[0].message.content);
  result.findings = result.findings
    .filter((finding) => allowedCodes.includes(finding.policyCode))
    .map((finding) => ({ ...finding, suggestedRevision: safeSuggestedRevision(finding.suggestedRevision) }));
  return { ...result, model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b' };
}

function safeSuggestedRevision(revision) {
  // A conservative backstop for common risky language: the reviewer, never the AI,
  // decides final copy. If generated wording reintroduces a claim, use neutral guidance.
  const riskyTerms = /\b(cure|treat|prevent|guarantee|guaranteed|certif(?:ied|ication)|dermatologist|clinically|proven|best|fastest|permanent|instant|100%)\b/i;
  return riskyTerms.test(revision) ? 'Remove this unsupported claim and replace it with a factual, verifiable description.' : revision;
}
