import express from "express";
import multer from "multer";
import { qa, ingest } from "../controllers/langchainController.js";

const router = express.Router();
const upload = multer({ dest: "./uploads" });

router.post("/qa", qa);
router.post("/ingest", upload.single("file"), ingest);

export default router;
