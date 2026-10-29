import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

export function authenticateAdmin(req, res, next) {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return next(new AppError('UNAUTHENTICATED', 'Authentication required to access this resource', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'summitra_super_secret_jwt_key_2026_secure');
    req.admin = decoded;
    next();
  } catch (err) {
    return next(new AppError('FORBIDDEN', 'Invalid or expired authentication token', 403));
  }
}
