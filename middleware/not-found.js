const notFound = (req, res) => {
  console.warn("WARN: NotFoundError - Route not found");
  res.status(404).json({
    error: "Route not found",
    requestId: req.requestId,
  });
};

module.exports = notFound;