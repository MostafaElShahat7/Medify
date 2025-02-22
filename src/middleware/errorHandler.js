const winston = require('winston');

const errorHandler = (err, req, res, next) => {
  // Log the error
  winston.error(err.message, { 
    metadata: {
      stack: err.stack,
      path: req.path,
      method: req.method
    }
  });

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = { errorHandler };