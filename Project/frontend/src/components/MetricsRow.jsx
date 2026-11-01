import { Trophy, Users, BarChart2, CheckCircle } from "lucide-react";

export function MetricsRow({ results }) {
  if (!results || results.length === 0) return null;

  const totalCount = results.length;
  const avgScore =
    totalCount > 0
      ? (
          results.reduce((acc, c) => acc + (Number(c.final_score) || 0), 0) /
          totalCount
        ).toFixed(1)
      : "0";

  const topCandidate = results[0];
  const goodMatches = results.filter(
    (c) => c.review_flag?.level === "Good Match" || c.final_score >= 70
  ).length;

  return (
    <div className="metrics-row" aria-label="Key screening metrics">
      {/* Metric 1: Average Score */}
      <div className="metric-card">
        <div className="metric-icon-wrap accent-blue">
          <BarChart2 size={20} />
        </div>
        <div className="metric-content">
          <span className="metric-label">Average Match Score</span>
          <div className="metric-value-row">
            <span className="metric-num tabular-num">{avgScore}%</span>
            <span className="metric-subtext">across {totalCount} profiles</span>
          </div>
        </div>
      </div>

      {/* Metric 2: Candidate Pool */}
      <div className="metric-card">
        <div className="metric-icon-wrap accent-teal">
          <Users size={20} />
        </div>
        <div className="metric-content">
          <span className="metric-label">Candidates Evaluated</span>
          <div className="metric-value-row">
            <span className="metric-num tabular-num">{totalCount}</span>
            <span className="metric-pill good-pill">
              <CheckCircle size={12} />
              {goodMatches} strong fit{goodMatches === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      {/* Metric 3: Top Candidate */}
      <div className="metric-card">
        <div className="metric-icon-wrap accent-gold">
          <Trophy size={20} />
        </div>
        <div className="metric-content">
          <span className="metric-label">Top Performer</span>
          <div className="metric-value-row">
            <span className="metric-candidate-name" title={topCandidate?.candidate_name}>
              {topCandidate?.candidate_name || "—"}
            </span>
            <span className="metric-score-tag tabular-num">
              {topCandidate?.final_score}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
