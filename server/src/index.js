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
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Configure Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: [CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Attach io instance to express app
app.set('io', io);
setupSocketIO(io);

// Security & Parsing Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: [CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
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
server.listen(PORT, async () => {
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
