# Deployment Guide: Vercel + Cloud Backend

This guide walks you through deploying the **AI Resume Ranking & Explainable ATS** system to production.

---

## Architecture Overview

```
+------------------------------------+          +------------------------------------+
|         Vercel (Frontend)          |  HTTPS   |     Render / Hugging Face /        |
|  - React 18 + Vite SPA             | -------> |     Railway (FastAPI Backend)      |
|  - Global Edge CDN                 |   REST   |  - Sentence Transformers (PyTorch) |
|  - Fast asset delivery             |          |  - Document text extraction        |
+------------------------------------+          +------------------------------------+
```

### Why Split Frontend and Backend?
- **Vercel** is the industry standard for hosting React/Vite frontends with instant deployments and global edge distribution.
- However, Vercel Serverless Functions enforce a **250 MB uncompressed limit**. Machine learning dependencies (`torch`, `sentence-transformers`, `transformers`, and tokenizer caches) exceed **1.5 GB**, which exceeds Vercel's serverless bundle limit.
- **The recommended production pattern**:
  - Deploy the **React frontend** to **Vercel**.
  - Deploy the **FastAPI ML backend** to a free container host (**Render**, **Hugging Face Spaces**, or **Railway**).

---

## Step 1: Deploy Backend (Render / Hugging Face / Railway)

### Option A: Render (Free & Simplest)

1. Sign up or log into [Render.com](https://render.com).
2. Click **New +** &rarr; **Web Service**.
3. Connect your GitHub repository: `https://github.com/anuut1/AI-CV-parser`.
4. Configure the service settings:
   - **Name**: `ai-cv-parser-backend`
   - **Root Directory**: `Project/backend`
   - **Runtime**: `Python 3` (or choose `Docker` to use the included `Dockerfile`)
   - **Build Command**:
     ```bash
     pip install torch --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type**: `Free`
5. Click **Create Web Service**.
6. Once deployed, copy your backend URL (e.g. `https://ai-cv-parser-backend.onrender.com`).

---

### Option B: Hugging Face Spaces (Free 16 GB RAM + 2 vCPU)

1. Create a new Space on [huggingface.co/spaces](https://huggingface.co/spaces).
2. Choose **Docker** &rarr; **Blank**.
3. Push the contents of `Project/backend/` (including `Dockerfile` and `requirements.txt`).
4. Hugging Face will automatically build and expose the FastAPI endpoints.

---

## Step 2: Deploy Frontend on Vercel

### Method 1: Using the Vercel Dashboard (Recommended)

1. Log into your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** &rarr; **Project**.
3. Select your GitHub repository: `AI-CV-parser`.
4. In the configuration screen, configure:
   - **Project Name**: `ai-cv-parser` (or your preferred name)
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select `Project/frontend`
5. Expand **Environment Variables** and add:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: Your deployed backend URL (e.g., `https://ai-cv-parser-backend.onrender.com` without trailing slash)
6. Click **Deploy**.

Vercel will build and deploy your application. You will receive a live URL (e.g. `https://ai-cv-parser.vercel.app`).

---

### Method 2: Using the Vercel CLI

1. Install the Vercel CLI globally (if not already installed):
   ```bash
   npm install -g vercel
   ```
2. Navigate to the frontend directory:
   ```bash
   cd Project/frontend
   ```
3. Run:
   ```bash
   vercel
   ```
4. Follow the interactive prompts:
   - Set up and deploy: **Yes**
   - Which scope: Select your personal account or team
   - Link to existing project: **No**
   - Project name: `ai-cv-parser`
   - Directory located: `./`
   - Want to modify settings: **No**
5. For production deployment:
   ```bash
   vercel --prod
   ```

---

## Step 3: Verify Integration

1. Open your live Vercel frontend URL.
2. Click **"Load sample data"** to test UI rendering.
3. Upload a sample Job Description and Resume (`.pdf` or `.docx`).
4. Click **"Rank candidates"** and confirm results load seamlessly.
5. If you encounter network errors:
   - Confirm `VITE_API_BASE_URL` in Vercel project settings matches your backend URL.
   - Confirm backend health check responds at `https://<YOUR-BACKEND-URL>/`.
