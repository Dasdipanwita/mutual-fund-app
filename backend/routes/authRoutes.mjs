import express from 'express';
import { register, login, changePassword } from '../controllers/authController.mjs';
import { protect } from '../middleware/authMiddleware.mjs';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/change-password', protect, changePassword);

export default router;
