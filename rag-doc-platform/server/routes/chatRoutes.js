import express from "express";
import { upsertSession, getSession } from "../controllers/chatController.js";

const router = express.Router();

// Create or update a chat session. If no sessionKey is provided, a new one is created.
router.post("/session", upsertSession);

// Get a chat session by sessionKey
router.get("/session/:sessionKey", getSession);

export default router;
