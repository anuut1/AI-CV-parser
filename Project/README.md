AI Resume Ranking & Explainable ATS System
An AI-powered resume screening system that compares candidate resumes with a job description and ranks candidates using skill matching, semantic similarity, project relevance, and experience relevance.

The goal of this project is to improve traditional ATS screening by making the ranking process more explainable and fairer for students and freshers, especially when relevant projects can compensate for lower formal work experience.

Scoring Formula
Final Score =
0.55 * Skill Match Score
+ 0.25 * Semantic Similarity Score
+ 0.10 * Project Relevance Score
+ 0.10 * Experience Relevance Score
Score Meaning
Skill Match Score: Measures direct overlap between JD skills and resume skills.
Semantic Similarity Score: Measures meaning-level similarity between resume and JD using Sentence Transformers.
Project Relevance Score: Checks whether student/fresher projects match the role.
Experience Relevance Score: Compares required experience in the JD with detected resume experience.

Open a terminal in the project root:

cd backend
python -m venv .venv
Activate the virtual environment on Windows:

.venv\Scripts\activate
Install dependencies:

pip install -r requirements.txt
Run the backend:

uvicorn main:app --host 127.0.0.1 --port 8001
Backend URL:

http://127.0.0.1:8001
API docs:

http://127.0.0.1:8001/docs
Frontend Setup
Open another terminal in the project root:

cd frontend
npm install
npm run dev
Frontend URL:

http://127.0.0.1:5173

Why This Project Is Useful
Traditional ATS systems often reject freshers because they focus heavily on exact keywords or years of experience. This project adds:
semantic matching
project relevance
explainable scoring
manual review flags
This makes the screening process more transparent and suitable for student/internship hiring.


