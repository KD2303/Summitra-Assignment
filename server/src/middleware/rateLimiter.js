import rateLimit from 'express-rate-limit';

/**
 * Standard API rate limiter
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests from this IP, please try again after 15 minutes'
    }
  }
});

/**
 * Stricter rate limiter for booking creation to prevent automated spam/bots
 */
export const bookingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // max 30 booking attempts per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many booking attempts. Please wait a minute before trying again.'
    }
  }
});

/**
 * Stricter rate limiter for authentication
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 login attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many login attempts. Please wait 15 minutes before trying again.'
    }
  }
});
