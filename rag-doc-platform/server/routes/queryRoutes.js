import express from 'express';
import { askQuery } from '../controllers/queryController.js';

const router = express.Router();

router.post('/', askQuery);

export default router;
