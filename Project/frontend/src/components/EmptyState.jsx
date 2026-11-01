import { FileSearch, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export function EmptyState({ onLoadSample }) {
  return (
    <div className="card-box empty-state-card" role="region" aria-label="No candidates ranked yet">
      <div className="empty-icon-wrap">
        <FileSearch size={32} className="empty-icon" />
      </div>

      <h3 className="empty-title">No candidate evaluation results yet</h3>
      <p className="empty-description">
        Paste a job description on the left and attach candidate resumes (PDF or TXT) on the right,
        then click <strong>Rank Candidates</strong> to generate explainable scores.
      </p>

      <div className="empty-feature-pills">
        <span className="feature-pill">
          <CheckCircle2 size={14} className="pill-check" /> 55% Skill Match (Alias Mapping)
        </span>
        <span className="feature-pill">
          <CheckCircle2 size={14} className="pill-check" /> 25% Semantic Embeddings
        </span>
        <span className="feature-pill">
          <CheckCircle2 size={14} className="pill-check" /> 10% Project Compensation
        </span>
        <span className="feature-pill">
          <CheckCircle2 size={14} className="pill-check" /> 10% Experience Relevance
        </span>
      </div>

      <div className="empty-action-row">
        <button type="button" className="btn-secondary" onClick={onLoadSample}>
          <Sparkles size={16} />
          <span>Load sample demo data</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
