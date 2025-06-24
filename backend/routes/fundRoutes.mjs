import express from 'express';
import { saveFund, getSavedFunds, searchFunds, removeSavedFund, getFundDetails } from '../controllers/fundController.mjs';
import { protect } from '../middleware/authMiddleware.mjs';

const router = express.Router();

// --- Public Route ---
router.get('/search', searchFunds);
router.get('/details/:schemeCode', getFundDetails); // New proxy route

// --- Protected Routes ---
router.post('/save', protect, saveFund);
router.get('/saved', protect, getSavedFunds);
router.delete('/remove/:schemeCode', protect, removeSavedFund);

export default router;
