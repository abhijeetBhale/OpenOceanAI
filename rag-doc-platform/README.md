# RAG Doc Platform

This repository contains a small RAG (Retrieval-Augmented Generation) document platform with a React (Vite) frontend, Node/Express backend, MongoDB, and ChromaDB for vector storage. The project can be run locally (Dev) or with Docker Compose (recommended).

**Quick overview**

- Frontend: [client](client) (Vite + React)
- Backend: [server](server) (Node.js, Express)
- DB: MongoDB (container via Docker Compose)
- Vector DB: ChromaDB (container via Docker Compose)
- Reverse proxy: Nginx (optional via Docker Compose)

---

**Prerequisites**

- Git
- Node.js 18+ / 20+ and npm
- Docker & Docker Compose (recommended for full stack)

---

**Files you will edit**

- Server environment: [server/.env](server/.env) (do NOT commit this file)
- Client environment: [client/.env](client/.env)
- Nginx SSL directory: `nginx/ssl` — place TLS cert/key here when enabling HTTPS
- Uploads directory (runtime): `server/uploads` — store uploaded documents here
- OCR language data: [server/eng.traineddata](server/eng.traineddata) (already included)

---

Getting started (recommended: Docker Compose)

1. Clone the repo

```bash
git clone <REPO_URL>
cd rag-doc-platform
```

2. Copy and edit environment templates

Windows PowerShell:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

macOS / Linux:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Open `server/.env` and `client/.env` and fill in the values (API keys, email creds, etc.). Do NOT share or commit real secrets.

3. Start everything with Docker Compose (recommended)

```bash
# If you have the newer Docker CLI
docker compose up --build

# Or the legacy command
docker-compose up --build
```

This will start MongoDB, ChromaDB, the frontend (Vite), backend, and an Nginx proxy. The backend uses `server/.env` (via `env_file`) so make sure that file exists.

After startup:

- Frontend (dev): http://localhost:5173
- Backend API: http://localhost:5000 (health: `http://localhost:5000/health`)
- App (if Nginx is used without SSL): http://localhost

If you added a second frontend (`client2`) for a friend, it will be available alongside the main frontend:

- Friend frontend (dev): http://localhost:5174

4. Stop services

```bash
docker compose down
```

---

Running locally without Docker (development)

If you prefer to run the frontend and backend directly on your machine (you still need MongoDB and ChromaDB running):

1. Start MongoDB and ChromaDB (recommended via Docker)

```bash
# run MongoDB
docker run -d --name rag-mongo -p 27017:27017 -e MONGO_INITDB_DATABASE=rag-doc-platform -v mongo-data:/data/db mongo:7.0

# run ChromaDB
docker run -d --name rag-chromadb -p 8000:8000 chromadb/chroma:latest
```

2. Backend

```bash
cd server
npm install
# start in watch/dev mode
npm run dev
```

Backend will run on the port set in `server/.env` (`PORT`, default 5000).

3. Frontend

```bash
cd client
npm install
npm run dev
```

By default the frontend expects the API at `VITE_API_BASE` (see [client/.env.example](client/.env.example)). If you run backend on `http://localhost:5000`, set `VITE_API_BASE=http://localhost:5000/api` in `client/.env`.

To run the second frontend locally (dev) use:

```bash
cd client2
npm install
npm run dev
```

By default `client2` runs on port `5174` and uses `client2/.env.example` for `VITE_API_BASE`.

Health-check the backend:

```bash
curl http://localhost:5000/health
```

---

Environment variables (what to add and where)

Server environment — create and edit [server/.env](server/.env) (see [server/.env.example](server/.env.example)):

- `GROQ_API_KEY` — API key for Groq/Grok (used for LLM calls in this project)
- `JOOBLE_API_KEY` — (optional) Jooble jobs API key used for job search feature
- `PORT` — backend port (default `5000`)
- `CHROMA_URL` — ChromaDB URL (Docker compose uses `http://chromadb:8000`)
- `MONGO_URL` — MongoDB connection string
- `JWT_SECRET` — a long random string used to sign JWT tokens
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_FROM` — optional SMTP settings (for email verification)
- `FRONTEND_URL` — frontend base URL used when generating shareable links (default `http://localhost:5173`)

Client environment — create and edit [client/.env](client/.env) (see [client/.env.example](client/.env.example)):

- `VITE_API_BASE` — base API path (e.g. `http://localhost:5000/api` or `/api` if using the Nginx proxy)

Important: Never commit files that contain secrets. Add them to `.gitignore` (this repo includes a basic `.gitignore`).

---

Where to place files

- Put SSL certificate and key files in `nginx/ssl` if you want HTTPS with the provided Nginx config. Nginx expects `cert.pem` and `key.pem` (see `client/nginx.conf`). Example filenames inside the repo:
  - `nginx/ssl/cert.pem`
  - `nginx/ssl/key.pem`

- Uploaded documents are stored at `server/uploads` at runtime. Create the directory if missing:

```bash
mkdir -p server/uploads
```

- `server/eng.traineddata` is used by OCR (Tesseract) and is already included in the repo.

---

Troubleshooting & tips

- If you see errors connecting to MongoDB when running locally, verify `MONGO_URL` and that MongoDB is running on that host/port.
- If using Docker Compose and you change `server/.env`, restart the backend container: `docker compose up -d --build backend`.
- To view backend logs:

```bash
docker compose logs -f backend
```

---

Security notes

- Do NOT commit real API keys, credentials, or `.env` files to public repos. Use `.env.example` as a template only.
- Use a long, random `JWT_SECRET` in production.

---

Helpful commands (summary)

- Clone: `git clone <REPO_URL>`
- Start full stack (Docker): `docker compose up --build`
- Stop: `docker compose down`
- Backend dev: `cd server && npm install && npm run dev`
- Frontend dev: `cd client && npm install && npm run dev`

---

If you want, I can also:

- run the repo locally (install deps and start services)
- add a `.env` checklist in the root or CI notes

Enjoy — share this README with your friends so they can follow the exact commands above.
