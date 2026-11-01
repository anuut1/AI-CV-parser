import argparse
import itertools
import math
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

import numpy as np
from sklearn.linear_model import LogisticRegression, Ridge

from evaluation.eval import load_dataset
from evaluation.metrics import (
    ndcg_at_k,
    precision_at_k,
    reciprocal_rank,
    spearman_correlation,
)
from services.scoring import compute_component_scores


CURRENT_WEIGHTS = {
    "skill": 0.55,
    "semantic": 0.25,
    "project": 0.10,
    "experience": 0.10,
}

COMPONENTS = ["skill", "semantic", "project", "experience"]


def generate_weight_grid(step: float = 0.05) -> List[Tuple[float, float, float, float]]:
    """
    Generates non-negative weight combinations (w1, w2, w3, w4) that sum to 1.0.
    """
    steps = int(round(1.0 / step))
    weights = []
    for i in range(steps + 1):
        for j in range(steps + 1 - i):
            for k in range(steps + 1 - i - j):
                l = steps - i - j - k
                w = (
                    round(i * step, 4),
                    round(j * step, 4),
                    round(k * step, 4),
                    round(l * step, 4),
                )
                weights.append(w)
    return weights


def score_pairs_with_weights(
    pairs: List[dict],
    weights: Tuple[float, float, float, float] | List[float],
) -> List[float]:
    w_skill, w_sem, w_proj, w_exp = weights
    scores = []
    for p in pairs:
        c = p["components"]
        s = (
            w_skill * c["skill"]
            + w_sem * c["semantic"]
            + w_proj * c["project"]
            + w_exp * c["experience"]
        )
        scores.append(round(s, 4))
    return scores


def evaluate_jd_ranking(
    jd_pairs: List[dict],
    weights: Tuple[float, float, float, float] | List[float],
) -> Dict[str, float]:
    pred_scores = score_pairs_with_weights(jd_pairs, weights)
    true_rels = [p["relevance"] for p in jd_pairs]

    indexed = sorted(
        zip(pred_scores, true_rels),
        key=lambda x: x[0],
        reverse=True,
    )
    ranked_rels = [x[1] for x in indexed]

    return {
        "NDCG@5": ndcg_at_k(ranked_rels, true_rels, k=5),
        "NDCG@10": ndcg_at_k(ranked_rels, true_rels, k=10),
        "Precision@5": precision_at_k(ranked_rels, k=5, threshold=2),
        "MRR": reciprocal_rank(ranked_rels, threshold=2),
        "Spearman": spearman_correlation(pred_scores, true_rels),
    }


def evaluate_mean_metric(
    pairs_by_jd: Dict[str, List[dict]],
    weights: Tuple[float, float, float, float] | List[float],
    metric_name: str = "NDCG@5",
) -> float:
    scores = []
    for jd_id, pairs in pairs_by_jd.items():
        if pairs:
            m = evaluate_jd_ranking(pairs, weights)
            scores.append(m[metric_name])
    return sum(scores) / len(scores) if scores else 0.0


def fit_logistic_regression_weights(train_pairs: List[dict]) -> Tuple[float, float, float, float]:
    """
    Fits logistic regression on relevant (>=2) vs non-relevant (<2),
    clips negative coefficients to 0, and normalizes weights to sum to 1.0.
    """
    X = np.array([
        [
            p["components"]["skill"],
            p["components"]["semantic"],
            p["components"]["project"],
            p["components"]["experience"],
        ]
        for p in train_pairs
    ], dtype=float)

    # Binarize label: 1 if relevance >= 2 else 0
    y = np.array([1 if p["relevance"] >= 2 else 0 for p in train_pairs], dtype=int)

    # Check class diversity
    if len(np.unique(y)) < 2:
        # Fall back to Ridge regression on continuous relevance
        reg = Ridge(alpha=1.0)
        reg.fit(X, [p["relevance"] for p in train_pairs])
        coefs = np.clip(reg.coef_, 0.0, None)
    else:
        clf = LogisticRegression(penalty="l2", C=1.0, solver="liblinear", random_state=42)
        clf.fit(X, y)
        coefs = np.clip(clf.coef_[0], 0.0, None)

    total = np.sum(coefs)
    if total <= 1e-6:
        return (0.55, 0.25, 0.10, 0.10)

    norm_w = coefs / total
    return (
        round(float(norm_w[0]), 4),
        round(float(norm_w[1]), 4),
        round(float(norm_w[2]), 4),
        round(float(norm_w[3]), 4),
    )


