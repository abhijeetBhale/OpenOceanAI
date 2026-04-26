import groqClient from "../config/grokClient.js";
import { getDocument } from "../services/documentStore.js";

export async function summarizeDocument(req, res) {
  try {
    const { text } = req.body;

    let docText = text;
    if (!docText || docText.trim().length < 20) {
      const stored = getDocument();
      docText = stored && stored.text ? stored.text : "";
    }

    if (!docText || docText.trim().length < 20) {
      return res
        .status(400)
        .json({ error: "Document text is required for summary" });
    }

    const prompt = `Please provide three concise summaries of the following document. Return ONLY a JSON object with keys: "short" (1-2 sentences), "medium" (a single paragraph ~3-5 sentences), and "long" (3-4 paragraphs detailed summary).\n\nDocument:\n${docText.substring(0, 4000)}`;

    const response = await groqClient.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a summarization assistant. Return JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 1200,
    });

    const content = response.choices?.[0]?.message?.content || "";

    let parsed = null;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      const match = content.match(/{[\s\S]*}/m);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (err) {
          parsed = null;
        }
      }
    }

    if (!parsed) {
      const flat = docText.replace(/\s+/g, " ").trim();
      const short = flat.slice(0, 240) + (flat.length > 240 ? "..." : "");
      const medium = flat.slice(0, 900) + (flat.length > 900 ? "..." : "");
      const long = flat.slice(0, 3000) + (flat.length > 3000 ? "..." : "");
      return res.json({ short, medium, long, fallback: true });
    }

    res.json(parsed);
  } catch (error) {
    console.error("Summary error:", error);
    res.status(500).json({ error: error.message });
  }
}

export default { summarizeDocument };
