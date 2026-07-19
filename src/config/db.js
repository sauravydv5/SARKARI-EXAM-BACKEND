import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import env from './env.js';

let memoryServer = null;

export async function connectDB() {
  mongoose.set('strictQuery', true);

  if (env.mongoUri) {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB connected');
    return;
  }

  if (env.isProd) {
    throw new Error('MONGO_URI is required in production');
  }

  // Dev-only fallback
  memoryServer = await MongoMemoryServer.create();
  const memUri = memoryServer.getUri();
  await mongoose.connect(memUri);
  console.log('MongoDB Memory Server connected (dev only — data resets on restart)');
  console.log('Set MONGO_URI in .env for persistent MongoDB');
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
