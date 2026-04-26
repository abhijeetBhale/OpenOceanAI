# Render Deployment Guide: 2 Clients + 1 Backend

## Architecture Overview

```
Internet
   ↓
┌─────────────────────────────────────────┐
│  Render.com Services                    │
├─────────────────────────────────────────┤
│                                         │
│  Client 1 (rag-doc-client)              │
│  https://rag-doc-client.onrender.com    │
│           ↓                             │
│           ├──→ /api calls               │
│           ↓                             │
│  Backend (rag-doc-backend)              │
│  https://rag-doc-backend.onrender.com   │
│           ↓                             │
│           ├──→ MongoDB                  │
│           ├──→ ChromaDB                 │
│           └──→ External APIs            │
│           ↑                             │
│           │                             │
│  Client 2 (rag-doc-client2)             │
│  https://rag-doc-client2.onrender.com   │
│                                         │
└─────────────────────────────────────────┘
```

## Step-by-Step Deployment Instructions

### Phase 1: Prepare Your GitHub Repository

#### 1.1 Create a GitHub Repository
- Go to https://github.com/new
- Name it: `rag-doc-platform`
- Make it **Public** (Render's free tier requires this)
- Initialize with README (optional)
- Click "Create repository"

#### 1.2 Push Your Code to GitHub

```bash
cd C:\Users\LOQ\OneDrive\Desktop\Web Dev\AutoDocs\rag-doc-platform

git init
git add .
git commit -m "Initial commit: rag-doc-platform with 2 clients and backend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/rag-doc-platform.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Phase 2: Create Services on Render

#### Option A: Using render.yaml (Recommended - All 3 services at once)

1. Go to https://dashboard.render.com
2. Click "New +" → "Blueprint"
3. Connect your GitHub account if not already connected
4. Select your `rag-doc-platform` repository
5. Render will automatically detect `render.yaml`
6. Review the configuration
7. Click "Deploy"

Render will create 3 services:
- **rag-doc-backend** (Backend API)
- **rag-doc-client** (Client 1)
- **rag-doc-client2** (Client 2)

#### Option B: Manual Setup (If render.yaml doesn't work)

**Create Backend Service:**
1. Dashboard → "New +" → "Web Service"
2. Connect repository: `rag-doc-platform`
3. Name: `rag-doc-backend`
4. Environment: `Node`
5. Build Command: `cd server && npm ci`
6. Start Command: `cd server && npm start`
7. Environment Variables:
   ```
   NODE_ENV=production
   MONGO_URL=<your-mongodb-url>
   CHROMA_URL=<your-chromadb-url>
   GROQ_API_KEY=<your-key>
   JOOBLE_API_KEY=<your-key>
   JWT_SECRET=<your-secret>
   ```
8. Click "Create Web Service"

**Create Client 1 Service:**
1. Dashboard → "New +" → "Web Service"
2. Connect repository: `rag-doc-platform`
3. Name: `rag-doc-client`
4. Environment: `Node`
5. Build Command: `cd client && npm ci && npm run build`
6. Start Command: `cd client && npx serve -s dist -l 5173`
7. Environment Variables:
   ```
   VITE_API_URL=https://rag-doc-backend.onrender.com
   ```
8. Click "Create Web Service"

**Create Client 2 Service:**
1. Dashboard → "New +" → "Web Service"
2. Connect repository: `rag-doc-platform`
3. Name: `rag-doc-client2`
4. Environment: `Node`
5. Build Command: `cd client2 && npm ci && npm run build`
6. Start Command: `cd client2 && npx serve -s dist -l 5174`
7. Environment Variables:
   ```
   VITE_API_URL=https://rag-doc-backend.onrender.com
   ```
8. Click "Create Web Service"

### Phase 3: Configure Database & External Services

#### Add MongoDB Atlas (Free tier)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/rag-doc-platform`
4. Add to backend environment variable: `MONGO_URL`

#### Add ChromaDB (Option: Self-hosted or External)
- **Option 1:** Deploy ChromaDB separately on Render
- **Option 2:** Use hosted ChromaDB service
- Update `CHROMA_URL` in backend environment variables

### Phase 4: Verify Deployments

1. **Check Backend:**
   - Go to your backend URL
   - Visit `https://rag-doc-backend.onrender.com/health`
   - Should return `{"status":"ok"}`

2. **Check Client 1:**
   - Visit `https://rag-doc-client.onrender.com`
   - Should load React app
   - Open browser console → check Network tab
   - Verify `/api` calls go to backend URL

3. **Check Client 2:**
   - Visit `https://rag-doc-client2.onrender.com`
   - Should load React app
   - Check `/api` calls similarly

### Phase 5: Troubleshooting

If services fail to deploy:

1. **Check Logs:**
   - Go to service → "Logs" tab
   - Look for build or runtime errors

2. **Common Issues:**
   - Missing environment variables → Add them
   - Build timeout → Increase timeout in settings
   - Module not found → Ensure `package.json` and `package-lock.json` are in correct directories
   - Port already in use → Use different ports (vite defaults to 5173/5174)

3. **Rebuild:**
   - Push new commit to GitHub
   - Render auto-deploys on push
   - Or manually click "Deploy" in dashboard

## Important Notes

- **Free Tier Limits:** 
  - 750 free hours/month per service
  - Services spin down after 15 minutes of inactivity
  - Database must be paid or use MongoDB Atlas free tier

- **Custom Domains:**
  - Add custom domain in Service Settings
  - Update API URLs if using custom domains

- **GitHub Sync:**
  - Push changes to main branch
  - Render auto-rebuilds and deploys

- **Environment Variables:**
  - Keep secrets in Render dashboard, not in code
  - Never commit `.env` files

## URL References After Deployment

- Backend API: `https://rag-doc-backend.onrender.com`
- Client 1: `https://rag-doc-client.onrender.com`
- Client 2: `https://rag-doc-client2.onrender.com`

(URLs will be auto-generated or use custom domains)
