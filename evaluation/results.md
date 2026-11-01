# AI Resume Ranking & Explainable ATS — Evaluation Report

## Ranking Quality Evaluation (Synthetic Verification Mini-Dataset)

> [!WARNING]
> These numbers are computed on the **synthetic mini-dataset** for pipeline validation.
> For your final report, run evaluation on your hand-labeled dataset in `evaluation/data/labels.csv`.

- **Total Labeled Pairs**: 12
- **Evaluated JDs**: 2
- **Evaluated Resumes**: 6

| System | NDCG@5 | NDCG@10 | Precision@5 | MRR | Spearman |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Keyword Overlap Baseline** | 1.0000 | 1.0000 | 0.4000 | 1.0000 | 0.9549 |
| **TF-IDF Cosine Baseline** | 0.9718 | 0.9893 | 0.4000 | 1.0000 | 0.6983 |
| **Skill Score Only** | 1.0000 | 1.0000 | 0.4000 | 1.0000 | 0.9239 |
| **Semantic Score Only** | 0.9940 | 0.9940 | 0.4000 | 1.0000 | 0.8197 |
| **Current Hybrid (0.55/0.25/0.10/0.10)** | 1.0000 | 1.0000 | 0.4000 | 1.0000 | 0.9411 |

---

## Component Weight Tuning (Synthetic Mini-Dataset)

> [!WARNING]
> Weight tuning below was executed on the **synthetic verification mini-dataset**.
> Tune and report final production weights against your own hand-labeled data in `evaluation/data/labels.csv`.

### Tuned vs Current Weight Formulations

| System / Strategy | Skill Weight | Semantic Weight | Project Weight | Experience Weight | Validation Strategy |
|:---|:---:|:---:|:---:|:---:|:---|
| **Current System (Default)** | 0.55 | 0.25 | 0.10 | 0.10 | Heuristic baseline |
| **Grid Search (Tuned)** | 0.85 | 0.00 | 0.00 | 0.15 | Full dataset grid fit |
| **Logistic / LTR (Tuned)** | 1.00 | 0.00 | 0.00 | 0.00 | Full dataset logistic fit |

### Leave-One-JD-Out Cross-Validation (Out-of-Sample Test Metrics)

| Method | Test NDCG@5 | Test NDCG@10 | Test Precision@5 | Test MRR | Test Spearman |
|:---|:---:|:---:|:---:|:---:|:---:|
| Current Weights | 1.0000 | 1.0000 | 0.4000 | 1.0000 | 0.9411 |
| LOOCV Grid Search | 0.9499 | 0.9673 | 0.4000 | 1.0000 | 0.5161 |
| LOOCV Logistic Regression / LTR | 1.0000 | 1.0000 | 0.4000 | 1.0000 | 0.9239 |

---
