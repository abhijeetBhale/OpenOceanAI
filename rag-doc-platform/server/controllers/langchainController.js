import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const RAG_BASE = process.env.LANGCHAIN_RAG_URL || "http://langchain-rag:8001";

export async function qa(req, res, next) {
  try {
    const { question, collection_name, top_k } = req.body;
    const params = new URLSearchParams();
    params.append("question", question || "");
    if (collection_name) params.append("collection_name", collection_name);
    if (top_k) params.append("top_k", String(top_k));

    const resp = await axios.post(`${RAG_BASE}/qa`, params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 120000,
    });

    res.json(resp.data);
  } catch (err) {
    next(err);
  }
}

export async function ingest(req, res, next) {
  try {
    // Accept either an uploaded file (multer) or text in the body
    const { text, collection_name } = req.body;

    const form = new FormData();

    if (req.file) {
      // multer saved file to disk (dest)
      const stream = fs.createReadStream(req.file.path);
      form.append("file", stream, {
        filename: req.file.originalname || req.file.filename,
      });
    } else if (text) {
      form.append("text", text);
    } else {
      return res.status(400).json({ error: "Provide 'text' or upload a file" });
    }

    if (collection_name) form.append("collection_name", collection_name);

    const headers = form.getHeaders();

    const resp = await axios.post(`${RAG_BASE}/ingest`, form, {
      headers,
      maxBodyLength: Infinity,
      timeout: 120000,
    });

    // cleanup uploaded file if present
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    res.json(resp.data);
  } catch (err) {
    next(err);
  }
}
