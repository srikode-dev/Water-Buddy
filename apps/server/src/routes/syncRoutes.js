import express from 'express';
import { syncData } from '../controllers/syncController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, syncData);

export default router;
