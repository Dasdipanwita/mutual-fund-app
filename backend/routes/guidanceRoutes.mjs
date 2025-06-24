import express from 'express';
import { getExpertGuidance } from '../controllers/guidanceController.mjs';
import { protect } from '../middleware/authMiddleware.mjs';

const router = express.Router();

// This is a protected route, only logged-in users can access it.
router.get('/', protect, getExpertGuidance);

export default router;
