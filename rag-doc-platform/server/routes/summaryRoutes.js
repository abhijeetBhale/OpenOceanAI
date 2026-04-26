import express from "express";
import { summarizeDocument } from "../controllers/summaryController.js";

const router = express.Router();

router.post("/", summarizeDocument);

export default router;
