import re

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

try:
    from sentence_transformers import SentenceTransformer, util
except ImportError:
    SentenceTransformer = None
    util = None


SEMANTIC_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
_semantic_model = None


def calculate_skill_score(resume_skills: list[str], jd_skills: list[str]) -> float:
    if not jd_skills:
        return 0.0

    matched = set(resume_skills).intersection(jd_skills)
    return round((len(matched) / len(jd_skills)) * 100, 2)


def calculate_semantic_score(resume_text: str, job_description: str) -> float:
    if not resume_text.strip() or not job_description.strip():
        return 0.0

    transformer_score = calculate_sentence_transformer_score(
        resume_text=resume_text,
        job_description=job_description,
    )

    if transformer_score is not None:
        return transformer_score

    return calculate_tfidf_score(resume_text, job_description)


def calculate_sentence_transformer_score(
    resume_text: str,
    job_description: str,
) -> float | None:
    model = get_semantic_model()

    if model is None or util is None:
        return None

    resume_embedding = model.encode(resume_text, convert_to_tensor=True)
    jd_embedding = model.encode(job_description, convert_to_tensor=True)
    score = util.cos_sim(resume_embedding, jd_embedding).item()
    return round(max(0.0, float(score)) * 100, 2)


def calculate_tfidf_score(resume_text: str, job_description: str) -> float:
    documents = [resume_text, job_description]
    matrix = TfidfVectorizer(stop_words="english").fit_transform(documents)
    score = cosine_similarity(matrix[0:1], matrix[1:2])[0][0]
    return round(float(score) * 100, 2)


def get_semantic_model():
    global _semantic_model

    if _semantic_model is not None:
        return _semantic_model

    if SentenceTransformer is None:
        return None

    try:
        _semantic_model = SentenceTransformer(SEMANTIC_MODEL_NAME)
    except Exception:
        return None

    return _semantic_model


def calculate_final_score(
    skill_score: float,
    semantic_score: float,
    project_score: float,
    experience_score: float,
) -> float:
    return round(
        (0.55 * skill_score)
        + (0.25 * semantic_score)
        + (0.10 * project_score)
        + (0.10 * experience_score),
        2,
    )


def rank_resumes(
    job_description: str,
    jd_skills: list[str],
    resumes: list[dict],
) -> list[dict]:
    scored = []

    for resume in resumes:
        resume_skills = resume["skills"]
        matched_skills = sorted(set(resume_skills).intersection(jd_skills))
        missing_skills = sorted(set(jd_skills).difference(resume_skills))
        skill_score = calculate_skill_score(resume_skills, jd_skills)
        semantic_score = calculate_semantic_score(resume["text"], job_description)
        project_analysis = analyze_project_relevance(
            resume["text"],
            job_description,
            jd_skills,
        )
        experience_analysis = analyze_experience_relevance(resume["text"], job_description)
        final_score = calculate_final_score(
            skill_score=skill_score,
            semantic_score=semantic_score,
            project_score=project_analysis["score"],
            experience_score=experience_analysis["score"],
        )
        candidate_summary = build_candidate_summary(
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            project_analysis=project_analysis,
            experience_analysis=experience_analysis,
            final_score=final_score,
        )

        scored.append(
            {
                "candidate_name": resume["candidate_name"],
                "file_name": resume["file_name"],
                "rank": 0,
                "final_score": final_score,
                "skill_match_score": skill_score,
                "semantic_similarity_score": semantic_score,
                "project_relevance_score": project_analysis["score"],
                "experience_relevance_score": experience_analysis["score"],
                "resume_skills": resume_skills,
                "matched_skills": matched_skills,
                "missing_skills": missing_skills,
                "candidate_summary": candidate_summary,
                "project_analysis": project_analysis,
                "experience_analysis": experience_analysis,
                "review_flag": build_review_flag(
                    final_score=final_score,
                    missing_skills=missing_skills,
                    jd_skills=jd_skills,
                ),
                "explanation": build_explanation(
                    matched_skills=matched_skills,
                    missing_skills=missing_skills,
                    skill_score=skill_score,
                    semantic_score=semantic_score,
                    project_score=project_analysis["score"],
                    experience_score=experience_analysis["score"],
                    final_score=final_score,
                ),
                "explanation_report": build_explanation_report(
                    matched_skills=matched_skills,
                    missing_skills=missing_skills,
                    resume_skills=resume_skills,
                    jd_skills=jd_skills,
                    skill_score=skill_score,
                    semantic_score=semantic_score,
                    project_analysis=project_analysis,
                    experience_analysis=experience_analysis,
                    candidate_summary=candidate_summary,
                    final_score=final_score,
                ),
            }
        )

    scored.sort(key=lambda item: item["final_score"], reverse=True)

    for index, item in enumerate(scored, start=1):
        item["rank"] = index

    return scored


