import { AppError } from './errorHandler.js';

/**
 * Higher-order middleware to validate req.body, req.query, or req.params against a Zod schema
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.name === 'ZodError') {
        const details = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return next(new AppError('VALIDATION_ERROR', 'Validation failed for request data', 400, details));
      }
      next(err);
    }
  };
}
