const errorHandler = (err, req, res) => {
  res.status(500).json({ message: "Internal Server Error" });
};

module.exports = errorHandler;