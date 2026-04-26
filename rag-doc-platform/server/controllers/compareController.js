import compareService from "../services/compareService.js";
import { extractTextFromFile } from "../services/ocrService.js";

function calculateCosineSimilarity(vec1, vec2) {
  if (!vec1 || !vec2 || vec1.length === 0 || vec2.length === 0) return 0;

  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  for (let i = 0; i < Math.min(vec1.length, vec2.length); i++) {
    dotProduct += vec1[i] * vec2[i];
    mag1 += vec1[i] * vec1[i];
    mag2 += vec2[i] * vec2[i];
  }

  mag1 = Math.sqrt(mag1);
  mag2 = Math.sqrt(mag2);

  if (mag1 === 0 || mag2 === 0) return 0;
  return Math.max(0, Math.min(1, dotProduct / (mag1 * mag2)));
}

function normalizeText(text) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function getWords(text) {
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return new Set(cleaned.split(/\s+/).filter((w) => w.length > 2));
}

function calculateWordMatch(text1, text2) {
  const words1 = getWords(text1);
  const words2 = getWords(text2);

  if (words1.size === 0 || words2.size === 0) return 0;

  let matches = 0;
  words1.forEach((word) => {
    if (words2.has(word)) matches++;
  });

  const ratio1 = matches / words1.size;
  const ratio2 = matches / words2.size;
  const avgRatio = (ratio1 + ratio2) / 2;
  return Math.round(avgRatio * 100);
}

function checkIfDocumentsMatch(text1, text2) {
  const clean1 = normalizeText(text1);
  const clean2 = normalizeText(text2);

  if (clean1 === clean2) return { isIdentical: true, matchPercentage: 100, reason: "exact_string" };

  const strict1 = text1.toLowerCase().replace(/[^a-z0-9\s]/gi, "").replace(/\s+/g, " ").trim();
  const strict2 = text2.toLowerCase().replace(/[^a-z0-9\s]/gi, "").replace(/\s+/g, " ").trim();
  if (strict1 === strict2) return { isIdentical: true, matchPercentage: 100, reason: "normalized_exact" };

  const wordMatchPercent = calculateWordMatch(text1, text2);

  if (wordMatchPercent >= 95) {
    return { isIdentical: true, matchPercentage: 100, reason: "word_match" };
  }

  if (wordMatchPercent >= 80) {
    return { isIdentical: false, matchPercentage: Math.round(wordMatchPercent), reason: "high_word_match" };
  }

  return { isIdentical: false, matchPercentage: Math.round(wordMatchPercent), reason: "use_embeddings" };
}

function extractDocumentInfo(text, name) {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  const words = normalizeText(text).split(/\s+/).filter((w) => w.length > 0);

  const techSkills = [
    "javascript",
    "python",
    "java",
    "react",
    "node",
    "sql",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "html",
    "css",
    "typescript",
    "angular",
    "vue",
    "express",
    "django",
    "flask",
    "mongodb",
    "postgresql",
    "mysql",
    "git",
    "linux",
    "api",
    "rest",
    "graphql",
    "microservices",
    "devops",
    "ci/cd",
    "agile",
  ];

  const foundSkills = techSkills.filter((s) => text.toLowerCase().includes(s));

  const yearsMatch = text.match(/(\d+)\+?\s*(?:years?|yrs?)/i);
  const experience = yearsMatch ? parseInt(yearsMatch[1]) : null;

  const degrees = text.match(/\b(?:bachelor|master|phd|m\.s\.|b\.s\.|mba|b\.a\.|b\.tech)\b/gi) || [];
  const uniqueDegrees = [...new Set(degrees.map((d) => d.toLowerCase()))];

  const jobTitles = text.match(/\b(?:senior|junior|lead|principal|staff)?\s*(?:engineer|developer|manager|analyst|designer|architect|consultant)\b/gi) || [];
  const uniqueTitles = [...new Set(jobTitles.map((j) => j.trim()))];

  const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  const uniqueEmails = [...new Set(emails)];

  const phones = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || [];
  const uniquePhones = [...new Set(phones)];

  let preview = "";
  for (const line of lines.slice(0, 10)) {
    if (line.length > 30 && line.length < 250) {
      preview = line.trim();
      break;
    }
  }

  return {
    name,
    wordCount: words.length,
    charCount: text.length,
    paragraphs: text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length,
    lines: lines.length,
    preview: preview.substring(0, 200) + (preview.length > 200 ? "..." : ""),
    skills: foundSkills,
    experience,
    degrees: uniqueDegrees,
    jobTitles: uniqueTitles.slice(0, 5),
    emails: uniqueEmails,
    phones: uniquePhones,
  };
}

function getContentAnalysis(text1, text2) {
  const words1 = getWords(text1);
  const words2 = getWords(text2);

  const common = [...words1].filter((w) => words2.has(w)).slice(0, 25);
  const unique1 = [...words1].filter((w) => !words2.has(w)).slice(0, 20);
  const unique2 = [...words2].filter((w) => !words1.has(w)).slice(0, 20);

  return {
    commonWords: common,
    uniqueToDoc1: unique1,
    uniqueToDoc2: unique2,
  };
}

