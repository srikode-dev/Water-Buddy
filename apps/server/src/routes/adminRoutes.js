import express from 'express';
import {
  getAdminStats,
  getAdminUsers,
  getAdminInquiries,
  createInquiry
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.get('/inquiries', getAdminInquiries);
router.post('/inquiry', createInquiry);

export default router;