def build_explanation(
    matched_skills: list[str],
    missing_skills: list[str],
    skill_score: float,
    semantic_score: float,
    project_score: float,
    experience_score: float,
    final_score: float,
) -> str:
    matched = ", ".join(matched_skills) if matched_skills else "no required skills"
    missing = ", ".join(missing_skills) if missing_skills else "no major required skills"

    return (
        f"The candidate matched {matched}. "
        f"Missing skills: {missing}. "
        f"Skill score is {skill_score}, semantic score is {semantic_score}, "
        f"project score is {project_score}, experience score is {experience_score}, "
        f"so the final weighted score is {final_score}."
    )


def build_explanation_report(
    matched_skills: list[str],
    missing_skills: list[str],
    resume_skills: list[str],
    jd_skills: list[str],
    skill_score: float,
    semantic_score: float,
    project_analysis: dict,
    experience_analysis: dict,
    candidate_summary: list[str],
    final_score: float,
) -> dict:
    strengths = build_strengths(
        matched_skills,
        skill_score,
        semantic_score,
        project_analysis,
        experience_analysis,
    )
    concerns = build_concerns(
        missing_skills,
        jd_skills,
        final_score,
        project_analysis,
        experience_analysis,
    )
    recommendation = build_recommendation(final_score, missing_skills, project_analysis)

    return {
        "summary": (
            "Final score uses 55% skill match, 25% semantic similarity, "
            "10% project relevance, and 10% experience relevance."
        ),
        "candidate_summary": candidate_summary,
        "strengths": strengths,
        "concerns": concerns,
        "recommendation": recommendation,
        "score_breakdown": {
            "skill_match": skill_score,
            "semantic_similarity": semantic_score,
            "project_relevance": project_analysis["score"],
            "experience_relevance": experience_analysis["score"],
            "final_score": final_score,
        },
        "matched_skill_count": len(matched_skills),
        "missing_skill_count": len(missing_skills),
        "resume_skill_count": len(resume_skills),
        "jd_skill_count": len(jd_skills),
    }


def build_strengths(
    matched_skills: list[str],
    skill_score: float,
    semantic_score: float,
    project_analysis: dict,
    experience_analysis: dict,
) -> list[str]:
    strengths = []

    if matched_skills:
        strengths.append(f"Matched required skills: {', '.join(matched_skills[:8])}.")

    if skill_score >= 75:
        strengths.append("Strong direct skill overlap with the job description.")
    elif skill_score >= 50:
        strengths.append("Moderate direct skill overlap with the job description.")

    if semantic_score >= 75:
        strengths.append("Resume meaning is highly similar to the job description.")
    elif semantic_score >= 55:
        strengths.append("Resume meaning has reasonable similarity to the job description.")

    if project_analysis["score"] >= 70:
        strengths.append(project_analysis["reason"])

    if experience_analysis["score"] >= 70:
        strengths.append(experience_analysis["reason"])

    return strengths or ["No major strengths were detected from the current skill list."]


def build_concerns(
    missing_skills: list[str],
    jd_skills: list[str],
    final_score: float,
    project_analysis: dict,
    experience_analysis: dict,
) -> list[str]:
    concerns = []

    if missing_skills:
        concerns.append(f"Missing required skills: {', '.join(missing_skills[:8])}.")

    if jd_skills and len(missing_skills) / len(jd_skills) >= 0.5:
        concerns.append("More than half of the detected JD skills are missing.")

    if final_score < 50:
        concerns.append("Overall match score is low and needs careful manual review.")

    if project_analysis["score"] < 40:
        concerns.append(project_analysis["reason"])

    if experience_analysis["score"] < 50:
        concerns.append(experience_analysis["reason"])

    return concerns or ["No major concerns were found from the detected skills."]


