# SYNTHETIC MINI-DATASET (FOR PIPELINE VERIFICATION ONLY)

> [!WARNING]
> This dataset is strictly synthetic and provided solely to verify that the evaluation pipeline, metric computations, and weight-tuning scripts run correctly end-to-end.
> Real benchmark numbers and production weights must come from your own hand-labeled data in `evaluation/data/labels.csv`.

### Contents
- `jds/`: 2 sample job descriptions (`jd_01_backend.txt`, `jd_02_ml.txt`)
- `resumes/`: 6 diverse candidate resumes covering senior, junior, fresher with projects, frontend, and unrelated background.
- `labels.csv`: Human ground-truth relevance grades (0 to 3) for each (JD, resume) pair.
