import groqClient from "../config/grokClient.js";
import { generateEmbedding } from "./embeddingService.js";
import { searchSimilar } from "./vectorService.js";
import { getDocument } from "./documentStore.js";

const SYSTEM_PROMPT = `You are a helpful document assistant with access to both a document and general knowledge.

Your approach:
1. First, check if the document has relevant information for the question
2. Use the document information as the PRIMARY source when available
3. You can always supplement with your general knowledge to provide comprehensive answers
4. Never say "Not found in document" - instead, use your general knowledge to help

When answering:
- Always provide helpful, comprehensive answers
- Use document content as reference when relevant
- Add relevant general knowledge to enrich your response
- If the document has no relevant content, use general knowledge entirely

Format your responses with:
- Bullet points (•) for lists
- Numbered lists (1., 2., 3.) for sequential items
- Line breaks between paragraphs for readability
- **Bold** key terms and important concepts
- Well-structured, easy-to-read content`;

export async function askQuestion(question) {
  const queryEmbedding = await generateEmbedding(question);
  const searchResults = await searchSimilar(queryEmbedding, 5);

  if (!searchResults.documents || searchResults.documents.length === 0) {
    const generalPrompt = `Question: ${question}

Provide a helpful, comprehensive answer using your general knowledge. Format with bullet points, numbered lists, and bold text for key terms.`;

    const response = await groqClient.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant. Provide comprehensive answers using your general knowledge.",
        },
        { role: "user", content: generalPrompt },
      ],
      temperature: 0.5,
      max_tokens: 2000,
    });

    return {
      answer: response.choices?.[0]?.message?.content || "No answer generated",
      sources: [],
      isGeneralKnowledge: true,
    };
  }

  const context = searchResults.documents
    .map((doc, index) => `[Document Chunk ${index + 1}]: ${doc}`)
    .join("\n\n");

  const avgDistance =
    searchResults.distances.reduce((a, b) => a + b, 0) /
    searchResults.distances.length;
  const hasRelevantContent = avgDistance < 1.5;

  const userPrompt = `You have access to a document. Use it as reference, but you can also use your general knowledge.

Document content:
${context}

Question: ${question}

Instructions:
- If the document has relevant information, use it as the primary source
- If the document has partial information, supplement with general knowledge
- If the document has little or no relevant information, use your general knowledge to provide a comprehensive answer
- Always be helpful and provide the best answer possible
- Combine document insights with your knowledge for the most complete response

Format your response with proper spacing, bullet points, numbered lists, and bold text for key terms.`;

  const response = await groqClient.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.6,
    max_tokens: 3000,
  });

  return {
    answer: response.choices?.[0]?.message?.content || "No answer generated",
    sources: (searchResults.documents || []).map((doc, index) => ({
      chunk: doc,
      distance: (searchResults.distances || [])[index] ?? null,
      metadata: (searchResults.metadatas || [])[index] || {},
      index,
    })),
    isGeneralKnowledge: !hasRelevantContent,
  };
}

export async function generateSuggestedQuestions() {
  const storedDoc = getDocument();

  if (!storedDoc || !storedDoc.text || storedDoc.text.trim().length < 50) {
    return [
      "What is this document about?",
      "Who is the author?",
      "What are the main points?",
    ];
  }

  const context = storedDoc.text.slice(0, 4000);

  const prompt = `Based on the following document content, generate 5 diverse questions that a user might want to ask.

Document content:
${context}

Generate 5 questions that cover:
- What the document is about
- Key information in the document
- Useful insights or analysis
- Actionable advice related to the document

Generate exactly 5 questions, one per line. Make them engaging and useful. Do not include numbering or bullets.`;

  const response = await groqClient.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "You generate engaging, useful questions based on document content.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  const questionsText = response.choices?.[0]?.message?.content || "";
  const questions = questionsText
    .split("\n")
    .map((q) =>
      q
        .replace(/^[0-9]+\.\s*/, "")
        .replace(/^[-•]\s*/, "")
        .trim(),
    )
    .filter((q) => q.length > 0 && q.length < 200)
    .slice(0, 5);

  if (questions.length === 0) {
    return [
      "What is this document about?",
      "Who is the author?",
      "What are the main points?",
    ];
  }

  return questions;
}

export default { askQuestion, generateSuggestedQuestions };
