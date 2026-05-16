from typing import List

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from services.candidate import extract_candidate_name
from services.extractor import extract_text_from_upload
from services.fairness import build_fairness_report
from services.scoring import rank_resumes
from services.skills import extract_jd_skills, extract_resume_skills


app = FastAPI(title="AI Resume Ranking API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "ok", "message": "Resume ranking API is running"}


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
