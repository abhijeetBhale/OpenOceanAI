import os
import uuid
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import openai
import httpx
import logging
import chromadb
from chromadb.config import Settings
from pypdf import PdfReader

app = FastAPI(title="LangChain-style RAG (FastAPI)")

EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL", "text-embedding-3-small")
CHAT_MODEL = os.environ.get("CHAT_MODEL", "gpt-3.5-turbo")
CHROMA_HOST = os.environ.get("CHROMA_HOST", "chromadb")
CHROMA_PORT = int(os.environ.get("CHROMA_PORT", 8000))
DEFAULT_COLLECTION = os.environ.get("COLLECTION_NAME", "documents")

# Support OpenAI or GROQ (Groq exposes an OpenAI-compatible endpoint)
OPENAI_KEY = os.environ.get("OPENAI_API_KEY")
GROQ_KEY = os.environ.get("GROQ_API_KEY")
OPENAI_API_BASE = os.environ.get("OPENAI_API_BASE")

logger = logging.getLogger("uvicorn.error")
logging.basicConfig(level=logging.DEBUG)
logger.setLevel(logging.DEBUG)

# Configure openai globals if present; prefer explicit client creation below
if GROQ_KEY:
    openai.api_key = GROQ_KEY
    # Groq's OpenAI-compatible base URL
    openai.api_base = os.environ.get("GROQ_API_BASE", "https://api.groq.com/openai/v1")
elif OPENAI_KEY:
    openai.api_key = OPENAI_KEY
    if OPENAI_API_BASE:
        openai.api_base = OPENAI_API_BASE
else:
    # leave unset; calls will fail without a key
    openai.api_key = None


def get_openai_client():
    """Attempt to create and return a modern OpenAI client (openai.OpenAI).
    Falls back to None if creation fails. This avoids relying on the
    legacy `openai.Embedding` API when the installed package is >=1.0.0.
    """
    key = GROQ_KEY or OPENAI_KEY
    # prefer explicit GROQ base when GROQ key is used
    base = os.environ.get("GROQ_API_BASE") if GROQ_KEY else (OPENAI_API_BASE or None)

    if not key:
        logger.debug("No OpenAI/Groq API key configured for python-rag.")
        return None

    # Set environment variables so the modern client can pick them up
    try:
        os.environ.setdefault("OPENAI_API_KEY", key)
        if base:
            os.environ.setdefault("OPENAI_API_BASE", base)
    except Exception:
        # non-fatal; continue to attempt client creation
        pass

    try:
        if hasattr(openai, "OpenAI"):
            # Try explicit instantiation with api_key/api_base first (works when supported)
            try:
                if base:
                    client = openai.OpenAI(api_key=key, api_base=base)
                else:
                    client = openai.OpenAI(api_key=key)
                logger.debug("Created modern OpenAI client instance (explicit args).")
                return client
            except TypeError:
                # Some versions may not accept api_key/api_base kwargs; fall back to env-var based instantiation
                client = openai.OpenAI()
                logger.debug("Created modern OpenAI client instance (env-based fallback).")
                return client
    except Exception as e:
        logger.exception("Failed to instantiate OpenAI client: %s", e)

    return None


def get_openai_client_for_openai_key():
    """Create a modern OpenAI client explicitly using the `OPENAI_API_KEY`.
    This avoids accidentally reusing `GROQ_API_KEY` when both keys are present.
    Returns a client instance or None on failure.
    """
    if not OPENAI_KEY:
        return None
    try:
        if hasattr(openai, "OpenAI"):
            try:
                if OPENAI_API_BASE:
                    client = openai.OpenAI(api_key=OPENAI_KEY, api_base=OPENAI_API_BASE)
                else:
                    client = openai.OpenAI(api_key=OPENAI_KEY)
                logger.debug("Created explicit OpenAI client instance using OPENAI_API_KEY.")
                return client
            except TypeError:
                # Some client versions require env-based config; temporarily set env then instantiate
                prev_key = os.environ.get("OPENAI_API_KEY")
                prev_base = os.environ.get("OPENAI_API_BASE")
                try:
                    os.environ["OPENAI_API_KEY"] = OPENAI_KEY
                    if OPENAI_API_BASE:
                        os.environ["OPENAI_API_BASE"] = OPENAI_API_BASE
                    client = openai.OpenAI()
                    logger.debug("Created explicit OpenAI client instance via env fallback.")
                    return client
                finally:
                    if prev_key is None:
                        os.environ.pop("OPENAI_API_KEY", None)
                    else:
                        os.environ["OPENAI_API_KEY"] = prev_key
                    if prev_base is None:
                        os.environ.pop("OPENAI_API_BASE", None)
                    else:
                        os.environ["OPENAI_API_BASE"] = prev_base
    except Exception as e:
        logger.exception("Failed to instantiate explicit OpenAI client: %s", e)
    return None

