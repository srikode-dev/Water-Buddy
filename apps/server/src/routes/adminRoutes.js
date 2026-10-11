import express from 'express';
import {
  getAdminStats,
  getAdminUsers,
  getAdminInquiries,
  createInquiry,
  getPricing,
  updatePricing,
  getEntitlements,
  resetDefaultFeatures
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.get('/inquiries', getAdminInquiries);
router.post('/inquiry', createInquiry);
router.post('/inquiries', createInquiry);
router.get('/pricing', getPricing);
router.put('/pricing', updatePricing);
router.post('/pricing/reset-defaults', resetDefaultFeatures);
router.get('/entitlements', getEntitlements);

export default router;
