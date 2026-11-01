# Project Architecture & Overview

This directory contains the core source code for the **AI Resume Ranking & Explainable ATS** platform.

For the full system guide, benchmarking results, and architecture diagrams, please refer to the root [**README.md**](../README.md).

---

## Directory Structure

```
Project/
├── backend/                  # FastAPI Application & AI Scoring Engine
│   ├── main.py               # REST API endpoints & CORS middleware
│   ├── requirements.txt      # Python dependencies (FastAPI, Sentence-Transformers, Docx, PyPDF)
│   ├── Dockerfile            # Container deployment specification (Render/Railway/HF Spaces)
│   └── services/
│       ├── candidate.py      # Candidate name & metadata extraction
│       ├── extractor.py      # PDF, DOCX, DOC, and TXT parsing
│       ├── fairness.py       # Demographic neutrality & bias audit reporting
│       ├── scoring.py        # 4-pillar hybrid scoring engine & feedback generator
│       └── skills.py         # Technical skills taxonomy & alias dictionary
│
├── frontend/                 # Modern React 18 + Vite SaaS UI
│   ├── package.json          # Node scripts & dependencies (Lucide icons, React 18)
│   ├── vite.config.js        # Vite build & plugin configuration
│   ├── vercel.json           # Vercel SPA routing rewrite rules
│   ├── index.html            # Web entry point & Inter / JetBrains Mono typography
│   └── src/
│       ├── App.jsx           # Main state management & orchestration
│       ├── api.js            # API client with environment-aware endpoints
│       ├── tokens.css        # CSS custom properties (colors, typography, radii, spacing)
│       ├── styles.css        # Modern SaaS responsive component styles
│       └── components/       # Componentized presentation layer
│           ├── Header.jsx           # Slim navbar with brand & dark mode toggle
│           ├── UploadPanel.jsx      # JD document upload & resume multi-dropzone
│           ├── MetricsRow.jsx       # Top summary cards (Average score, Candidates, Top Pick)
│           ├── RankingChart.jsx     # Visual ranking bars with color-coded score bands
│           ├── CandidateCard.jsx    # Expandable candidate card with circular score gauge
│           ├── ScoreBreakdown.jsx   # 4-pillar stacked progress bars & weight legends
│           ├── ComparisonTable.jsx  # Side-by-side candidate comparison matrix
│           └── BiasWarning.jsx      # Non-intrusive fairness alert banner
│
└── examples/                 # Sample job descriptions and resumes for testing
    ├── fresher_jd.txt
    ├── fresher_resume.txt
    ├── sample_jd.txt
    └── sample_resume.txt
```

---

## Quick Start (Local Development)

### 1. Backend
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```
API: [http://127.0.0.1:8001](http://127.0.0.1:8001)  
Swagger Docs: [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs)

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
UI: [http://localhost:5173](http://localhost:5173)

---

## Deployment
- **Frontend**: One-click deployment to **Vercel** with root directory set to `Project/frontend`.
- **Backend**: Containerized deployment to **Render**, **Hugging Face Spaces**, or **Railway** using the included `Dockerfile`.
- See full instructions in [**docs/deployment.md**](../docs/deployment.md).