# Create an OpenAI client (may be None if instantiation fails)
openai_client = get_openai_client()


def get_chroma_client():
    return chromadb.Client(Settings(chroma_api_impl="rest", chroma_server_host=CHROMA_HOST, chroma_server_http_port=CHROMA_PORT))


async def groq_embeddings(inputs):
    """Call Groq/OpenAI-compatible embeddings endpoint directly using HTTP.
    `inputs` may be a single string or a list of strings.
    Returns a list of embedding vectors.
    """
    base = os.environ.get("GROQ_API_BASE", "https://api.groq.com/openai/v1").rstrip("/")
    url = f"{base}/embeddings"
    headers = {"Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"}
    payload = {"model": EMBEDDING_MODEL, "input": inputs}
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json=payload, headers=headers, timeout=30.0)
    if resp.status_code != 200:
        raise Exception(f"Groq Embedding Error: {resp.status_code} - {resp.text}")
    data = resp.json()
    out = []
    for d in data.get("data", []):
        if isinstance(d, dict):
            out.append(d.get("embedding"))
        else:
            out.append(None)
    return out


async def groq_chat_completion(messages):
    """Call Groq/OpenAI-compatible chat completions endpoint directly using HTTP.
    `messages` should be a list of {role, content} dicts.
    Returns the assistant content string.
    """
    base = os.environ.get("GROQ_API_BASE", "https://api.groq.com/openai/v1").rstrip("/")
    url = f"{base}/chat/completions"
    headers = {"Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": CHAT_MODEL,
        "messages": messages,
        "temperature": 0.0,
        "max_tokens": 512,
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json=payload, headers=headers, timeout=60.0)
    if resp.status_code != 200:
        raise Exception(f"Groq Chat Error: {resp.status_code} - {resp.text}")
    data = resp.json()
    # try common response shapes
    try:
        return data["choices"][0]["message"]["content"]
    except Exception:
        try:
            return data["choices"][0]["text"]
        except Exception:
            raise Exception(f"Unexpected Groq chat response: {data}")


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200):
    text = text.strip()
    if not text:
        return []
    if len(text) <= chunk_size:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks


