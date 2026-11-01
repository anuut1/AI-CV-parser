import { Award, ArrowUpDown } from "lucide-react";

export function RankingChart({ candidates, selectedCandidateName, onSelectCandidate }) {
  if (!candidates || candidates.length === 0) return null;

  function getBandClass(finalScore, reviewLevel) {
    if (reviewLevel === "Good Match" || finalScore >= 70) return "band-good";
    if (reviewLevel === "Manual Review" || finalScore >= 50) return "band-review";
    return "band-weak";
  }

  function getBandLabel(finalScore, reviewLevel) {
    if (reviewLevel === "Good Match" || finalScore >= 70) return "Good Match";
    if (reviewLevel === "Manual Review" || finalScore >= 50) return "Manual Review";
    return "Weak Match";
  }

  return (
    <div className="card-box ranking-chart-card">
      <div className="card-header-clean">
        <div>
          <h3 className="card-title">Ranking Leaderboard</h3>
          <p className="card-subtitle">
            Candidates ordered by weighted hybrid score (55% Skill, 25% Semantic, 10% Project, 10% Experience)
          </p>
        </div>
        <div className="legend-pills">
          <span className="legend-chip good">
            <span className="dot dot-good" /> ≥70% Good Match
          </span>
          <span className="legend-chip review">
            <span className="dot dot-review" /> 50–69% Manual Review
          </span>
          <span className="legend-chip weak">
            <span className="dot dot-weak" /> &lt;50% Weak Match
          </span>
        </div>
      </div>

      <div className="ranking-bars-list" role="list" aria-label="Candidate ranking scores">
        {candidates.map((candidate) => {
          const score = Math.max(0, Math.min(100, Number(candidate.final_score) || 0));
          const bandClass = getBandClass(score, candidate.review_flag?.level);
          const bandLabel = getBandLabel(score, candidate.review_flag?.level);
          const isSelected = candidate.candidate_name === selectedCandidateName;

          return (
            <div
              key={candidate.candidate_name}
              className={`ranking-bar-item ${bandClass} ${isSelected ? "is-selected-candidate" : ""}`}
              onClick={() => onSelectCandidate(candidate.candidate_name)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectCandidate(candidate.candidate_name);
                }
              }}
              aria-label={`Rank ${candidate.rank}: ${candidate.candidate_name}, Score: ${score}%, ${bandLabel}`}
            >
              <div className="bar-meta-left">
                <span className="rank-badge">#{candidate.rank}</span>
                <div className="name-and-file">
                  <span className="candidate-name">{candidate.candidate_name}</span>
                  <span className="file-name">{candidate.file_name}</span>
                </div>
              </div>

              <div className="bar-visual-track">
                <div
                  className={`bar-fill-indicator ${bandClass}`}
                  style={{ width: `${score}%` }}
                  aria-hidden="true"
                />
              </div>

              <div className="bar-meta-right">
                <span className={`verdict-tag ${bandClass}`}>{bandLabel}</span>
                <span className="score-value tabular-num">{score}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
