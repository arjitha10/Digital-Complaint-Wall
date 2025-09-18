// src/middleware/error.js

// 404 Not Found handler
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: "Route not found" });
};

// Global error handler
export const globalErrorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
};
