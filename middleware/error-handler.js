// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(`ERROR: ${err.constructor.name || "Error"} - ${err.message}`);
  
  res.status(500).json({
    error: err.message || "Internal Server Error",
    requestId: req.requestId,
  });
};

module.exports = errorHandler;