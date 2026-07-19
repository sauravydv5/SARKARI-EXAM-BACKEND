import env from '../config/env.js';

export function notFound(req, res, _next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(err, _req, res, _next) {
  console.error('[error]', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }

  // Duplicate key
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Duplicate entry' });
  }

  // Validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors || {}).map((e) => e.message),
    });
  }

  const status = err.status || err.statusCode || 500;
  const message =
    status === 500 && env.isProd
      ? 'Internal server error'
      : err.message || 'Server error';

  res.status(status).json({ success: false, message });
}
