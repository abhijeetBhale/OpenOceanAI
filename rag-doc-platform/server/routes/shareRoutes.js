import express from 'express';
import { createShareableLink, getSharedChat } from '../controllers/shareController.js';

const router = express.Router();

router.post('/create', createShareableLink);
router.get('/:shareId', getSharedChat);

export default router;
