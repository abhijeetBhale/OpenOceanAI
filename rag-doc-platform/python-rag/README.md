LangChain-style Python RAG microservice (FastAPI)

This folder contains a minimal FastAPI service that demonstrates a retrieval-augmented generation (RAG) pattern using OpenAI embeddings and a ChromaDB vector store.

Files:

- `app/main.py` — FastAPI app with `/ingest` and `/qa` endpoints
- `requirements.txt` — Python dependencies
- `Dockerfile` — Docker image build
- `.env.example` — example environment variables

Quick start (local, from project root):

1. Copy `.env.example` to `python-rag/.env` and fill in `OPENAI_API_KEY`.

2. Build and run with Docker Compose (added service `langchain-rag`):

```bash
docker compose up --build langchain-rag
```

3. Endpoints:

- `POST /ingest` — multipart/form-data: `text` or `file` (PDF/TXT). Ingests text into Chroma as embeddings.
- `POST /qa` — form fields: `question`, optional `collection_name`, `top_k`. Returns an answer and source metadata.
- `GET /health` — simple health check.

Limitations / Next steps:

- This minimal service uses OpenAI for embeddings and chat completions. You can swap in other models or local LLMs.
- Add PDF/OCR improvements, more robust chunking, metadata, and moderation as needed.
