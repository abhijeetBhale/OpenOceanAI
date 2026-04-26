import { ChromaClient } from 'chromadb';

const COLLECTION_NAME = 'documents';

let chromaClient = null;
let collection = null;

async function getChromaClient() {
  if (!chromaClient) {
    const chromaUrl = process.env.CHROMA_URL || 'http://chromadb:8000';
    chromaClient = new ChromaClient({
      path: chromaUrl,
    });
  }
  return chromaClient;
}

export async function initializeVectorStore() {
  const client = await getChromaClient();
  
  try {
    collection = await client.getOrCreateCollection({
      name: COLLECTION_NAME,
    });
  } catch (error) {
    console.error('Failed to initialize vector store:', error);
    throw error;
  }
  
  return collection;
}

export async function addDocuments(documents) {
  if (!collection) {
    await initializeVectorStore();
  }

  const ids = documents.map((_, index) => `doc_${index}`);
  const embeddings = documents.map((doc) => doc.embedding);
  const texts = documents.map((doc) => doc.text);
  const metadatas = documents.map((doc) => ({ source: doc.source }));

  try {
    await collection.add({
      ids,
      embeddings,
      documents: texts,
      metadatas,
    });
  } catch (error) {
    console.error('Failed to add documents:', error);
    throw error;
  }
}

export async function searchSimilar(queryEmbedding, topK = 5) {
  if (!collection) {
    await initializeVectorStore();
  }

  try {
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: topK,
    });

    return {
      documents: results.documents[0] || [],
      metadatas: results.metadatas[0] || [],
      distances: results.distances[0] || [],
    };
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
}

export async function clearCollection() {
  if (!collection) {
    await initializeVectorStore();
  }

  try {
    const all = await collection.get();
    if (all.ids.length > 0) {
      await collection.delete({ ids: all.ids });
    }
  } catch (error) {
    console.error('Failed to clear collection:', error);
    throw error;
  }
}

export default {
  initializeVectorStore,
  addDocuments,
  searchSimilar,
  clearCollection,
  getOrCreateCollection: initializeVectorStore,
};