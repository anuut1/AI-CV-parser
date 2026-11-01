import argparse
import csv
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple

# Ensure repository root and Project/backend are in sys.path
root_path = Path(__file__).resolve().parent.parent
backend_path = root_path / "Project" / "backend"
if str(root_path) not in sys.path:
    sys.path.insert(0, str(root_path))
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

from services.scoring import calculate_tfidf_score, compute_component_scores
from evaluation.metrics import (
    ndcg_at_k,
    precision_at_k,
    reciprocal_rank,
    spearman_correlation,
)


STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
    "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't",
    "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have",
    "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself",
    "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into",
    "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
    "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our",
    "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's",
    "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs",
    "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
    "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't",
    "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's",
    "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't",
    "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself",
    "yourselves"
}


def compute_keyword_overlap(resume_text: str, jd_text: str) -> float:
    resume_tokens = set(re.findall(r"\b[a-z0-9+#.-]+\b", resume_text.lower()))
    jd_tokens = set(re.findall(r"\b[a-z0-9+#.-]+\b", jd_text.lower()))
    resume_tokens = {w for w in resume_tokens if w not in STOPWORDS and len(w) > 1}
    jd_tokens = {w for w in jd_tokens if w not in STOPWORDS and len(w) > 1}
    if not jd_tokens:
        return 0.0
    return round((len(resume_tokens & jd_tokens) / len(jd_tokens)) * 100, 2)


def read_text_file_or_pdf(path: Path) -> str:
    if path.suffix.lower() == ".pdf":
        if PdfReader is None:
            raise ImportError(f"Cannot read PDF '{path}' because pypdf is not installed.")
        reader = PdfReader(str(path))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages).strip()
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read().strip()


