import re
from collections import OrderedDict


SKILL_ALIASES = OrderedDict(
    {
        "python": ["python", "python3"],
        "java": ["java", "core java", "java 8", "java 11", "java 17"],
        "javascript": ["javascript", "js", "ecmascript", "es6"],
        "typescript": ["typescript", "ts"],
        "react": ["react", "react.js", "reactjs"],
        "node.js": ["node", "node.js", "nodejs"],
        "express.js": ["express", "express.js"],
        "fastapi": ["fastapi", "fast api"],
        "django": ["django"],
        "flask": ["flask"],
        "html": ["html", "html5"],
        "css": ["css", "css3"],
        "tailwind css": ["tailwind", "tailwind css"],
        "sql": ["sql", "structured query language"],
        "mysql": ["mysql"],
        "postgresql": ["postgresql", "postgres"],
        "mongodb": ["mongodb", "mongo db"],
        "redis": ["redis"],
        "machine learning": ["machine learning", "ml"],
        "deep learning": ["deep learning", "dl"],
        "natural language processing": ["natural language processing", "nlp"],
        "data analysis": ["data analysis", "data analytics", "analytics"],
        "data visualization": ["data visualization", "data visualisation", "dashboarding"],
        "pandas": ["pandas"],
        "numpy": ["numpy"],
        "scikit-learn": ["scikit-learn", "sklearn", "scikit learn"],
        "tensorflow": ["tensorflow"],
        "pytorch": ["pytorch", "torch"],
        "sentence transformers": ["sentence transformers", "sentence-transformers"],
        "aws": ["aws", "amazon web services"],
        "azure": ["azure", "microsoft azure"],
        "google cloud": ["google cloud", "gcp"],
        "docker": ["docker", "containerization", "containerisation"],
        "kubernetes": ["kubernetes", "k8s"],
        "git": ["git", "github", "gitlab", "version control"],
        "ci/cd": ["ci/cd", "cicd", "continuous integration", "continuous deployment"],
        "rest api": ["rest api", "restful api", "rest APIs", "api development"],
        "graphql": ["graphql"],
        "microservices": ["microservices", "microservice architecture"],
        "agile": ["agile", "scrum"],
        "communication": ["communication", "verbal communication", "written communication"],
        "leadership": ["leadership", "team leadership", "mentoring"],
        "problem solving": ["problem solving", "problem-solving", "analytical thinking"],
        "teamwork": ["teamwork", "collaboration", "cross-functional"],
    }
)

SECTION_HEADERS = (
    "skills",
    "technical skills",
    "core skills",
    "tools",
    "technologies",
    "requirements",
    "qualifications",
    "preferred qualifications",
)


def normalize_text(text: str) -> str:
    lowered = text.lower()
    normalized = lowered.replace("c++", "cplusplus").replace("c#", "csharp")
    normalized = re.sub(r"[/|,;:()\[\]{}]", " ", normalized)
    normalized = re.sub(r"\s+", " ", normalized)
    return normalized.strip()


def extract_skills(text: str) -> list[str]:
    normalized = normalize_text(text)
    found = []

    for canonical_skill, aliases in SKILL_ALIASES.items():
        if any(has_alias(normalized, alias) for alias in aliases):
            found.append(canonical_skill)

    found.extend(extract_programming_language_symbols(text))
    return sorted(set(found))


def extract_resume_skills(text: str) -> list[str]:
    return extract_skills(text)


def extract_jd_skills(text: str) -> list[str]:
    return extract_skills(text)


def has_alias(text: str, alias: str) -> bool:
    normalized_alias = normalize_text(alias)
    pattern = r"(?<![a-z0-9+#.-])" + re.escape(normalized_alias) + r"(?![a-z0-9+#-])"
    return bool(re.search(pattern, text))


def extract_programming_language_symbols(text: str) -> list[str]:
    lowered = text.lower()
    found = []

    if re.search(r"(?<![a-z0-9])c\+\+(?![a-z0-9])", lowered):
        found.append("c++")

    if re.search(r"(?<![a-z0-9])c#(?![a-z0-9])", lowered):
        found.append("c#")

    return found


def extract_skill_sections(text: str) -> list[str]:
    sections = []
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    for index, line in enumerate(lines):
        normalized_line = normalize_text(line)
        if normalized_line in SECTION_HEADERS:
            section_lines = lines[index + 1 : index + 7]
            sections.append(" ".join(section_lines))

    return sections
