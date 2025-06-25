import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import connectDB from './db_config/db.mjs';
import authRoutes from './routes/authRoutes.mjs';
import fundRoutes from './routes/fundRoutes.mjs';
import guidanceRoutes from './routes/guidanceRoutes.mjs';

// --- Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Environment Variables ---
try {
  dotenv.config({ path: path.join(__dirname, '.env') });
  console.log('✅ Environment variables loaded');
} catch (error) {
  console.error('❌ Failed to load environment variables:', error);
  process.exit(1);
}

// --- Validate Environment Variables ---
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error('❌ Missing required environment variables (MONGO_URI, JWT_SECRET).');
  process.exit(1);
}
console.log('✅ Environment variables validated');

// --- Express App Initialization ---
const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({
  origin: '['https://mutualfund.netlify.app']', // Allow any origin
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- Request Logging Middleware ---
app.use((req, res, next) => {
  console.log(`🚀 ${req.method} ${req.url}`);
  next();
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/funds', fundRoutes);
app.use('/api/guidance', guidanceRoutes);

// --- PING TEST ROUTE ---
app.get('/ping', (req, res) => {
  console.log('✅ Ping route hit! Server is up to date.');
  res.send('Pong! Server is up to date.');
});

// --- Global Error Handling Middleware ---
app.use((err, req, res, next) => {
  console.error('🚨 Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? { message: err.message, stack: err.stack } : {}
  });
});

// --- Process-level Error Handlers ---
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});

// --- Graceful Shutdown ---
const gracefulShutdown = () => {
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// --- Server Startup ---
const startServer = async () => {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
