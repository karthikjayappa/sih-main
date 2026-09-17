const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) logger.error(err.message, err.details);
    return res.status(err.statusCode).json({
      data: null,
      error: { message: err.message, details: err.details },
      meta: null,
    });
  }

  logger.error('Unhandled error', err.stack || err.message);
  return res.status(500).json({
    data: null,
    error: { message: 'Internal server error' },
    meta: null,
  });
}

module.exports = { notFoundHandler, errorHandler };
