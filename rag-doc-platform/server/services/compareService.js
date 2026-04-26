import groqClient from '../config/grokClient.js';
import { generateEmbedding } from './embeddingService.js';
import { chunkText } from './chunkService.js';

function cosineSimilarity(vec1, vec2) {
  if (!vec1 || !vec2 || vec1.length !== vec2.length) return 0;
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  
  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);
  
  if (norm1 === 0 || norm2 === 0) return 0;
  
  return dotProduct / (norm1 * norm2);
}

export async function compareDocuments(doc1Text, doc2Text) {
  const chunks1 = chunkText(doc1Text);
  const chunks2 = chunkText(doc2Text);

  const doc1Embedding = await generateEmbedding(doc1Text);
  const doc2Embedding = await generateEmbedding(doc2Text);

  const similarityScore = cosineSimilarity(doc1Embedding, doc2Embedding);
  const similarityPercent = Math.round(similarityScore * 100);

  const prompt = `Compare two documents and provide a detailed analysis.

Document 1 Content:
${doc1Text.slice(0, 4000)}

Document 2 Content:
${doc2Text.slice(0, 4000)}

Provide a comprehensive comparison including:

1. **Similarity Analysis** (${similarityPercent}% similar based on embeddings):
   - What aspects are similar?
   - What aspects are different?

2. **Document 1 Key Points**:
   - Main topics covered
   - Key information, skills, or data

3. **Document 2 Key Points**:
   - Main topics covered
   - Key information, skills, or data

4. **Comparison Summary**:
   - Overall relationship between documents
   - If very different, explain how they differ
   - Unique aspects of each document

5. **Recommendations**:
   - How could these documents complement each other?
   - What should be noted about using them together?

Format with clear headings, bullet points, and bold text for important terms.`;

  const response = await groqClient.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { 
        role: 'system', 
        content: 'You are a document comparison expert. Provide detailed, balanced analysis of both documents.' 
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.4,
    max_tokens: 3000,
  });

  const analysis = response.choices?.[0]?.message?.content || 'Analysis generation failed.';

  const isVeryDifferent = similarityPercent < 30;
  const isVerySimilar = similarityPercent > 70;
  
  let relationshipNote = '';
  if (isVerySimilar) {
    relationshipNote = 'These documents appear to be very similar or essentially the same.';
  } else if (isVeryDifferent) {
    relationshipNote = 'These are different documents with different content, purposes, or contexts.';
  } else {
    relationshipNote = 'These documents share some similarities but also have notable differences.';
  }

  return {
    similarityScore: similarityPercent,
    isVerySimilar,
    isVeryDifferent,
    relationshipNote,
    analysis,
    doc1Preview: doc1Text.slice(0, 500),
    doc2Preview: doc2Text.slice(0, 500),
    doc1Chunks: chunks1.length,
    doc2Chunks: chunks2.length,
  };
}

export default { compareDocuments };