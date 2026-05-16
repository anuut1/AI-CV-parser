import re
from pathlib import Path


RESUME_SECTION_WORDS = {
    "resume",
    "curriculum",
    "vitae",
    "cv",
    "profile",
    "summary",
    "objective",
    "education",
    "experience",
    "skills",
    "projects",
    "certifications",
    "contact",
}


def extract_candidate_name(text: str, file_name: str) -> str:
    lines = [clean_line(line) for line in text.splitlines()]
    lines = [line for line in lines if line]

    for line in lines[:12]:
        explicit_name = extract_labeled_name(line)
        if explicit_name:
            return explicit_name

    for line in lines[:8]:
        if looks_like_person_name(line):
            return line

    return name_from_file(file_name)


def clean_line(line: str) -> str:
    line = re.sub(r"\s+", " ", line).strip()
    return line.strip("-_|•")


def extract_labeled_name(line: str) -> str | None:
    match = re.search(
        r"\b(?:name|candidate)\s*[:\-]\s*([a-zA-Z][a-zA-Z .'-]{2,60})",
        line,
        re.I,
    )

    if not match:
        return None

    candidate = clean_name(match.group(1))
    return candidate if looks_like_person_name(candidate) else None


def looks_like_person_name(line: str) -> bool:
    if len(line) < 3 or len(line) > 60:
        return False

    lowered = line.lower()

    if any(word in lowered.split() for word in RESUME_SECTION_WORDS):
        return False

    if re.search(r"[@:/\\0-9]", line):
        return False

    words = line.split()

    if not 2 <= len(words) <= 4:
        return False

    return all(re.fullmatch(r"[A-Z][a-zA-Z.'-]*", word) for word in words)


def name_from_file(file_name: str) -> str:
    stem = Path(file_name).stem
    stem = re.sub(r"(?i)\b(resume|cv|final|updated|latest)\b", " ", stem)
    stem = re.sub(r"[_\-]+", " ", stem)
    stem = re.sub(r"\s+", " ", stem).strip()

    if not stem:
        return file_name

    return clean_name(stem)


def clean_name(name: str) -> str:
    return " ".join(part.capitalize() for part in name.split())
