import re


SENSITIVE_TERMS = {
    "age",
    "gender",
    "male",
    "female",
    "married",
    "single",
    "religion",
    "caste",
    "race",
    "nationality",
    "photo",
}


def build_fairness_report(job_description: str) -> dict:
    normalized = job_description.lower()
    flagged_terms = sorted(
        term
        for term in SENSITIVE_TERMS
        if re.search(r"(?<![a-z0-9])" + re.escape(term) + r"(?![a-z0-9])", normalized)
    )

    if flagged_terms:
        message = (
            "The job description contains terms that may introduce hiring bias. "
            "Review these terms and make sure ranking is based only on job-related skills."
        )
    else:
        message = "No obvious sensitive terms were found in the job description."

    return {
        "flagged_terms": flagged_terms,
        "message": message,
    }
