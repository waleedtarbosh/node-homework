// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 400 && statusCode < 500) {
    console.warn(`WARN: ${err.constructor.name} - ${err.message}`);
  } else {
    console.error(`ERROR: ${err.constructor.name} - ${err.message}`);
  }

  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
    requestId: req.requestId,
  });
};

module.exports = errorHandler;