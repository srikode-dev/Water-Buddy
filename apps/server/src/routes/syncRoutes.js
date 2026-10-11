import express from 'express';
import { syncData, getUserLogs } from '../controllers/syncController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, syncData);
router.get('/logs', authenticateToken, getUserLogs);

export default router;
