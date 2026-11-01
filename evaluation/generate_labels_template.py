import argparse
import csv
from pathlib import Path


def resolve_default_path(path_str: str) -> Path:
    p = Path(path_str)
    if p.exists():
        return p
    # If run from repo root, check under evaluation/
    eval_p = Path("evaluation") / path_str
    if eval_p.exists():
        return eval_p
    return p


def generate_template(
    jds_dir: str | Path = "data/jds",
    resumes_dir: str | Path = "data/resumes",
    output_csv: str | Path = "data/labels.csv",
) -> int:
    """
    Generates a blank labels.csv template with columns (jd_id, resume_id, relevance)
    for every (JD, Resume) pair found in the given directories.
    """
    jds_path = resolve_default_path(str(jds_dir))
    resumes_path = resolve_default_path(str(resumes_dir))
    output_path = Path(output_csv)
    if not output_path.is_absolute() and not output_path.parent.exists():
        eval_output = Path("evaluation") / output_csv
        if eval_output.parent.exists():
            output_path = eval_output

    if not jds_path.exists():
        print(f"[ERROR] JDs directory not found: {jds_path}")
        return 1

    if not resumes_path.exists():
        print(f"[ERROR] Resumes directory not found: {resumes_path}")
        return 1

    jd_files = sorted(
        [f for f in jds_path.iterdir() if f.is_file() and f.suffix.lower() == ".txt"]
    )
    resume_files = sorted(
        [
            f
            for f in resumes_path.iterdir()
            if f.is_file() and f.suffix.lower() in (".txt", ".pdf")
        ]
    )

    if not jd_files:
        print(f"[WARN] No .txt files found in {jds_path}.")
    if not resume_files:
        print(f"[WARN] No .txt or .pdf files found in {resumes_path}.")

    output_path.parent.mkdir(parents=True, exist_ok=True)

    rows = []
    for jd_file in jd_files:
        jd_id = jd_file.stem
        for resume_file in resume_files:
            resume_id = resume_file.name
            rows.append({"jd_id": jd_id, "resume_id": resume_id, "relevance": ""})

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["jd_id", "resume_id", "relevance"])
        writer.writeheader()
        writer.writerows(rows)

    print(
        f"[SUCCESS] Wrote {len(rows)} candidate pair rows to: {output_path.resolve()}\n"
        f"          Next steps: open the file and annotate 'relevance' (0: Irrelevant, 1: Weak, 2: Relevant, 3: Highly Relevant)."
    )
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate a blank labels.csv template from JD and Resume folders."
    )
    parser.add_argument(
        "--jds-dir",
        default="data/jds",
        help="Path to folder containing job descriptions (.txt)",
    )
    parser.add_argument(
        "--resumes-dir",
        default="data/resumes",
        help="Path to folder containing resumes (.txt or .pdf)",
    )
    parser.add_argument(
        "--output-csv",
        default="data/labels.csv",
        help="Output CSV path for labels template",
    )
    args = parser.parse_args()

    raise SystemExit(
        generate_template(
            jds_dir=args.jds_dir,
            resumes_dir=args.resumes_dir,
            output_csv=args.output_csv,
        )
    )
