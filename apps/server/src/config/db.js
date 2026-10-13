import mongoose from 'mongoose';

let cachedPromise = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGO_URI) {
    console.warn('MONGO_URI is not set. Database will not connect.');
    return null;
  }

  if (!cachedPromise) {
    cachedPromise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    }).then((conn) => {
      console.log('Connected to MongoDB');
      return conn;
    }).catch((err) => {
      console.error('MongoDB connection error:', err);
      cachedPromise = null;
      throw err;
    });
  }

  return cachedPromise;
};

