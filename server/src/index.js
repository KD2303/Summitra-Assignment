import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';

import { testConnection } from './db/connection.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { setupSocketIO } from './sockets/socketHandler.js';

import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const rawClientOrigins = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const allowedOriginsList = rawClientOrigins
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

if (!allowedOriginsList.includes('http://localhost:5173')) allowedOriginsList.push('http://localhost:5173');
if (!allowedOriginsList.includes('http://127.0.0.1:5173')) allowedOriginsList.push('http://127.0.0.1:5173');

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOriginsList.includes(origin)) return true;
  if (/^https:\/\/[a-zA-Z0-9-_.]+\.vercel\.app$/.test(origin)) return true;
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Idempotency-Key',
    'idempotency-key',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Idempotency-Key'],
  optionsSuccessStatus: 200
};

// Configure Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, isOriginAllowed(origin));
    },
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Attach io instance to express app
app.set('io', io);
setupSocketIO(io);

// Security & Parsing Middleware (CORS MUST run first to handle OPTIONS preflight cleanly)
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General Rate Limiting
app.use('/api/', generalLimiter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const isDbHealthy = await testConnection();
  res.status(isDbHealthy ? 200 : 503).json({
    status: isDbHealthy ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: isDbHealthy ? 'connected' : 'disconnected'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
server.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Summitra API Server running on port ${PORT}`);
  console.log(`📡 WebSocket ready on port ${PORT}`);
  await testConnection();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export { app, server, io };
