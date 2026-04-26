import ChatSession from "../models/ChatSession.js";
import crypto from "crypto";

function generateSessionKey() {
  return crypto.randomBytes(12).toString("hex");
}

export async function upsertSession(req, res) {
  try {
    const { sessionKey, docInfo, messages } = req.body;

    if (sessionKey) {
      const existing = await ChatSession.findOne({ sessionKey });
      if (existing) {
        if (docInfo) existing.docInfo = docInfo;
        if (messages) existing.messages = messages;
        await existing.save();
        return res.json({
          sessionKey: existing.sessionKey,
          docInfo: existing.docInfo,
          messages: existing.messages,
        });
      }
    }

    const newKey = generateSessionKey();
    const created = new ChatSession({
      sessionKey: newKey,
      docInfo: docInfo || null,
      messages: messages || [],
    });
    await created.save();
    res.json({
      sessionKey: newKey,
      docInfo: created.docInfo,
      messages: created.messages,
    });
  } catch (error) {
    console.error("Chat session upsert error:", error);
    res.status(500).json({ error: error.message });
  }
}

export async function getSession(req, res) {
  try {
    const { sessionKey } = req.params;
    if (!sessionKey)
      return res.status(400).json({ error: "sessionKey required" });

    const session = await ChatSession.findOne({ sessionKey });
    if (!session) return res.status(404).json({ error: "Session not found" });

    res.json({
      sessionKey: session.sessionKey,
      docInfo: session.docInfo,
      messages: session.messages,
    });
  } catch (error) {
    console.error("Chat session fetch error:", error);
    res.status(500).json({ error: error.message });
  }
}

export default { upsertSession, getSession };
