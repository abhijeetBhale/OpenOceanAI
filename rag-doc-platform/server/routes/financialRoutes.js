import express from 'express';
import { analyzeFinancial } from '../controllers/financialController.js';

const router = express.Router();

router.post('/', analyzeFinancial);

export default router;