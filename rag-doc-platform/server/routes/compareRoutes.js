import express from 'express';
import multer from 'multer';
import { compareDocuments } from '../controllers/compareController.js';

const router = express.Router();
const upload = multer({ dest: './uploads' });

router.post('/', upload.single('file'), compareDocuments);

export default router;
