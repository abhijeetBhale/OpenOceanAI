import express from 'express';
import { getSuggestedQuestions, extractSkills } from '../controllers/suggestedQuestionsController.js';

const router = express.Router();

router.get('/', getSuggestedQuestions);
router.post('/extract-skills', extractSkills);

export default router;
