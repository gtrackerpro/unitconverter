import { Router } from 'express';
import { ConversionController } from '../controllers/conversion.controller';

const router = Router();

// POST /api/convert
router.post('/convert', ConversionController.convert);

// GET /api/history
router.get('/history', ConversionController.getHistory);

export default router;