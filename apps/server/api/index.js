import { connectDB } from '../src/config/db.js';
import app from '../src/app.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error('Serverless DB connection error:', err);
  }
  return app(req, res);
}
