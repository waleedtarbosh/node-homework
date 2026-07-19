const notFound = (req, res, next) => {
  const error = new Error("Route not found");
  error.statusCode = 404;
  error.name = "NotFoundError";
  
  next(error);
};

module.exports = notFound;