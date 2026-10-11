import express from 'express';
import { registerUser, loginUser, getMe, updateProfile } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', getMe);
router.put('/profile', updateProfile);

export default router;
