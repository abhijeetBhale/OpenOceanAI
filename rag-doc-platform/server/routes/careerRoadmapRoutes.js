import express from 'express';
import { generateRoadmap } from '../controllers/careerRoadmapController.js';

const router = express.Router();

router.post('/', generateRoadmap);

export default router;