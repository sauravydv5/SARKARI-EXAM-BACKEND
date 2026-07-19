import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import env from './config/env.js';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import User from './models/User.js';
import Post from './models/Post.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

if (env.trustProxy) {
  app.set('trust proxy', 1);
}

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: env.isProd
      ? {
          useDefaults: true,
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https:'],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameSrc: ["'none'"],
          },
        }
      : false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS - allow specific frontend origins and enable credentials
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://sarkarijobhub.website',
      'https://www.sarkarijobhub.website',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: false, limit: '200kb' }));
app.use(mongoSanitize());
app.use(hpp());

app.use(
  morgan(env.isProd ? 'combined' : 'dev', {
    skip: (req) => req.url === '/api/health',
  })
);

// Global API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.isProd ? 300 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api/', apiLimiter);

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'OK',
    env: env.nodeEnv,
    time: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Serve React build in production
const clientDist = path.join(__dirname, '../../frontend/dist');
if (env.isProd) {
  app.use(
    express.static(clientDist, {
      maxAge: '7d',
      index: false,
    })
  );
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'), (err) => {
      if (err) next();
    });
  });
}

app.use(notFound);
app.use(errorHandler);

async function bootstrapAdminAndSeed() {
  if (env.seedAdmin) {
    const existing = await User.findOne({ email: env.adminEmail.toLowerCase() });
    if (!existing) {
      await User.create({
        name: 'Admin',
        email: env.adminEmail.toLowerCase(),
        password: env.adminPassword,
        role: 'admin',
      });
      console.log(`Admin user created: ${env.adminEmail}`);
    }
  }

  // Optional first-time import only when DB has ZERO posts.
  // Never deletes or overwrites existing posts (permanent MongoDB data).
  if (!env.seedDemo) return;

  const count = await Post.countDocuments();
  if (count > 0) {
    console.log(`MongoDB has ${count} posts — skipping auto-import (data is permanent)`);
    return;
  }

  console.log('Empty database — importing reference posts once (SEED_DEMO)...');
  const admin = await User.findOne({ email: env.adminEmail.toLowerCase() });
  if (!admin) {
    console.warn('Skip import: no admin user found');
    return;
  }
  const { default: runInlineSeed } = await import('./utils/inlineSeed.js');
  await runInlineSeed(admin._id);
  console.log('Reference posts saved permanently. Manage via Admin panel.');
}

async function start() {
  await connectDB();
  await bootstrapAdminAndSeed();

  return new Promise((resolve, reject) => {
    const server = app
      .listen(env.port, () => {
        console.log(`API listening on http://localhost:${env.port} [${env.nodeEnv}]`);
        if (env.isProd) {
          console.log(`Serving frontend from ${clientDist}`);
        }
        resolve(server);
      })
      .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.error(`Port ${env.port} is already in use. Set PORT to a different value and restart.`);
        } else {
          console.error('Server failed to start:', err);
        }
        reject(err);
      });
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
