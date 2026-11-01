import os
from typing import List

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from services.candidate import extract_candidate_name
from services.extractor import extract_text_from_upload
from services.fairness import build_fairness_report
from services.scoring import rank_resumes
from services.skills import extract_jd_skills, extract_resume_skills


app = FastAPI(title="AI Resume Ranking API")

# Allow localhost, Vercel preview/production domains, and custom env origins
origins = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
]
env_origins = os.getenv("ALLOWED_ORIGINS", "")
if env_origins:
    origins.extend([o.strip() for o in env_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if env_origins != "*" else ["*"],
    allow_origin_regex=r"https://.*\.vercel\.app" if env_origins != "*" else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "ok", "message": "Resume ranking API is running"}


@app.post("/extract-text")
async def extract_document_text(file: UploadFile = File(...)):
    text = await extract_text_from_upload(file)
    return {"filename": file.filename, "text": text}


@app.post("/rank-resumes")
async def rank_uploaded_resumes(
    job_description: str = Form(...),
    resumes: List[UploadFile] = File(...),
):
    jd_skills = extract_jd_skills(job_description)
    parsed_resumes = []

    for resume in resumes:
        resume_text = await extract_text_from_upload(resume)
        resume_skills = extract_resume_skills(resume_text)
        parsed_resumes.append(
            {
                "file_name": resume.filename,
                "candidate_name": extract_candidate_name(resume_text, resume.filename),
                "text": resume_text,
                "skills": resume_skills,
            }
        )

    ranked = rank_resumes(
        job_description=job_description,
        jd_skills=jd_skills,
        resumes=parsed_resumes,
    )

    return {
        "job_description_skills": jd_skills,
        "fairness_report": build_fairness_report(job_description),
        "results": ranked,
    }