export async function compareDocuments(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded for comparison" });
    }

    const { doc1Text, doc1Name } = req.body;

    if (!doc1Text || doc1Text.trim().length < 10) {
      return res.status(400).json({ error: "First document text is required" });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    const doc2Name = req.file.originalname;

    const doc2Text = await extractTextFromFile(filePath, mimeType);

    if (!doc2Text || doc2Text.trim().length < 10) {
      return res.status(400).json({ error: "Could not extract text from the second document" });
    }

    // Fast checks for identical documents
    const matchCheck = checkIfDocumentsMatch(doc1Text, doc2Text);
    let similarityScore = matchCheck.matchPercentage;
    let llmAnalysis = null;
    let serviceRelationshipNote = null;

    // If fast checks say not identical, use compareService (embeddings + LLM)
    if (!matchCheck.isIdentical) {
      try {
        const serviceResult = await compareService.compareDocuments(doc1Text, doc2Text);
        similarityScore = Math.round(serviceResult.similarityScore || similarityScore);
        llmAnalysis = serviceResult.analysis || null;
        serviceRelationshipNote = serviceResult.relationshipNote || null;
      } catch (e) {
        console.log("Comparison service issue:", e.message);
      }
    }

    // Determine match category
    const isIdentical = similarityScore >= 95;
    const isVerySimilar = similarityScore >= 80;
    const isSimilar = similarityScore >= 60;
    const isDifferent = similarityScore <= 40;

    // Extract document information
    const doc1Info = extractDocumentInfo(doc1Text, doc1Name || "Document 1");
    const doc2Info = extractDocumentInfo(doc2Text, doc2Name);
    const contentAnalysis = getContentAnalysis(doc1Text, doc2Text);

    // Relationship note (prefer service-provided phrasing when available)
    let relationshipNote = serviceRelationshipNote || "";
    if (!relationshipNote) {
      if (isIdentical) {
        relationshipNote = `🎯 EXACT MATCH! These documents are IDENTICAL (${similarityScore}% match). They contain the exact same content.`;
      } else if (similarityScore >= 95) {
        relationshipNote = `⚡ NEARLY IDENTICAL (${similarityScore}% match). These documents have only minor differences.`;
      } else if (isVerySimilar) {
        relationshipNote = `✅ VERY SIMILAR (${similarityScore}% match). They cover the same topics with minor variations.`;
      } else if (isSimilar) {
        relationshipNote = `📊 MODERATE MATCH (${similarityScore}% match). They share some content but also have distinct differences.`;
      } else if (isDifferent) {
        relationshipNote = `❌ VERY DIFFERENT (${similarityScore}% match). They cover different topics.`;
      } else {
        relationshipNote = `⚠️ LOW SIMILARITY (${similarityScore}% match). They appear to cover different subjects.`;
      }
    }

    // Build analysis report
    let analysis = `\n## Comparison Results\n\n**Match Score:** ${similarityScore}%\n**Match Reason:** ${matchCheck.reason}\n${isIdentical ? '\n✅ Documents are identical!' : ''}\n`;

    analysis += `\n### Document 1: ${doc1Info.name}\n\n- Words: ${doc1Info.wordCount.toLocaleString()}\n- Characters: ${doc1Info.charCount.toLocaleString()}\n- Experience: ${doc1Info.experience ? doc1Info.experience + ' years' : 'Not specified'}\n- Degrees: ${doc1Info.degrees.length > 0 ? doc1Info.degrees.join(', ') : 'None'}\n- Skills: ${doc1Info.skills.length > 0 ? doc1Info.skills.join(', ') : 'None detected'}\n- Job Titles: ${doc1Info.jobTitles.length > 0 ? doc1Info.jobTitles.join(', ') : 'None'}\n`;

    analysis += `\n### Document 2: ${doc2Info.name}\n\n- Words: ${doc2Info.wordCount.toLocaleString()}\n- Characters: ${doc2Info.charCount.toLocaleString()}\n- Experience: ${doc2Info.experience ? doc2Info.experience + ' years' : 'Not specified'}\n- Degrees: ${doc2Info.degrees.length > 0 ? doc2Info.degrees.join(', ') : 'None'}\n- Skills: ${doc2Info.skills.length > 0 ? doc2Info.skills.join(', ') : 'None detected'}\n- Job Titles: ${doc2Info.jobTitles.length > 0 ? doc2Info.jobTitles.join(', ') : 'None'}\n`;

    analysis += `\n### Content Overlap\n\n- Common words: ${contentAnalysis.commonWords.length}\n- Unique to Doc 1: ${contentAnalysis.uniqueToDoc1.length}\n- Unique to Doc 2: ${contentAnalysis.uniqueToDoc2.length}\n`;

    if (contentAnalysis.commonWords.length > 0) {
      analysis += `\n**Shared:** ${contentAnalysis.commonWords.slice(0, 15).join(', ')}`;
    }

    if (llmAnalysis) {
      analysis += `\n\n---\n\n### LLM Analysis\n\n${llmAnalysis}`;
    }

    analysis += `\n\n---\n\n${relationshipNote}\n`;

    res.json({
      similarityScore,
      isIdentical,
      isVerySimilar,
      isSimilar,
      isDifferent,
      relationshipNote,
      doc1Info,
      doc2Info,
      contentAnalysis,
      analysis,
    });
  } catch (error) {
    console.error("Comparison error:", error);
    res.status(500).json({ error: error.message });
  }
}

export default { compareDocuments };
