import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/connection.js';
import { AppError } from '../middleware/errorHandler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'summitra_super_secret_jwt_key_2026_secure';
const COOKIE_NAME = 'token';

export const authController = {
  /**
   * Admin Login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const [admins] = await pool.query(
        `SELECT id, email, password_hash FROM admins WHERE email = ?`,
        [email.toLowerCase().trim()]
      );

      if (!admins || admins.length === 0) {
        throw new AppError('UNAUTHENTICATED', 'Invalid email or password', 401);
      }

      const admin = admins[0];
      const match = await bcrypt.compare(password, admin.password_hash);

      if (!match) {
        throw new AppError('UNAUTHENTICATED', 'Invalid email or password', 401);
      }

      // Generate JWT
      const token = jwt.sign(
        { id: admin.id, email: admin.email, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Set httpOnly cookie
      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.status(200).json({
        success: true,
        token, // Also return in body for Authorization header convenience
        admin: {
          id: admin.id,
          email: admin.email
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Admin Logout
   */
  async logout(req, res) {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  },

  /**
   * Verify authenticated admin session
   */
  async me(req, res) {
    res.status(200).json({
      admin: {
        id: req.admin.id,
        email: req.admin.email
      }
    });
  }
};
