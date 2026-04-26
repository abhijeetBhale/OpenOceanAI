import express from 'express';
import { analyzeAtsScore } from '../controllers/atsController.js';

const router = express.Router();

router.post('/', analyzeAtsScore);

export default router;