@app.post("/ingest")
async def ingest(text: Optional[str] = Form(None), file: Optional[UploadFile] = File(None), collection_name: str = Form(DEFAULT_COLLECTION)):
    """Ingest plain text or an uploaded PDF/TXT into ChromaDB (chunk -> embed -> add)."""
    if not text and not file:
        raise HTTPException(status_code=400, detail="Provide 'text' or upload a file")

    if file:
        filename = file.filename or "uploaded"
        if filename.lower().endswith(".pdf"):
            try:
                reader = PdfReader(file.file)
                text = "\n\n".join([page.extract_text() or "" for page in reader.pages])
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"PDF parse error: {e}")
        else:
            raw = await file.read()
            try:
                text = raw.decode("utf-8")
            except Exception:
                text = raw.decode("latin-1", errors="ignore")

    chunks = chunk_text(text)
    if not chunks:
        raise HTTPException(status_code=400, detail="No text extracted from input")

    # Embeddings
    try:
        if GROQ_KEY:
            # Call Groq directly via HTTP to avoid routing to api.openai.com
            try:
                embeddings = await groq_embeddings(chunks)
            except Exception as e:
                # If Groq reports the model is not available, and an OpenAI key exists,
                # try falling back to the OpenAI client.
                msg = str(e)
                logger.warning("Groq embeddings failed: %s", msg)
                logger.debug("Fallback check: OPENAI_KEY_set=%s model_not_found_in_msg=%s", bool(OPENAI_KEY), "model_not_found" in msg)
                if OPENAI_KEY and "model_not_found" in msg:
                    logger.info("Falling back to OpenAI API for embeddings because GROQ model unavailable")
                    client = get_openai_client_for_openai_key() or openai_client or get_openai_client()
                    if client:
                        emb_resp = client.embeddings.create(model=EMBEDDING_MODEL, input=chunks)
                        embeddings = []
                        data_list = getattr(emb_resp, "data", None) or (emb_resp.get("data") if isinstance(emb_resp, dict) else None)
                        if data_list is None:
                            raise Exception("Unexpected embeddings response structure from OpenAI client")
                        for d in data_list:
                            if hasattr(d, "embedding"):
                                embeddings.append(d.embedding)
                            elif isinstance(d, dict) and "embedding" in d:
                                embeddings.append(d["embedding"])
                            else:
                                embeddings.append(None)
                    else:
                        if hasattr(openai, "Embedding"):
                            emb_resp = openai.Embedding.create(model=EMBEDDING_MODEL, input=chunks)
                            embeddings = [d["embedding"] for d in emb_resp["data"]]
                        else:
                            raise HTTPException(status_code=500, detail=("OpenAI client unavailable and legacy Embedding API not present. "
                                                                         "Install a compatible openai-python client or pin to openai==0.28."))
                else:
                    raise
        else:
            client = openai_client or get_openai_client()
            logger.debug("ingest: openai_client present=%s openai.api_base=%s OPENAI_API_BASE=%s GROQ_API_BASE=%s GROQ_KEY_set=%s",
                         bool(client), getattr(openai, "api_base", None), os.environ.get("OPENAI_API_BASE"), os.environ.get("GROQ_API_BASE"), bool(GROQ_KEY))
            if client:
                emb_resp = client.embeddings.create(model=EMBEDDING_MODEL, input=chunks)
                embeddings = []
                data_list = getattr(emb_resp, "data", None) or (emb_resp.get("data") if isinstance(emb_resp, dict) else None)
                if data_list is None:
                    # handle unexpected response shape
                    raise Exception("Unexpected embeddings response structure")
                for d in data_list:
                    if hasattr(d, "embedding"):
                        embeddings.append(d.embedding)
                    elif isinstance(d, dict) and "embedding" in d:
                        embeddings.append(d["embedding"])
                    else:
                        embeddings.append(None)
            else:
                # Legacy fallback only if the old API is available
                if hasattr(openai, "Embedding"):
                    emb_resp = openai.Embedding.create(model=EMBEDDING_MODEL, input=chunks)
                    embeddings = [d["embedding"] for d in emb_resp["data"]]
                else:
                    raise HTTPException(status_code=500, detail=("OpenAI client unavailable and legacy Embedding API not present. "
                                                                 "Install a compatible openai-python client or pin to openai==0.28."))
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Embedding call failed")
        raise HTTPException(status_code=500, detail=f"Embedding error: {e}")

    # Chroma client
    chroma = get_chroma_client()
    try:
        collection = chroma.get_collection(name=collection_name)
    except Exception:
        collection = chroma.create_collection(name=collection_name)

    ids = [str(uuid.uuid4()) for _ in chunks]
    metadatas = [{"source": file.filename if file else "text_input"} for _ in chunks]
    try:
        collection.add(ids=ids, documents=chunks, embeddings=embeddings, metadatas=metadatas)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chroma add error: {e}")

    return {"inserted": len(ids), "collection": collection_name}


