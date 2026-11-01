import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  Briefcase,
  Clock,
  HelpCircle,
  ArrowRight,
  FileText
} from "lucide-react";

export function CandidateCard({ candidate, isInitiallyExpanded = false }) {
  const [expanded, setExpanded] = useState(isInitiallyExpanded);
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!candidate) return null;

  const score = Math.max(0, Math.min(100, Number(candidate.final_score) || 0));
  const reviewLevel = candidate.review_flag?.level || "Review Needed";
  const reviewReason = candidate.review_flag?.reason || "";

  function getBandClass() {
    if (reviewLevel === "Good Match" || score >= 70) return "band-good";
    if (reviewLevel === "Manual Review" || score >= 50) return "band-review";
    return "band-weak";
  }

  const bandClass = getBandClass();

  // Helper for Circular Gauge SVG
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const matchedSkills = candidate.matched_skills || [];
  const missingSkills = candidate.missing_skills || [];
  const topMatched = matchedSkills.slice(0, 3);

  // Build Interview Questions
  const questions = buildQuestions(candidate);

  // Build Improvement Suggestions
  const suggestions = buildSuggestions(candidate);

  function handleCopyQuestion(qText, index) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(qText);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  }

  return (
    <article
      className={`card-box candidate-card ${bandClass} ${expanded ? "is-expanded" : ""}`}
      aria-expanded={expanded}
    >
      {/* Collapsed Header / Summary Row */}
      <div
        className="card-summary-row"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
        aria-label={`${candidate.candidate_name}, Rank ${candidate.rank}, Final Score ${score}%, ${reviewLevel}. Click to ${expanded ? "collapse" : "expand"}`}
      >
        <div className="summary-left">
          {/* Circular Score Gauge */}
          <div className="gauge-container" title={`Score: ${score}%`}>
            <svg className="gauge-svg" viewBox="0 0 54 54" aria-hidden="true">
              <circle
                className="gauge-bg"
                cx="27"
                cy="27"
                r={radius}
                strokeWidth="4"
              />
              <circle
                className={`gauge-progress ${bandClass}`}
                cx="27"
                cy="27"
                r={radius}
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="gauge-label tabular-num">{score}</div>
          </div>

          <div className="candidate-identifiers">
            <div className="name-and-rank">
              <span className="rank-indicator">#{candidate.rank}</span>
              <h3 className="card-candidate-name">{candidate.candidate_name}</h3>
              <span className={`status-pill ${bandClass}`}>{reviewLevel}</span>
            </div>
            <div className="file-info-row">
              <FileText size={13} className="file-icon" />
              <span className="file-name-text">{candidate.file_name}</span>
            </div>
          </div>
        </div>

        <div className="summary-right">
          {/* Top 3 Matched Skills preview */}
          {topMatched.length > 0 && (
            <div className="top-skills-preview">
              <span className="preview-label">Top matches:</span>
              <div className="preview-chips">
                {topMatched.map((skill) => (
                  <span key={skill} className="skill-chip matched-chip-sm">
                    {skill}
                  </span>
                ))}
                {matchedSkills.length > 3 && (
                  <span className="more-count">+{matchedSkills.length - 3}</span>
                )}
              </div>
            </div>
          )}

          <button
            type="button"
            className="expand-toggle-btn"
            aria-label={expanded ? "Collapse details" : "Expand candidate details"}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Expanded Details Section */}
      {expanded && (
        <div className="card-expanded-body">
          {/* Executive Summary */}
          <div className="detail-section summary-quote-box">
            <p className="summary-quote-text">
              {candidate.explanation_report?.summary || candidate.explanation}
            </p>
            {reviewReason && (
              <p className="summary-reason-text">
                <strong>Verdict reason:</strong> {reviewReason}
              </p>
            )}
          </div>

          {/* Strengths & Concerns Grid */}
          <div className="eval-dual-grid">
            <div className="eval-pane strengths-pane">
              <div className="pane-header">
                <CheckCircle2 size={16} className="pane-icon green" />
                <span>Detected Strengths</span>
              </div>
              <ul className="pane-list">
                {(candidate.explanation_report?.strengths || []).map((s, idx) => (
                  <li key={idx} className="pane-item">
                    <span className="bullet green" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="eval-pane concerns-pane">
              <div className="pane-header">
                <AlertCircle size={16} className="pane-icon amber" />
                <span>Identified Concerns / Gaps</span>
              </div>
              <ul className="pane-list">
                {(candidate.explanation_report?.concerns || []).map((c, idx) => (
                  <li key={idx} className="pane-item">
                    <span className="bullet amber" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Skills Matrix: Matched vs Missing */}
          <div className="detail-section skills-matrix-box">
            <h4 className="subheading">Skills Breakdown</h4>
            <div className="matrix-columns">
              <div className="matrix-col">
                <div className="matrix-title matched">
                  <span>Matched Skills ({matchedSkills.length})</span>
                </div>
                <div className="chips-cloud">
                  {matchedSkills.length > 0 ? (
                    matchedSkills.map((s) => (
                      <span key={s} className="skill-chip matched-chip">
                        <CheckCircle2 size={13} />
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="empty-subtext">No required skills directly detected.</span>
                  )}
                </div>
              </div>

              <div className="matrix-col">
                <div className="matrix-title missing">
                  <span>Missing Skills ({missingSkills.length})</span>
                </div>
                <div className="chips-cloud">
                  {missingSkills.length > 0 ? (
                    missingSkills.map((s) => (
                      <span key={s} className="skill-chip missing-chip">
                        <AlertCircle size={13} />
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="empty-subtext success">All key required skills matched!</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Project & Experience Sub-Cards */}
          <div className="detail-section dual-cards-row">
            <div className="mini-analysis-card">
              <div className="mini-analysis-header">
                <Briefcase size={16} className="mini-icon blue" />
                <div>
                  <span className="mini-title">Project Relevance</span>
                  <span className="mini-score tabular-num">
                    {candidate.project_analysis?.score ?? 0}%
                  </span>
                </div>
              </div>
              <p className="mini-desc">
                {candidate.project_analysis?.reason || "No project section identified."}
              </p>
              {candidate.project_analysis?.project_skills?.length > 0 && (
                <div className="mini-footer-tags">
                  <span className="tag-label">Project skills:</span>
                  {candidate.project_analysis.project_skills.map((ps) => (
                    <span key={ps} className="mini-tag">
                      {ps}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mini-analysis-card">
              <div className="mini-analysis-header">
                <Clock size={16} className="mini-icon amber" />
                <div>
                  <span className="mini-title">Experience Relevance</span>
                  <span className="mini-score tabular-num">
                    {candidate.experience_analysis?.score ?? 0}%
                  </span>
                </div>
              </div>
              <p className="mini-desc">
                {candidate.experience_analysis?.reason || "Experience assessment not available."}
              </p>
              <div className="mini-footer-tags">
                <span className="tag-label">Tenure:</span>
                <span className="mini-tag">
                  {candidate.experience_analysis?.candidate_months
                    ? `${(candidate.experience_analysis.candidate_months / 12).toFixed(1)} yrs detected`
                    : "0 months detected"}
                </span>
                {candidate.experience_analysis?.required_months > 0 && (
                  <span className="mini-tag muted">
                    {(candidate.experience_analysis.required_months / 12).toFixed(1)} yrs required
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Resume Improvement Suggestions */}
          {suggestions.length > 0 && (
            <div className="detail-section suggestions-box">
              <div className="suggestions-header">
                <Sparkles size={16} className="sugg-icon" />
                <h4 className="subheading">Resume Improvement Feedback</h4>
              </div>
              <ul className="suggestions-list">
                {suggestions.map((s, idx) => (
                  <li key={idx} className="suggestion-item">
                    <ArrowRight size={14} className="sugg-arrow" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interview Question Generator with Copy Buttons */}
          <div className="detail-section interview-questions-box">
            <div className="questions-header">
              <HelpCircle size={16} className="q-icon" />
              <div>
                <h4 className="subheading">Tailored Interview Questions</h4>
                <p className="subheading-desc">
                  Probe candidate strengths and address specific skill or project gaps.
                </p>
              </div>
            </div>

            <div className="questions-list">
              {questions.map((q, idx) => {
                const isCopied = copiedIndex === idx;
                return (
                  <div key={idx} className="question-card">
                    <span className="question-num">Q{idx + 1}</span>
                    <p className="question-text">{q}</p>
                    <button
                      type="button"
                      className={`copy-btn ${isCopied ? "is-copied" : ""}`}
                      onClick={() => handleCopyQuestion(q, idx)}
                      title="Copy question text to clipboard"
                    >
                      {isCopied ? (
                        <>
                          <Check size={14} />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function buildQuestions(candidate) {
  const questions = [];
  const matched = candidate.matched_skills || [];
  const missing = candidate.missing_skills || [];
  const projectSkills = candidate.project_analysis?.project_skills || [];

  if (matched[0]) {
    questions.push(
      `Can you describe an architectural challenge you encountered using ${matched[0]} and how you designed the solution?`
    );
  }

  if (matched[1]) {
    questions.push(
      `In your recent projects with ${matched[1]}, how did you handle performance, scalability, and error recovery?`
    );
  }

  if (projectSkills.length > 0) {
    questions.push(
      `Walk us through the implementation details and real-world impact of your project utilizing ${projectSkills.slice(0, 3).join(", ")}.`
    );
  }

  if (missing[0]) {
    questions.push(
      `The role requires ${missing[0]}, which is not clearly featured on your resume. What relevant transferable experience or self-learning do you have with this?`
    );
  }

  questions.push(
    "How do you evaluate trade-offs between delivery speed and engineering rigor when building production software?"
  );

  return questions;
}

function buildSuggestions(candidate) {
  const suggestions = [];

  if (candidate.missing_skills?.length > 0) {
    suggestions.push(
      `Highlight proof of key JD requirements: add project evidence or certifications for ${candidate.missing_skills.slice(0, 4).join(", ")}.`
    );
  }

  if ((candidate.project_relevance_score || 0) < 70) {
    suggestions.push(
      "Structure project bullets using the STAR framework: problem context, tech stack choices, quantifiable impact (e.g., latency reduction, throughput)."
    );
  }

  if ((candidate.experience_relevance_score || 0) < 60) {
    suggestions.push(
      "Clarify dates, tenure duration (months/years), and scope of ownership across internships and full-time roles."
    );
  }

  if ((candidate.semantic_similarity_score || 0) < 65) {
    suggestions.push(
      "Align resume terminology with standard industry keywords and phrasing used in the job description."
    );
  }

  if (!suggestions.length) {
    suggestions.push(
      "Profile is well aligned. Consider adding links to verified GitHub repositories, live demo URLs, or production case studies."
    );
  }

  return suggestions;
}