def build_recommendation(
    final_score: float,
    missing_skills: list[str],
    project_analysis: dict,
) -> str:
    if final_score >= 75 and len(missing_skills) <= 2:
        return "Strong match. Candidate can be shortlisted for the next round."

    if final_score >= 60 and project_analysis["score"] >= 75:
        return "Promising fresher profile. Relevant projects justify manual review or shortlisting."

    if final_score >= 50:
        return "Moderate match. Candidate should be manually reviewed before shortlisting."

    return "Weak match. Candidate may not fit unless missing skills are not mandatory."


def build_review_flag(
    final_score: float,
    missing_skills: list[str],
    jd_skills: list[str],
) -> dict:
    missing_ratio = len(missing_skills) / len(jd_skills) if jd_skills else 0

    if 45 <= final_score < 70:
        return {
            "level": "Manual Review",
            "reason": "Candidate is in the borderline score range.",
        }

    if missing_ratio >= 0.5:
        return {
            "level": "Manual Review",
            "reason": "Candidate is missing many required JD skills.",
        }

    if final_score >= 70:
        return {
            "level": "Good Match",
            "reason": "Candidate has a strong enough score for shortlisting.",
        }

    return {
        "level": "Weak Match",
        "reason": "Candidate has a low score against the current JD.",
    }


def analyze_project_relevance(
    resume_text: str,
    job_description: str,
    jd_skills: list[str],
) -> dict:
    project_text = extract_resume_section(
        resume_text,
        headers=("projects", "academic projects", "personal projects", "major projects"),
    )

    if not project_text:
        project_text = extract_project_sentences(resume_text)

    if not project_text:
        return {
            "score": 0.0,
            "reason": "No clear project section was detected in the resume.",
            "detected_project_text": "",
        }

    from services.skills import extract_resume_skills

    semantic_score = calculate_semantic_score(project_text, job_description)
    project_skills = extract_resume_skills(project_text)
    project_skill_score = calculate_skill_score(project_skills, jd_skills)
    score = round(max(semantic_score, project_skill_score), 2)

    if has_nlp_project_match(project_text, job_description):
        score = max(score, 80.0)

    if score >= 75:
        reason = "Projects are highly relevant to the job description."
    elif score >= 50:
        reason = "Projects show partial relevance to the job description."
    else:
        reason = "Projects do not strongly match the job description."

    return {
        "score": score,
        "reason": reason,
        "semantic_score": semantic_score,
        "project_skill_score": project_skill_score,
        "project_skills": project_skills,
        "detected_project_text": project_text[:500],
    }


def has_nlp_project_match(project_text: str, job_description: str) -> bool:
    jd = job_description.lower()
    project = project_text.lower()
    jd_mentions_nlp = "nlp" in jd or "natural language processing" in jd
    project_mentions_nlp = any(
        phrase in project
        for phrase in (
            "sentiment analysis",
            "text classification",
            "natural language processing",
            "nlp",
            "language model",
        )
    )
    return jd_mentions_nlp and project_mentions_nlp


def analyze_experience_relevance(resume_text: str, job_description: str) -> dict:
    required_months = extract_required_experience_months(job_description)
    candidate_months = extract_candidate_experience_months(resume_text)

    if required_months == 0:
        return {
            "score": 75.0,
            "required_months": 0,
            "candidate_months": candidate_months,
            "reason": "The JD does not clearly demand a minimum experience duration.",
        }

    if candidate_months == 0:
        return {
            "score": 20.0,
            "required_months": required_months,
            "candidate_months": 0,
            "reason": format_experience_reason(required_months, 0),
        }

    score = min(100.0, round((candidate_months / required_months) * 100, 2))

    return {
        "score": score,
        "required_months": required_months,
        "candidate_months": candidate_months,
        "reason": format_experience_reason(required_months, candidate_months),
    }


def extract_resume_section(text: str, headers: tuple[str, ...]) -> str:
    lines = [line.strip() for line in text.splitlines()]
    selected = []
    collecting = False
    section_header_pattern = re.compile(r"^[A-Z][A-Za-z /&-]{2,35}:?$")

    for line in lines:
        clean = line.strip().strip(":").lower()

        if clean in headers:
            collecting = True
            continue

        if collecting and section_header_pattern.match(line) and len(selected) >= 1:
            break

        if collecting and line:
            selected.append(line)

        if len(selected) >= 12:
            break

    return " ".join(selected).strip()


