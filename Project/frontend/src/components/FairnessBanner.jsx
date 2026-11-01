import { Scale, CheckCircle2, AlertTriangle, Info } from "lucide-react";

export function FairnessBanner({ fairnessReport }) {
  if (!fairnessReport) return null;

  const hasFlags =
    fairnessReport.flagged_terms && fairnessReport.flagged_terms.length > 0;

  return (
    <div
      className={`fairness-banner ${hasFlags ? "banner-warning" : "banner-neutral"}`}
      role="region"
      aria-label="Fairness and recruitment bias report"
    >
      <div className="banner-icon-container">
        {hasFlags ? (
          <AlertTriangle size={18} className="banner-icon-warning" />
        ) : (
          <Scale size={18} className="banner-icon-ok" />
        )}
      </div>

      <div className="banner-body">
        <div className="banner-header-row">
          <span className="banner-title">Recruitment Fairness & Bias Check</span>
          <span className={`status-pill ${hasFlags ? "pill-warning" : "pill-ok"}`}>
            {hasFlags ? "Flagged Phrasing" : "Clean JD"}
          </span>
        </div>

        <p className="banner-message">{fairnessReport.message}</p>

        {hasFlags && (
          <div className="flagged-terms-wrap">
            <span className="terms-label">Flagged terms:</span>
            <div className="terms-chips">
              {fairnessReport.flagged_terms.map((term, index) => (
                <span key={index} className="term-chip">
                  {term}
                </span>
              ))}
            </div>
          </div>
        )}

        {fairnessReport.recommendations && fairnessReport.recommendations.length > 0 && (
          <div className="banner-recommendations">
            <Info size={14} className="rec-icon" />
            <span>{fairnessReport.recommendations[0]}</span>
          </div>
        )}
      </div>
    </div>
  );
}