def tune_weights_pipeline(
    data_dir: Path,
    results_path: Path | None = None,
    grid_step: float = 0.05,
) -> dict:
    jds_text, resumes_text, rows = load_dataset(data_dir)

    print(f"\n[INFO] Tuning weights using dataset: {data_dir.resolve()}")
    print(f"       Total pairs: {len(rows)}")

    # Precompute component scores
    pairs = []
    for r in rows:
        jd_id = r["jd_id"]
        resume_id = r["resume_id"]
        c = compute_component_scores(resumes_text[resume_id], jds_text[jd_id])
        pairs.append({
            "jd_id": jd_id,
            "resume_id": resume_id,
            "relevance": r["relevance"],
            "components": c,
        })

    unique_jds = sorted(set(p["jd_id"] for p in pairs))
    pairs_by_jd: Dict[str, List[dict]] = {
        jd_id: [p for p in pairs if p["jd_id"] == jd_id]
        for jd_id in unique_jds
    }

    if len(unique_jds) < 2:
        print("[WARN] Dataset contains fewer than 2 JDs. Cannot perform Leave-One-JD-Out CV.")
        print("       Fitting tuning methods directly on all available data.")
        loocv_mode = False
    else:
        loocv_mode = True

    grid = generate_weight_grid(step=grid_step)
    print(f"[INFO] Generated {len(grid)} weight candidates for grid search (step={grid_step}).")

    curr_w_tuple = (
        CURRENT_WEIGHTS["skill"],
        CURRENT_WEIGHTS["semantic"],
        CURRENT_WEIGHTS["project"],
        CURRENT_WEIGHTS["experience"],
    )

    # 1. Leave-One-JD-Out Cross-Validation
    cv_results = []
    if loocv_mode:
        print(f"[INFO] Running Leave-One-JD-Out Cross-Validation across {len(unique_jds)} folds...")
        for test_jd in unique_jds:
            train_jds = [j for j in unique_jds if j != test_jd]
            train_dict = {j: pairs_by_jd[j] for j in train_jds}
            train_pairs = [p for j in train_jds for p in pairs_by_jd[j]]
            test_pairs = pairs_by_jd[test_jd]

            # Current weights test metrics
            curr_metrics = evaluate_jd_ranking(test_pairs, curr_w_tuple)

            # Grid Search tuning on train JDs (optimize NDCG@5)
            best_grid_w = max(
                grid,
                key=lambda w: (
                    evaluate_mean_metric(train_dict, w, "NDCG@5"),
                    evaluate_mean_metric(train_dict, w, "Spearman"),
                ),
            )
            grid_metrics = evaluate_jd_ranking(test_pairs, best_grid_w)

            # Logistic Regression / LTR tuning on train JDs
            lr_w = fit_logistic_regression_weights(train_pairs)
            lr_metrics = evaluate_jd_ranking(test_pairs, lr_w)

            cv_results.append({
                "test_jd": test_jd,
                "current_metrics": curr_metrics,
                "grid_w": best_grid_w,
                "grid_metrics": grid_metrics,
                "lr_w": lr_w,
                "lr_metrics": lr_metrics,
            })

    # Macro-average test metrics across LOOCV folds
    if loocv_mode:
        n_folds = len(cv_results)
        avg_curr = {
            m: sum(f["current_metrics"][m] for f in cv_results) / n_folds
            for m in ["NDCG@5", "NDCG@10", "Precision@5", "MRR", "Spearman"]
        }
        avg_grid = {
            m: sum(f["grid_metrics"][m] for f in cv_results) / n_folds
            for m in ["NDCG@5", "NDCG@10", "Precision@5", "MRR", "Spearman"]
        }
        avg_lr = {
            m: sum(f["lr_metrics"][m] for f in cv_results) / n_folds
            for m in ["NDCG@5", "NDCG@10", "Precision@5", "MRR", "Spearman"]
        }
    else:
        avg_curr = {m: evaluate_mean_metric(pairs_by_jd, curr_w_tuple, m) for m in ["NDCG@5", "NDCG@10", "Precision@5", "MRR", "Spearman"]}
        avg_grid = avg_curr
        avg_lr = avg_curr

    # 2. Fit Full Dataset to report final recommended weights
    print("[INFO] Fitting tuning methods on full dataset for final recommended weights...")
    best_overall_grid_w = max(
        grid,
        key=lambda w: (
            evaluate_mean_metric(pairs_by_jd, w, "NDCG@5"),
            evaluate_mean_metric(pairs_by_jd, w, "Spearman"),
        ),
    )
    best_overall_lr_w = fit_logistic_regression_weights(pairs)

    print("\n" + "=" * 80)
    print("WEIGHT TUNING & CROSS-VALIDATION SUMMARY")
    print("=" * 80)
    print(f"Current Weights:               Skill={curr_w_tuple[0]:.2f}, Semantic={curr_w_tuple[1]:.2f}, Project={curr_w_tuple[2]:.2f}, Exp={curr_w_tuple[3]:.2f}")
    print(f"Full-Data Tuned Grid Weights:  Skill={best_overall_grid_w[0]:.2f}, Semantic={best_overall_grid_w[1]:.2f}, Project={best_overall_grid_w[2]:.2f}, Exp={best_overall_grid_w[3]:.2f}")
    print(f"Full-Data Tuned LTR/LR Weights: Skill={best_overall_lr_w[0]:.2f}, Semantic={best_overall_lr_w[1]:.2f}, Project={best_overall_lr_w[2]:.2f}, Exp={best_overall_lr_w[3]:.2f}")
    print("-" * 80)
    print("LEAVE-ONE-JD-OUT OUT-OF-SAMPLE TEST PERFORMANCE:")
    print(f"  Current Weights:  NDCG@5={avg_curr['NDCG@5']:.4f}, NDCG@10={avg_curr['NDCG@10']:.4f}, Prec@5={avg_curr['Precision@5']:.4f}, MRR={avg_curr['MRR']:.4f}, Spearman={avg_curr['Spearman']:.4f}")
    print(f"  Tuned Grid (CV):  NDCG@5={avg_grid['NDCG@5']:.4f}, NDCG@10={avg_grid['NDCG@10']:.4f}, Prec@5={avg_grid['Precision@5']:.4f}, MRR={avg_grid['MRR']:.4f}, Spearman={avg_grid['Spearman']:.4f}")
    print(f"  Tuned LTR/LR(CV): NDCG@5={avg_lr['NDCG@5']:.4f}, NDCG@10={avg_lr['NDCG@10']:.4f}, Prec@5={avg_lr['Precision@5']:.4f}, MRR={avg_lr['MRR']:.4f}, Spearman={avg_lr['Spearman']:.4f}")
    print("=" * 80 + "\n")

    if results_path:
        is_synthetic = "synthetic" in str(data_dir).lower()
        dataset_label = "Synthetic Mini-Dataset" if is_synthetic else "Hand-Labeled Benchmark"
        lines = []
        lines.append(f"## Component Weight Tuning ({dataset_label})\n")
        if is_synthetic:
            lines.append(
                "> [!WARNING]\n"
                "> Weight tuning below was executed on the **synthetic verification mini-dataset**.\n"
                "> Tune and report final production weights against your own hand-labeled data in `evaluation/data/labels.csv`.\n"
            )
        lines.append("### Tuned vs Current Weight Formulations\n")
        lines.append("| System / Strategy | Skill Weight | Semantic Weight | Project Weight | Experience Weight | Validation Strategy |")
        lines.append("|:---|:---:|:---:|:---:|:---:|:---|")
        lines.append(f"| **Current System (Default)** | {curr_w_tuple[0]:.2f} | {curr_w_tuple[1]:.2f} | {curr_w_tuple[2]:.2f} | {curr_w_tuple[3]:.2f} | Heuristic baseline |")
        lines.append(f"| **Grid Search (Tuned)** | {best_overall_grid_w[0]:.2f} | {best_overall_grid_w[1]:.2f} | {best_overall_grid_w[2]:.2f} | {best_overall_grid_w[3]:.2f} | Full dataset grid fit |")
        lines.append(f"| **Logistic / LTR (Tuned)** | {best_overall_lr_w[0]:.2f} | {best_overall_lr_w[1]:.2f} | {best_overall_lr_w[2]:.2f} | {best_overall_lr_w[3]:.2f} | Full dataset logistic fit |")
        lines.append("\n### Leave-One-JD-Out Cross-Validation (Out-of-Sample Test Metrics)\n")
        lines.append("| Method | Test NDCG@5 | Test NDCG@10 | Test Precision@5 | Test MRR | Test Spearman |")
        lines.append("|:---|:---:|:---:|:---:|:---:|:---:|")
        lines.append(f"| Current Weights | {avg_curr['NDCG@5']:.4f} | {avg_curr['NDCG@10']:.4f} | {avg_curr['Precision@5']:.4f} | {avg_curr['MRR']:.4f} | {avg_curr['Spearman']:.4f} |")
        lines.append(f"| LOOCV Grid Search | {avg_grid['NDCG@5']:.4f} | {avg_grid['NDCG@10']:.4f} | {avg_grid['Precision@5']:.4f} | {avg_grid['MRR']:.4f} | {avg_grid['Spearman']:.4f} |")
        lines.append(f"| LOOCV Logistic Regression / LTR | {avg_lr['NDCG@5']:.4f} | {avg_lr['NDCG@10']:.4f} | {avg_lr['Precision@5']:.4f} | {avg_lr['MRR']:.4f} | {avg_lr['Spearman']:.4f} |")
        lines.append("\n---\n")

        table_str = "\n".join(lines)
        existing_text = ""
        if results_path.exists():
            with open(results_path, "r", encoding="utf-8") as f:
                existing_text = f.read()

        if "## Component Weight Tuning" in existing_text:
            pattern = r"## Component Weight Tuning.*?(?=\n## |\Z)"
            updated_text = re.sub(pattern, table_str.strip(), existing_text, flags=re.DOTALL)
        else:
            updated_text = f"{existing_text.strip()}\n\n{table_str}"

        with open(results_path, "w", encoding="utf-8") as f:
            f.write(updated_text.strip() + "\n")
        print(f"[SUCCESS] Wrote weight tuning tables to: {results_path.resolve()}")

    return {
        "current_weights": curr_w_tuple,
        "grid_weights": best_overall_grid_w,
        "lr_weights": best_overall_lr_w,
        "avg_curr": avg_curr,
        "avg_grid": avg_grid,
        "avg_lr": avg_lr,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Tune resume ranking component weights using LOOCV.")
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
    parser.add_argument(
        "--step-size",
        type=float,
        default=0.05,
        help="Grid search step size (default 0.05)",
    )
    args = parser.parse_args()

    data_dir_path = Path(args.data_dir)
    if not data_dir_path.exists():
        data_dir_path = Path("evaluation") / args.data_dir

    results_file_path = Path(args.results_file)
    if not results_file_path.is_absolute() and not results_file_path.parent.exists():
        results_file_path = Path("evaluation") / args.results_file

    tune_weights_pipeline(
        data_dir=data_dir_path,
        results_path=results_file_path,
        grid_step=args.step_size,
    )