@app.post("/qa")
async def qa(question: str = Form(...), collection_name: str = Form(DEFAULT_COLLECTION), top_k: int = Form(4)):
    """Run a simple retrieval + chat completion flow: embed query -> retrieve -> prompt LLM."""
    if not question:
        raise HTTPException(status_code=400, detail="Question is required")

    try:
        if GROQ_KEY:
            try:
                q_embs = await groq_embeddings([question])
                q_emb = q_embs[0] if q_embs else None
            except Exception as e:
                msg = str(e)
                logger.warning("Groq QA embedding failed: %s", msg)
                if OPENAI_KEY and "model_not_found" in msg:
                    logger.info("Falling back to OpenAI API for QA embedding because GROQ model unavailable")
                    client = get_openai_client_for_openai_key() or openai_client or get_openai_client()
                    if client:
                        q_emb_resp = client.embeddings.create(model=EMBEDDING_MODEL, input=question)
                        first = getattr(q_emb_resp, "data", None) or (q_emb_resp.get("data") if isinstance(q_emb_resp, dict) else None)
                        if not first:
                            raise Exception("Unexpected embedding response structure")
                        d0 = first[0]
                        if hasattr(d0, "embedding"):
                            q_emb = d0.embedding
                        elif isinstance(d0, dict) and "embedding" in d0:
                            q_emb = d0["embedding"]
                        else:
                            q_emb = None
                    else:
                        if hasattr(openai, "Embedding"):
                            q_emb_resp = openai.Embedding.create(model=EMBEDDING_MODEL, input=question)
                            q_emb = q_emb_resp["data"][0]["embedding"]
                        else:
                            raise HTTPException(status_code=500, detail=("OpenAI client unavailable and legacy Embedding API not present. "
                                                                         "Install a compatible openai-python client or pin to openai==0.28."))
                else:
                    raise
        else:
            client = openai_client or get_openai_client()
            logger.debug("qa: openai_client present=%s openai.api_base=%s OPENAI_API_BASE=%s GROQ_API_BASE=%s GROQ_KEY_set=%s",
                         bool(client), getattr(openai, "api_base", None), os.environ.get("OPENAI_API_BASE"), os.environ.get("GROQ_API_BASE"), bool(GROQ_KEY))
            if client:
                q_emb_resp = client.embeddings.create(model=EMBEDDING_MODEL, input=question)
                first = getattr(q_emb_resp, "data", None) or (q_emb_resp.get("data") if isinstance(q_emb_resp, dict) else None)
                if not first:
                    raise Exception("Unexpected embedding response structure")
                d0 = first[0]
                if hasattr(d0, "embedding"):
                    q_emb = d0.embedding
                elif isinstance(d0, dict) and "embedding" in d0:
                    q_emb = d0["embedding"]
                else:
                    q_emb = None
            else:
                if hasattr(openai, "Embedding"):
                    q_emb_resp = openai.Embedding.create(model=EMBEDDING_MODEL, input=question)
                    q_emb = q_emb_resp["data"][0]["embedding"]
                else:
                    raise HTTPException(status_code=500, detail=("OpenAI client unavailable and legacy Embedding API not present. "
                                                                 "Install a compatible openai-python client or pin to openai==0.28."))
        if q_emb is None:
            raise HTTPException(status_code=500, detail="Failed to obtain embedding for question")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("QA embedding failed")
        raise HTTPException(status_code=500, detail=f"Embedding error: {e}")

    chroma = get_chroma_client()
    try:
        collection = chroma.get_collection(name=collection_name)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Collection not found: {collection_name}")

    try:
        results = collection.query(query_embeddings=[q_emb], n_results=top_k, include=["documents", "metadatas"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chroma query error: {e}")

    docs = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    context = "\n\n---\n\n".join(docs)
    prompt = f"Use the following context to answer the question. If the answer is not contained in the context, say you don't know.\n\nContext:\n{context}\n\nQuestion: {question}\nAnswer:"

    try:
        messages_for_chat = [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": prompt}]
        if GROQ_KEY:
            answer = await groq_chat_completion(messages_for_chat)
        else:
            client = openai_client or get_openai_client()
            logger.debug("chat: openai_client present=%s openai.api_base=%s OPENAI_API_BASE=%s GROQ_API_BASE=%s GROQ_KEY_set=%s",
                         bool(client), getattr(openai, "api_base", None), os.environ.get("OPENAI_API_BASE"), os.environ.get("GROQ_API_BASE"), bool(GROQ_KEY))
            if client:
                chat_resp = client.chat.completions.create(
                    model=CHAT_MODEL,
                    messages=messages_for_chat,
                    temperature=0.0,
                    max_tokens=512,
                )
                try:
                    answer = getattr(chat_resp.choices[0].message, "content", None)
                except Exception:
                    answer = chat_resp["choices"][0]["message"]["content"]
            else:
                if hasattr(openai, "ChatCompletion"):
                    chat_resp = openai.ChatCompletion.create(
                        model=CHAT_MODEL,
                        messages=messages_for_chat,
                        temperature=0.0,
                        max_tokens=512,
                    )
                    answer = chat_resp["choices"][0]["message"]["content"]
                else:
                    raise HTTPException(status_code=500, detail=("OpenAI client unavailable and legacy ChatCompletion API not present. "
                                                                 "Install a compatible openai-python client or pin to openai==0.28."))
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("LLM call failed")
        raise HTTPException(status_code=500, detail=f"LLM error: {e}")

    return {"answer": answer, "sources": metadatas}


@app.get("/health")
async def health():
    return {"status": "ok"}
