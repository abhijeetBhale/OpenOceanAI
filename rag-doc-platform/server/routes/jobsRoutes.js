import express from 'express';
import { findJobs } from '../controllers/jobsController.js';

const router = express.Router();

router.post('/', findJobs);

export default router;
