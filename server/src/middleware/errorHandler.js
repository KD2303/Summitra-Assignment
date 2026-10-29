export class AppError extends Error {
  constructor(code, message, statusCode = 400, details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Resource not found: ${req.method} ${req.originalUrl}`
    }
  });
}

export function errorHandler(err, req, res, next) {
  // If it's our custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details || undefined
      }
    });
  }

  // Handle MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: 'A duplicate record already exists.'
      }
    });
  }

  // Handle Zod errors if thrown directly
  if (err.name === 'ZodError') {
    const formattedErrors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed for request payload',
        details: formattedErrors
      }
    });
  }

  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected internal error occurred.' 
        : err.message
    }
  });
}
