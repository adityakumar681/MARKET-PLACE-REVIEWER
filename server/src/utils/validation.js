export const SUPPORTED_CATEGORIES = ['Electronics', 'Home & Office', 'Fashion', 'Beauty & Personal Care', 'Services'];

export function validateListing(input) {
  const errors = {};
  const required = ['title', 'description', 'category', 'price', 'seller'];
  required.forEach((field) => { if (input[field] === undefined || String(input[field]).trim() === '') errors[field] = 'This field is required.'; });
  if (input.title && (input.title.trim().length < 8 || input.title.trim().length > 120)) errors.title = 'Title must be 8–120 characters.';
  if (input.description && (input.description.trim().length < 30 || input.description.trim().length > 4000)) errors.description = 'Description must be 30–4,000 characters.';
  if (input.category && !SUPPORTED_CATEGORIES.includes(input.category)) errors.category = `Choose one of: ${SUPPORTED_CATEGORIES.join(', ')}.`;
  if (input.price !== undefined && (!/^\d+(\.\d{1,2})?$/.test(String(input.price)) || Number(input.price) < 0)) errors.price = 'Enter a non-negative price with up to two decimal places.';
  return errors;
}
