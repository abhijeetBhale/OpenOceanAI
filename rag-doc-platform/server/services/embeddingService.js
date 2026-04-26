import { pipeline } from '@xenova/transformers';

let embeddingPipeline = null;

async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    embeddingPipeline = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
  }
  return embeddingPipeline;
}

export async function generateEmbedding(text) {
  const pipeline = await getEmbeddingPipeline();
  const result = await pipeline(text, {
    pooling: 'mean',
    normalize: true,
  });
  return Array.from(result.data);
}

export async function generateEmbeddings(texts) {
  const pipeline = await getEmbeddingPipeline();
  const results = await Promise.all(
    texts.map(async (text) => {
      const result = await pipeline(text, {
        pooling: 'mean',
        normalize: true,
      });
      return Array.from(result.data);
    })
  );
  return results;
}

export default { generateEmbedding, generateEmbeddings };