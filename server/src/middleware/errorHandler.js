export function errorHandler(error, req, res, next) {
  console.error(error);
  if (error.code === 11000) return res.status(409).json({ message: 'This listing already exists for that seller.', errors: { title: 'Duplicate listing.' } });
  const status = error.statusCode || (error.name === 'CastError' ? 400 : 500);
  res.status(status).json({ message: status === 500 ? 'The server could not complete this request.' : error.message });
}
