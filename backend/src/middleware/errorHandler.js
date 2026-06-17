const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Внутренняя ошибка сервера';

  logger.error(message, {
    status,
    method: req.method,
    url: req.originalUrl,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });

  res.status(status).json({ message });
}

module.exports = errorHandler;