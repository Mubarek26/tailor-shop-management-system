const AppError = require('../utils/appError');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const status = err.status || 'error';
  const message = err.message || 'Server Error';

  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      status,
      message,
      stack: err.stack,
    });
  }

  if (!err.isOperational) {
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }

  return res.status(statusCode).json({
    status,
    message,
  });
};

const notFound = (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
};

module.exports = { errorHandler, notFound };