def load_dataset(data_dir: Path) -> Tuple[Dict[str, str], Dict[str, str], List[dict]]:
    jds_dir = data_dir / "jds"
    resumes_dir = data_dir / "resumes"
    labels_file = data_dir / "labels.csv"

    if not labels_file.exists():
        raise FileNotFoundError(
            f"[ERROR] Labels file not found at: {labels_file.resolve()}\n"
            f"Please run 'python evaluation/generate_labels_template.py' to generate a template,\n"
            f"or specify '--data-dir evaluation/data/synthetic_mini_data' to verify the pipeline."
        )

    valid_rows = []
    with open(labels_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rel_str = (row.get("relevance") or "").strip()
            if rel_str != "":
                try:
                    rel_val = float(rel_str)
                    valid_rows.append({
                        "jd_id": row["jd_id"].strip(),
                        "resume_id": row["resume_id"].strip(),
                        "relevance": rel_val,
                    })
                except ValueError:
                    pass

    if not valid_rows:
        raise ValueError(
            f"[ERROR] {labels_file.resolve()} is empty or contains no labeled rows with relevance values (0-3).\n"
            f"Never hardcode or invent metrics: please annotate relevance in labels.csv,\n"
            f"or run with '--data-dir evaluation/data/synthetic_mini_data' for the verification dataset."
        )

    # Load JDs
    jds_text = {}
    for row in valid_rows:
        jd_id = row["jd_id"]
        if jd_id not in jds_text:
            jd_path = jds_dir / f"{jd_id}.txt"
            if not jd_path.exists():
                jd_path = jds_dir / jd_id
            if not jd_path.exists():
                raise FileNotFoundError(f"[ERROR] JD file '{jd_id}' not found in {jds_dir}")
            jds_text[jd_id] = read_text_file_or_pdf(jd_path)

    # Load Resumes
    resumes_text = {}
    for row in valid_rows:
        resume_id = row["resume_id"]
        if resume_id not in resumes_text:
            resume_path = resumes_dir / resume_id
            if not resume_path.exists():
                # Try finding with .txt or .pdf
                matches = list(resumes_dir.glob(f"{resume_id}*"))
                if matches:
                    resume_path = matches[0]
                else:
                    raise FileNotFoundError(f"[ERROR] Resume file '{resume_id}' not found in {resumes_dir}")
            resumes_text[resume_id] = read_text_file_or_pdf(resume_path)

    return jds_text, resumes_text, valid_rows


def evaluate_pipeline(
    data_dir: Path,
    results_path: Path | None = None,
) -> Dict[str, Dict[str, float]]:
    jds_text, resumes_text, rows = load_dataset(data_dir)

    print(f"\n[INFO] Loaded dataset from: {data_dir.resolve()}")
    print(f"       Total labeled pairs: {len(rows)}")
    unique_jds = sorted(set(r["jd_id"] for r in rows))
    print(f"       Unique Job Descriptions: {len(unique_jds)}")
    print(f"       Unique Resumes: {len(set(r['resume_id'] for r in rows))}")

    # Compute component scores and baselines for all pairs
    pair_scores = []
    print("\n[INFO] Computing candidate scores across evaluation systems...")
    for row in rows:
        jd_id = row["jd_id"]
        resume_id = row["resume_id"]
        relevance = row["relevance"]
        jd_text = jds_text[jd_id]
        res_text = resumes_text[resume_id]

        comp = compute_component_scores(res_text, jd_text)
        kw_score = compute_keyword_overlap(res_text, jd_text)
        tfidf_score = calculate_tfidf_score(res_text, jd_text)

        pair_scores.append({
            "jd_id": jd_id,
            "resume_id": resume_id,
            "relevance": relevance,
            "scores": {
                "Keyword Overlap Baseline": kw_score,
                "TF-IDF Cosine Baseline": tfidf_score,
                "Skill Score Only": comp["skill"],
                "Semantic Score Only": comp["semantic"],
                "Current Hybrid (0.55/0.25/0.10/0.10)": comp["final_score"],
            },
            "components": comp,
        })

    system_names = [
        "Keyword Overlap Baseline",
        "TF-IDF Cosine Baseline",
        "Skill Score Only",
        "Semantic Score Only",
        "Current Hybrid (0.55/0.25/0.10/0.10)",
    ]

    # Evaluate per JD and macro-average
    summary_results: Dict[str, Dict[str, float]] = {s: {} for s in system_names}

    for system in system_names:
        ndcg5_list = []
        ndcg10_list = []
        prec5_list = []
        mrr_list = []
        spearman_list = []

        for jd_id in unique_jds:
            jd_pairs = [p for p in pair_scores if p["jd_id"] == jd_id]
            if not jd_pairs:
                continue

            # Sort descending by predicted system score
            ranked_pairs = sorted(
                jd_pairs,
                key=lambda p: p["scores"][system],
                reverse=True,
            )

            ranked_rels = [p["relevance"] for p in ranked_pairs]
            all_rels = [p["relevance"] for p in jd_pairs]
            pred_scores = [p["scores"][system] for p in jd_pairs]
            true_rels = [p["relevance"] for p in jd_pairs]

            ndcg5 = ndcg_at_k(ranked_rels, all_rels, k=5)
            ndcg10 = ndcg_at_k(ranked_rels, all_rels, k=10)
            prec5 = precision_at_k(ranked_rels, k=5, threshold=2)
            rr = reciprocal_rank(ranked_rels, threshold=2)
            spearman = spearman_correlation(pred_scores, true_rels)

            ndcg5_list.append(ndcg5)
            ndcg10_list.append(ndcg10)
            prec5_list.append(prec5)
            mrr_list.append(rr)
            spearman_list.append(spearman)

        n = len(unique_jds)
        summary_results[system] = {
            "NDCG@5": round(sum(ndcg5_list) / n, 4) if n else 0.0,
            "NDCG@10": round(sum(ndcg10_list) / n, 4) if n else 0.0,
            "Precision@5": round(sum(prec5_list) / n, 4) if n else 0.0,
            "MRR": round(sum(mrr_list) / n, 4) if n else 0.0,
            "Spearman": round(sum(spearman_list) / n, 4) if n else 0.0,
        }

    # Print markdown table
    print("\n" + "=" * 80)
    print("RANKING EVALUATION RESULTS (Macro-averaged across Job Descriptions)")
    print("=" * 80)
    header = f"| {'System':<37} | {'NDCG@5':<8} | {'NDCG@10':<8} | {'Precision@5':<11} | {'MRR':<6} | {'Spearman':<8} |"
    sep = f"|{'-'*39}|{'-'*10}|{'-'*10}|{'-'*13}|{'-'*8}|{'-'*10}|"
    print(header)
    print(sep)
    for system in system_names:
        m = summary_results[system]
        print(
            f"| {system:<37} | {m['NDCG@5']:<8.4f} | {m['NDCG@10']:<8.4f} | {m['Precision@5']:<11.4f} | {m['MRR']:<6.4f} | {m['Spearman']:<8.4f} |"
        )
    print("=" * 80 + "\n")

    # If results_path provided, write or append to results.md
    if results_path:
        is_synthetic = "synthetic" in str(data_dir).lower()
        dataset_label = "Synthetic Verification Mini-Dataset" if is_synthetic else "Hand-Labeled Benchmark Dataset"
        
        md_content = []
        md_content.append(f"## Ranking Quality Evaluation ({dataset_label})\n")
        if is_synthetic:
            md_content.append(
                "> [!WARNING]\n"
                "> These numbers are computed on the **synthetic mini-dataset** for pipeline validation.\n"
                "> For your final report, run evaluation on your hand-labeled dataset in `evaluation/data/labels.csv`.\n"
            )
        md_content.append(f"- **Total Labeled Pairs**: {len(rows)}")
        md_content.append(f"- **Evaluated JDs**: {len(unique_jds)}")
        md_content.append(f"- **Evaluated Resumes**: {len(set(r['resume_id'] for r in rows))}\n")
        md_content.append("| System | NDCG@5 | NDCG@10 | Precision@5 | MRR | Spearman |")
        md_content.append("|:---|:---:|:---:|:---:|:---:|:---:|")
        for system in system_names:
            m = summary_results[system]
            md_content.append(
                f"| **{system}** | {m['NDCG@5']:.4f} | {m['NDCG@10']:.4f} | {m['Precision@5']:.4f} | {m['MRR']:.4f} | {m['Spearman']:.4f} |"
            )
        md_content.append("\n---\n")

        # Read existing file if any to update section or create new
        existing_text = ""
        if results_path.exists():
            with open(results_path, "r", encoding="utf-8") as f:
                existing_text = f.read()

        # Simple replacement or append
        table_str = "\n".join(md_content)
        if "## Ranking Quality Evaluation" in existing_text:
            # Replace previous section
            pattern = r"## Ranking Quality Evaluation.*?(?=\n## |\Z)"
            updated_text = re.sub(pattern, table_str.strip(), existing_text, flags=re.DOTALL)
        else:
            updated_text = f"# AI Resume Ranking & Explainable ATS — Evaluation Report\n\n{table_str}\n{existing_text}"

        with open(results_path, "w", encoding="utf-8") as f:
            f.write(updated_text.strip() + "\n")
        print(f"[SUCCESS] Wrote evaluation table to: {results_path.resolve()}")

    return summary_results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate resume ranking systems on labeled dataset.")
    parser.add_argument(
        "--data-dir",
        default="evaluation/data",
        help="Path to folder containing jds/, resumes/, and labels.csv",
    )
    parser.add_argument(
        "--results-file",
        default="evaluation/results.md",
        help="Path to results markdown file",
    )
    args = parser.parse_args()

    data_dir_path = Path(args.data_dir)
    if not data_dir_path.exists():
        data_dir_path = Path("evaluation") / args.data_dir

    results_file_path = Path(args.results_file)
    if not results_file_path.is_absolute() and not results_file_path.parent.exists():
        results_file_path = Path("evaluation") / args.results_file

    evaluate_pipeline(
        data_dir=data_dir_path,
        results_path=results_file_path,
    )
