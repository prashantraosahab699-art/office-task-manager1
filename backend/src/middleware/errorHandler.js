function errorHandler(err, req, res, next) {
  console.error('Error Path:', req.path);
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);

  const status = err.status || 500;
  
  // Ensure we always return a "message" property for frontend toasts
  const message = err.error || err.message || 'Something went wrong on the server';

  res.status(status).json({
    status: 'error',
    message: message,
    error: message, // Support legacy error key if needed
    details: err.details || null,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

module.exports = { errorHandler };
