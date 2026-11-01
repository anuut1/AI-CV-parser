import { Cpu, FileCode, Briefcase, Clock, HelpCircle } from "lucide-react";

export function ScoreBreakdown({ candidate }) {
  if (!candidate) return null;

  const pillars = [
    {
      id: "skill",
      name: "Skill Match",
      weight: "55%",
      weightVal: 0.55,
      score: candidate.skill_match_score ?? 0,
      icon: <FileCode size={15} />,
      colorClass: "pillar-skill",
      desc: "Direct overlap between candidate skills and role prerequisites."
    },
    {
      id: "semantic",
      name: "Semantic Similarity",
      weight: "25%",
      weightVal: 0.25,
      score: candidate.semantic_similarity_score ?? 0,
      icon: <Cpu size={15} />,
      colorClass: "pillar-semantic",
      desc: "Contextual meaning similarity via neural embeddings."
    },
    {
      id: "project",
      name: "Project Relevance",
      weight: "10%",
      weightVal: 0.10,
      score: candidate.project_relevance_score ?? 0,
      icon: <Briefcase size={15} />,
      colorClass: "pillar-project",
      desc: "Hands-on projects compensating for tenure barriers."
    },
    {
      id: "experience",
      name: "Experience Relevance",
      weight: "10%",
      weightVal: 0.10,
      score: candidate.experience_relevance_score ?? 0,
      icon: <Clock size={15} />,
      colorClass: "pillar-experience",
      desc: "Detected professional experience vs required months."
    }
  ];

  const finalScore = candidate.final_score ?? 0;

  return (
    <div className="card-box score-breakdown-card">
      <div className="breakdown-header">
        <div>
          <h4 className="breakdown-title">4-Pillar Score Composition</h4>
          <p className="breakdown-subtitle">
            Weighted contribution towards overall candidate score ({finalScore}%)
          </p>
        </div>
        <div className="formula-pill">
          Formula: (0.55 × Skill) + (0.25 × Semantic) + (0.10 × Project) + (0.10 × Exp)
        </div>
      </div>

      {/* Stacked Composition Bar */}
      <div className="stacked-bar-container" aria-label="Score composition stacked bar">
        <div className="stacked-track">
          {pillars.map((pillar) => {
            // Contribution to final 100% score: weight * score
            const contribution = (pillar.weightVal * pillar.score).toFixed(1);
            return (
              <div
                key={pillar.id}
                className={`stacked-segment ${pillar.colorClass}`}
                style={{ width: `${Math.max(2, contribution)}%` }}
                title={`${pillar.name}: ${pillar.score}% (Adds ${contribution} pts to final)`}
              />
            );
          })}
        </div>
      </div>

      {/* Grid of Pillar Cards */}
      <div className="pillars-grid">
        {pillars.map((pillar) => {
          const score = Math.max(0, Math.min(100, Number(pillar.score) || 0));
          const weightedPts = (pillar.weightVal * score).toFixed(1);

          return (
            <div className="pillar-tile" key={pillar.id}>
              <div className="pillar-tile-top">
                <span className={`pillar-icon-badge ${pillar.colorClass}`}>
                  {pillar.icon}
                </span>
                <span className="pillar-weight-badge">{pillar.weight} weight</span>
              </div>

              <div className="pillar-name-row">
                <span className="pillar-name">{pillar.name}</span>
              </div>

              <div className="pillar-score-row">
                <span className="pillar-score-value tabular-num">{score}%</span>
                <span className="pillar-contrib-pts">+{weightedPts} pts</span>
              </div>

              <div className="pillar-progress-track">
                <div
                  className={`pillar-progress-fill ${pillar.colorClass}`}
                  style={{ width: `${score}%` }}
                />
              </div>

              <p className="pillar-desc">{pillar.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
