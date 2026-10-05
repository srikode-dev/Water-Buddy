import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import syncRoutes from './routes/syncRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/sync', syncRoutes);

export default app;