def extract_project_sentences(text: str) -> str:
    sentences = re.split(r"(?<=[.!?])\s+", text)
    project_words = ("project", "built", "developed", "created", "implemented", "model")
    selected = [
        sentence.strip()
        for sentence in sentences
        if any(word in sentence.lower() for word in project_words)
    ]
    return " ".join(selected[:5]).strip()


def extract_required_experience_months(job_description: str) -> int:
    text = job_description.lower()
    patterns = [
        r"(\d+(?:\.\d+)?)\+?\s*(?:years|year|yrs|yr)\s+(?:of\s+)?experience",
        r"(\d+(?:\.\d+)?)\+?\s*(?:years|year|yrs|yr).{0,40}experience",
        r"experience\s+(?:of\s+)?(\d+(?:\.\d+)?)\+?\s*(?:years|year|yrs|yr)",
        r"(\d+(?:\.\d+)?)\+?\s*(?:months|month|mos|mo)\s+(?:of\s+)?experience",
        r"(\d+(?:\.\d+)?)\+?\s*(?:months|month|mos|mo).{0,40}experience",
    ]

    return extract_max_months(text, patterns)


def extract_candidate_experience_months(resume_text: str) -> int:
    text = resume_text.lower()
    patterns = [
        r"(\d+(?:\.\d+)?)\+?\s*(?:years|year|yrs|yr)\s+(?:of\s+)?(?:experience|internship|training)",
        r"(?:experience|internship|training).{0,40}(\d+(?:\.\d+)?)\+?\s*(?:years|year|yrs|yr)",
        r"(?:experience|internship|training)\s+(?:of\s+)?(\d+(?:\.\d+)?)\+?\s*(?:years|year|yrs|yr)",
        r"(\d+(?:\.\d+)?)\+?\s*(?:months|month|mos|mo)\s+(?:of\s+)?(?:experience|internship|training)",
        r"(?:experience|internship|training).{0,40}(\d+(?:\.\d+)?)\+?\s*(?:months|month|mos|mo)",
        r"(?:experience|internship|training)\s+(?:of\s+)?(\d+(?:\.\d+)?)\+?\s*(?:months|month|mos|mo)",
    ]

    return extract_max_months(text, patterns)


def extract_max_months(text: str, patterns: list[str]) -> int:
    months = []

    for pattern in patterns:
        for match in re.finditer(pattern, text):
            value = float(match.group(1))
            unit_text = match.group(0)
            months.append(round(value if "month" in unit_text or "mo" in unit_text else value * 12))

    return max(months) if months else 0


def format_experience_reason(required_months: int, candidate_months: int) -> str:
    required = format_months(required_months)
    candidate = format_months(candidate_months)

    if candidate_months >= required_months:
        return f"Candidate experience ({candidate}) meets or exceeds the JD requirement ({required})."

    return f"Candidate experience ({candidate}) is below the JD requirement ({required})."


def format_months(months: int) -> str:
    if months == 0:
        return "not clearly detected"

    if months % 12 == 0:
        years = months // 12
        return f"{years} year{'s' if years != 1 else ''}"

    return f"{months} months"


def build_candidate_summary(
    matched_skills: list[str],
    missing_skills: list[str],
    project_analysis: dict,
    experience_analysis: dict,
    final_score: float,
) -> list[str]:
    summary = []

    if matched_skills:
        summary.append(f"Strong background in {', '.join(matched_skills[:4])}.")

    if missing_skills:
        summary.append(f"Lacks clear evidence of {', '.join(missing_skills[:3])}.")

    if project_analysis["score"] >= 70:
        summary.append("Projects are relevant to the role and should reduce unfair fresher rejection.")
    elif project_analysis["score"] > 0:
        summary.append("Projects show some role relevance but need manual review.")

    summary.append(experience_analysis["reason"])

    if final_score >= 75:
        summary.append("Suitable for shortlisting.")
    elif final_score >= 55:
        summary.append("Suitable for internship or manual review roles.")
    else:
        summary.append("Needs stronger evidence before shortlisting.")

    return summary
