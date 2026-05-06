import { ChromaClient } from "chromadb";

const COLLECTION_NAME = "documents";

let chromaClient = null;
let collection = null;
let inMemoryDocuments = [];
let vectorStoreMode = "unknown";

function resolveChromaUrl() {
  return process.env.CHROMA_URL || "http://chromadb:8000";
}

async function getChromaClient() {
  if (!chromaClient) {
    const chromaUrl = resolveChromaUrl();
    chromaClient = new ChromaClient({
      path: chromaUrl,
    });
  }
  return chromaClient;
}

export async function initializeVectorStore() {
  if (collection || vectorStoreMode === "memory") {
    return collection;
  }

  const client = await getChromaClient();

  try {
    collection = await client.getOrCreateCollection({
      name: COLLECTION_NAME,
    });
    vectorStoreMode = "chroma";
  } catch (error) {
    console.error(
      "Failed to initialize vector store, falling back to memory:",
      error,
    );
    collection = null;
    vectorStoreMode = "memory";
  }

  return collection;
}

export async function addDocuments(documents) {
  if (!collection) {
    await initializeVectorStore();
  }

  if (vectorStoreMode === "memory") {
    inMemoryDocuments = documents.map((doc, index) => ({
      id: `doc_${index}`,
      text: doc.text,
      embedding: doc.embedding,
      metadata: { source: doc.source },
    }));
    return;
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
    console.error("Failed to add documents:", error);
    throw error;
  }
}

export async function searchSimilar(queryEmbedding, topK = 5) {
  if (!collection) {
    await initializeVectorStore();
  }

  if (vectorStoreMode === "memory") {
    const scoredDocuments = inMemoryDocuments
      .map((doc) => ({
        ...doc,
        distance: cosineDistance(queryEmbedding, doc.embedding),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, topK);

    return {
      documents: scoredDocuments.map((doc) => doc.text),
      metadatas: scoredDocuments.map((doc) => doc.metadata),
      distances: scoredDocuments.map((doc) => doc.distance),
    };
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
    console.error("Search failed:", error);
    throw error;
  }
}

export async function clearCollection() {
  if (!collection) {
    await initializeVectorStore();
  }

  if (vectorStoreMode === "memory") {
    inMemoryDocuments = [];
    return;
  }

  try {
    const all = await collection.get();
    if (all.ids.length > 0) {
      await collection.delete({ ids: all.ids });
    }
  } catch (error) {
    console.error("Failed to clear collection:", error);
    throw error;
  }
}

function cosineDistance(a = [], b = []) {
  if (!a.length || !b.length || a.length !== b.length) {
    return 1;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let index = 0; index < a.length; index += 1) {
    dot += a[index] * b[index];
    normA += a[index] * a[index];
    normB += b[index] * b[index];
  }

  if (!normA || !normB) {
    return 1;
  }

  const similarity = dot / (Math.sqrt(normA) * Math.sqrt(normB));
  return 1 - similarity;
}

export function getVectorStoreMode() {
  return vectorStoreMode;
}

export default {
  initializeVectorStore,
  addDocuments,
  searchSimilar,
  clearCollection,
  getVectorStoreMode,
  getOrCreateCollection: initializeVectorStore,
};
