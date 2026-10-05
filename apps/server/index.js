import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User, WidgetSettings, WaterLog } from './models.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-water-buddy';

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// --- Auth Endpoints ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });
    
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ email, passwordHash, name });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ token, userId: user._id, name: user.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Sync Endpoints ---
app.post('/api/sync', authenticateToken, async (req, res) => {
  try {
    const { settings, logs } = req.body;
    const userId = req.user.userId;

    // 1. Sync Settings (Last-write wins from client for MVP)
    if (settings) {
      await WidgetSettings.findOneAndUpdate(
        { userId },
        { ...settings, userId },
        { upsert: true, new: true }
      );
    }

    // 2. Sync Logs (Deduplicate using logId)
    let syncedCount = 0;
    if (logs && logs.length > 0) {
      for (const log of logs) {
        // Upsert based on logId
        const result = await WaterLog.updateOne(
          { logId: log.id, userId },
          { $set: { 
              timestamp: log.timestamp, 
              amountMl: log.amount, 
              response: log.response, 
              source: log.source || 'reminder'
            } 
          },
          { upsert: true }
        );
        if (result.upsertedCount > 0) syncedCount++;
      }
    }

    // Fetch the latest state to return to client
    const serverSettings = await WidgetSettings.findOne({ userId });
    // Return logs for today
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const serverLogs = await WaterLog.find({ userId, timestamp: { $gte: startOfDay } });

    res.json({ 
      message: 'Sync successful', 
      syncedLogsCount: syncedCount,
      settings: serverSettings,
      logs: serverLogs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
