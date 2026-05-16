# AI Resume Ranking Starter

This project is a beginner-friendly resume ranking system. It compares one or more resumes against a job description and returns:

- extracted resume skills
- extracted JD skills
- matched and missing skills
- skill match score
- semantic similarity score
- final ranking score
- explainable report
- basic bias/fairness warning

## Project Structure

```text
backend/
  main.py              FastAPI app and API routes
  requirements.txt    Python dependencies
  services/
    extractor.py      PDF/text extraction
    skills.py         Skill extraction logic
    scoring.py        Score formula and ranking
    fairness.py       Basic fairness/bias checks

frontend/
  package.json
  index.html
  src/
    App.jsx           Upload page and dashboard
    api.js            Backend API call
    styles.css        UI styling
```

## How The System Works

1. The user uploads resumes and pastes a job description.
2. Backend extracts text from PDFs.
3. Backend extracts skills from resume text and JD text.
4. It compares resume skills with JD skills.
5. It calculates:
   - skill score: direct skill overlap
   - semantic score: Sentence Transformers similarity between resume and JD
   - final score: weighted combination
6. It ranks candidates from highest to lowest.
7. It returns an explainable report.
8. It checks for sensitive terms that should not influence hiring decisions.

## Score Formula

```text
final_score = 0.55 * skill_match_score
            + 0.25 * semantic_similarity_score
            + 0.10 * project_relevance_score
            + 0.10 * experience_relevance_score
```

This formula is friendlier for freshers because relevant projects can improve the score even when formal work experience is lower.

## Run Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at:

```text
http://127.0.0.1:8000
```

API docs:

```text
http://127.0.0.1:8000/docs
```

## Run Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://127.0.0.1:5173
```

## First Coding Order

Follow this order:

1. Backend PDF text extraction
2. Resume skill extraction
3. JD skill extraction
4. Skill matching score
5. Semantic similarity score
6. Final score formula
7. FastAPI route
8. React upload page
9. Result dashboard
10. Multiple resume ranking
11. Explainable AI report
12. Bias/fairness module

This starter includes a working version of every step. Skill extraction uses a normalized alias map, so terms like `React.js`, `sklearn`, `Python3`, `CI/CD`, and `problem-solving` are mapped to clean skill names. Semantic similarity uses `sentence-transformers/all-MiniLM-L6-v2`, with a TF-IDF fallback if the transformer model is unavailable.
