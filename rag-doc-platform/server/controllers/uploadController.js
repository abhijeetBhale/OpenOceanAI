import path from "path";
import fs from "fs";
import { extractTextFromFile } from "../services/ocrService.js";
import { chunkText } from "../services/chunkService.js";
import { generateEmbeddings } from "../services/embeddingService.js";
import {
  addDocuments,
  clearCollection,
  initializeVectorStore,
} from "../services/vectorService.js";
import { storeDocument } from "../services/documentStore.js";
import {
  classifyDocument,
  CATEGORIES,
} from "../services/classificationService.js";

const UPLOAD_DIR = "./uploads";

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    const extractedText = await extractTextFromFile(filePath, mimeType);

    if (!extractedText || extractedText.trim().length < 10) {
      // remove unprocessable file
      try {
        fs.unlinkSync(filePath);
      } catch {}
      return res
        .status(400)
        .json({ error: "Could not extract text from document" });
    }

    await clearCollection();

    const chunks = chunkText(extractedText);
    const embeddings = await generateEmbeddings(chunks);

    const documents = chunks.map((text, index) => ({
      text,
      embedding: embeddings[index],
      source: req.file.originalname,
    }));

    await initializeVectorStore();
    await addDocuments(documents);

    const classification = await classifyDocument(extractedText);
    // keep uploaded file in ./uploads so client can preview it; return URL
    const fileUrl = `/uploads/${req.file.filename}`;
    storeDocument(
      extractedText,
      req.file.originalname,
      classification.category,
      fileUrl,
    );

    res.json({
      message: "Document processed successfully",
      chunksCreated: chunks.length,
      documentName: req.file.originalname,
      // Return full extracted text so downstream features (compare, jobs) have complete content
      documentText: extractedText,
      uploadedAt: new Date().toISOString(),
      category: classification.category,
      fileUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
}

export default { uploadDocument };
