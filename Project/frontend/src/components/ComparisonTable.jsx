import { CheckCircle2, ChevronRight, Award } from "lucide-react";

export function ComparisonTable({ candidates, selectedCandidateName, onSelectCandidate }) {
  if (!candidates || candidates.length === 0) return null;

  // Find max values for each column to highlight "best in column"
  const maxFinal = Math.max(...candidates.map((c) => Number(c.final_score) || 0));
  const maxSkill = Math.max(...candidates.map((c) => Number(c.skill_match_score) || 0));
  const maxSemantic = Math.max(...candidates.map((c) => Number(c.semantic_similarity_score) || 0));
  const maxProject = Math.max(...candidates.map((c) => Number(c.project_relevance_score) || 0));
  const maxExp = Math.max(...candidates.map((c) => Number(c.experience_relevance_score) || 0));

  function getBandBadgeClass(level, score) {
    if (level === "Good Match" || score >= 70) return "band-good";
    if (level === "Manual Review" || score >= 50) return "band-review";
    return "band-weak";
  }

  return (
    <div className="card-box comparison-table-card">
      <div className="card-header-clean">
        <div>
          <h3 className="card-title">Side-by-Side Candidate Comparison</h3>
          <p className="card-subtitle">
            Compare candidates across all 4 evaluation dimensions. Highest score per pillar is highlighted with an indicator.
          </p>
        </div>
      </div>

      <div className="table-responsive-container" tabIndex={0} aria-label="Candidate comparison table">
        <table className="modern-saas-table">
          <thead>
            <tr>
              <th scope="col" className="col-rank">Rank</th>
              <th scope="col" className="col-candidate">Candidate</th>
              <th scope="col" className="col-score">Final Score</th>
              <th scope="col" className="col-pillar">Skill (55%)</th>
              <th scope="col" className="col-pillar">Semantic (25%)</th>
              <th scope="col" className="col-pillar">Project (10%)</th>
              <th scope="col" className="col-pillar">Experience (10%)</th>
              <th scope="col" className="col-status">Verdict</th>
              <th scope="col" className="col-action" aria-label="Action"></th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => {
              const finalVal = Number(c.final_score) || 0;
              const skillVal = Number(c.skill_match_score) || 0;
              const semanticVal = Number(c.semantic_similarity_score) || 0;
              const projectVal = Number(c.project_relevance_score) || 0;
              const expVal = Number(c.experience_relevance_score) || 0;
              const isSelected = c.candidate_name === selectedCandidateName;
              const badgeClass = getBandBadgeClass(c.review_flag?.level, finalVal);

              return (
                <tr
                  key={c.candidate_name}
                  className={`table-row ${isSelected ? "is-row-selected" : ""}`}
                  onClick={() => onSelectCandidate(c.candidate_name)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectCandidate(c.candidate_name);
                    }
                  }}
                  aria-label={`Select ${c.candidate_name}, Rank ${c.rank}`}
                >
                  <td className="col-rank">
                    <span className="table-rank-pill">#{c.rank}</span>
                  </td>

                  <td className="col-candidate">
                    <div className="table-candidate-cell">
                      <strong className="cell-candidate-name">{c.candidate_name}</strong>
                      <span className="cell-filename">{c.file_name}</span>
                    </div>
                  </td>

                  <td className="col-score">
                    <div className="score-cell-wrap">
                      <span className="cell-score-strong tabular-num">{finalVal}%</span>
                      {finalVal === maxFinal && maxFinal > 0 && (
                        <span className="best-pill" title="Top Overall Score">
                          <Award size={12} /> Top
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="col-pillar">
                    <span className={`cell-metric tabular-num ${skillVal === maxSkill && maxSkill > 0 ? "is-best-metric" : ""}`}>
                      {skillVal}%
                    </span>
                  </td>

                  <td className="col-pillar">
                    <span className={`cell-metric tabular-num ${semanticVal === maxSemantic && maxSemantic > 0 ? "is-best-metric" : ""}`}>
                      {semanticVal}%
                    </span>
                  </td>

                  <td className="col-pillar">
                    <span className={`cell-metric tabular-num ${projectVal === maxProject && maxProject > 0 ? "is-best-metric" : ""}`}>
                      {projectVal}%
                    </span>
                  </td>

                  <td className="col-pillar">
                    <span className={`cell-metric tabular-num ${expVal === maxExp && maxExp > 0 ? "is-best-metric" : ""}`}>
                      {expVal}%
                    </span>
                  </td>

                  <td className="col-status">
                    <span className={`status-pill ${badgeClass}`}>
                      {c.review_flag?.level || "Review"}
                    </span>
                  </td>

                  <td className="col-action">
                    <button
                      type="button"
                      className="row-select-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCandidate(c.candidate_name);
                      }}
                      aria-label={`Inspect ${c.candidate_name}`}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
