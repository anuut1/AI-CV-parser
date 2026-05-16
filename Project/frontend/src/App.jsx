import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FileText,
  Lightbulb,
  Loader2,
  MessageSquareText,
  SearchCheck,
  Sparkles,
  Trophy,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { rankResumes } from "./api";
import "./styles.css";

function App() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumes, setResumes] = useState([]);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const jdWordCount = jobDescription.trim()
    ? jobDescription.trim().split(/\s+/).length
    : 0;

  function addFiles(fileList) {
    const nextFiles = Array.from(fileList).filter((file) =>
      /\.(pdf|txt)$/i.test(file.name),
    );
    setResumes((current) => [...current, ...nextFiles]);
  }

  function removeResume(fileName) {
    setResumes((current) => current.filter((file) => file.name !== fileName));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setData(null);

    if (!jobDescription.trim() || resumes.length === 0) {
      setError("Add a job description and at least one resume.");
      return;
    }

    setLoading(true);
    try {
      const result = await rankResumes(jobDescription, resumes);
      setData(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <div className="page-heading">
          <div>
            <p className="eyebrow">AI Resume Screening</p>
            <h1>Resume Ranking Dashboard</h1>
          </div>
          <div className="summary-chip">
            <FileText size={18} />
            {resumes.length} resumes
          </div>
        </div>

        <form className="upload-panel" onSubmit={handleSubmit}>
          <div className="input-grid">
            <label className="jd-box">
              <span className="label-row">
                <ClipboardList size={18} />
                Job Description
              </span>
              <textarea
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Paste the job description here..."
              />
              <span className="helper-row">
                <span>{jdWordCount} words</span>
                <span>{data?.job_description_skills.length || 0} JD skills found</span>
              </span>
            </label>

            <div>
              <label
                className={`file-picker ${dragActive ? "is-active" : ""}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragActive(false);
                  addFiles(event.dataTransfer.files);
                }}
              >
                <Upload size={24} />
                <span>Drop resumes here or click to upload</span>
                <small>PDF and TXT files are supported</small>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  multiple
                  onChange={(event) => addFiles(event.target.files)}
                />
              </label>

              {resumes.length > 0 && (
                <div className="file-list">
                  {resumes.map((file) => (
                    <div className="file-pill" key={file.name}>
                      <FileText size={16} />
                      <span>{file.name}</span>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => removeResume(file.name)}
                        aria-label={`Remove ${file.name}`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="primary-action" type="submit" disabled={loading}>
            {loading ? <Loader2 className="spin" size={18} /> : <Upload size={18} />}
            {loading ? "Ranking..." : "Rank Resumes"}
          </button>
        </form>

        {data && <ResultsDashboard data={data} />}
      </section>
    </main>
  );
}

function ResultsDashboard({ data }) {
  const [selectedName, setSelectedName] = useState(data.results[0]?.candidate_name || "");
  const selectedCandidate =
    data.results.find((candidate) => candidate.candidate_name === selectedName) ||
    data.results[0];
  const topCandidate = data.results[0];
  const averageScore =
    data.results.length > 0
      ? Math.round(
          data.results.reduce((total, candidate) => total + candidate.final_score, 0) /
            data.results.length,
        )
      : 0;

  return (
    <section className="results">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Screening Results</p>
          <h2>Candidate Ranking</h2>
        </div>
        <p>{data.job_description_skills.join(", ") || "No JD skills found yet"}</p>
      </div>

      <div className="metric-grid">
        <Metric icon={<Trophy size={20} />} label="Top Candidate" value={topCandidate?.candidate_name || "-"} />
        <Metric icon={<Users size={20} />} label="Candidates" value={data.results.length} />
        <Metric icon={<BarChart3 size={20} />} label="Average Score" value={`${averageScore}%`} />
      </div>

      <RankingBars candidates={data.results} selectedName={selectedCandidate?.candidate_name} />

      <div className="fairness-box">
        <AlertTriangle size={20} />
        <div>
          <strong>Bias/Fairness Check</strong>
          <p>{data.fairness_report.message}</p>
          {data.fairness_report.flagged_terms.length > 0 && (
            <small>Flagged: {data.fairness_report.flagged_terms.join(", ")}</small>
          )}
        </div>
      </div>

      <div className="candidate-strip">
        {data.results.map((candidate) => (
          <button
            type="button"
            className={`candidate-tab ${
              candidate.candidate_name === selectedCandidate.candidate_name ? "is-selected" : ""
            }`}
            key={`${candidate.candidate_name}-tab`}
            onClick={() => setSelectedName(candidate.candidate_name)}
          >
            <span>#{candidate.rank}</span>
            {candidate.candidate_name}
          </button>
        ))}
      </div>

      {selectedCandidate && (
        <div className="candidate-focus">
          <div>
            <div className="focus-title">
              <CheckCircle2 size={22} />
              <div>
                <h3>{selectedCandidate.candidate_name}</h3>
                <span>{selectedCandidate.file_name}</span>
              </div>
            </div>
            <p>{selectedCandidate.explanation_report?.summary || selectedCandidate.explanation}</p>
            <div className="review-badge">
              <SearchCheck size={16} />
              <strong>{selectedCandidate.review_flag?.level}</strong>
              <span>{selectedCandidate.review_flag?.reason}</span>
            </div>
          </div>
          <div className="score-stack">
            <ScoreBar label="Final Score" value={selectedCandidate.final_score} />
            <ScoreBar label="Skill Match" value={selectedCandidate.skill_match_score} />
            <ScoreBar label="Semantic Similarity" value={selectedCandidate.semantic_similarity_score} />
            <ScoreBar label="Project Relevance" value={selectedCandidate.project_relevance_score} />
            <ScoreBar label="Experience Relevance" value={selectedCandidate.experience_relevance_score} />
          </div>
        </div>
      )}

      <div className="ordered-workflow">
        <WorkflowCard
          number="1"
          icon={<Lightbulb size={20} />}
          title="Resume Improvement Suggestions"
        >
          <ImprovementSuggestions candidate={selectedCandidate} />
        </WorkflowCard>

        <WorkflowCard
          number="2"
          icon={<CheckCircle2 size={20} />}
          title="Final Hiring Recommendation"
        >
          <FinalHiringRecommendation candidate={selectedCandidate} />
        </WorkflowCard>

        <WorkflowCard
          number="3"
          icon={<MessageSquareText size={20} />}
          title="Interview Question Generator"
        >
          <InterviewQuestions candidate={selectedCandidate} />
        </WorkflowCard>

        <WorkflowCard number="4" icon={<BarChart3 size={20} />} title="Score Breakdown Chart">
          <ScoreBreakdownChart candidate={selectedCandidate} />
        </WorkflowCard>

        <WorkflowCard number="5" icon={<Users size={20} />} title="Candidate Comparison">
          <CandidateComparison
            candidates={data.results}
            selectedName={selectedCandidate?.candidate_name}
            onSelect={setSelectedName}
          />
        </WorkflowCard>
      </div>

      <div className="reports">
        {data.results.map((candidate) => (
          <article key={`${candidate.candidate_name}-report`}>
            <h3>
              <Sparkles size={18} />
              {candidate.candidate_name}
            </h3>
            <ExplainableReport candidate={candidate} />
          </article>
        ))}
      </div>
    </section>
  );
}

function WorkflowCard({ number, icon, title, children }) {
  return (
    <article className="workflow-card">
      <div className="workflow-title">
        <span>{number}</span>
        {icon}
        <h3>{title}</h3>
      </div>
      {children}
    </article>
  );
}

function RankingBars({ candidates, selectedName }) {
  return (
    <div className="ranking-chart">
      <div className="chart-heading">
        <h3>Score Comparison</h3>
        <span>Final score by candidate</span>
      </div>
      {candidates.map((candidate) => (
        <div
          className={`chart-row ${candidate.candidate_name === selectedName ? "is-selected" : ""}`}
          key={`${candidate.candidate_name}-chart`}
        >
          <div>
            <strong>#{candidate.rank}</strong>
            <span>{candidate.candidate_name}</span>
          </div>
          <div className="chart-track">
            <span style={{ width: `${Math.max(0, Math.min(100, candidate.final_score))}%` }} />
          </div>
          <strong>{candidate.final_score}%</strong>
        </div>
      ))}
    </div>
  );
}

function ImprovementSuggestions({ candidate }) {
  const suggestions = buildImprovementSuggestions(candidate);

  return <ReportList title="Suggested Improvements" items={suggestions} />;
}

function buildImprovementSuggestions(candidate) {
  const suggestions = [];

  if (candidate.missing_skills?.length) {
    suggestions.push(`Add proof of these missing JD skills: ${candidate.missing_skills.slice(0, 5).join(", ")}.`);
  }

  if (candidate.project_relevance_score < 70) {
    suggestions.push("Improve project descriptions by mentioning problem statement, tools used, model/output, and measurable result.");
  }

  if (candidate.experience_relevance_score < 60) {
    suggestions.push("Mention internship duration, responsibilities, and role-related outcomes more clearly.");
  }

  if (candidate.semantic_similarity_score < 65) {
    suggestions.push("Use job-relevant wording from the JD naturally in the resume summary and project bullets.");
  }

  if (!suggestions.length) {
    suggestions.push("Resume is already aligned well. Add measurable impact metrics to make it stronger.");
  }

  return suggestions;
}

function FinalHiringRecommendation({ candidate }) {
  const report = candidate.explanation_report;

  return (
    <div className="recommendation-panel">
      <strong>{candidate.review_flag?.level || "Review Needed"}</strong>
      <p>{report?.recommendation || candidate.review_flag?.reason}</p>
      <small>{candidate.review_flag?.reason}</small>
    </div>
  );
}

function InterviewQuestions({ candidate }) {
  const questions = buildInterviewQuestions(candidate);

  return <ReportList title="Suggested Questions" items={questions} />;
}

function buildInterviewQuestions(candidate) {
  const questions = [];
  const matched = candidate.matched_skills || [];
  const missing = candidate.missing_skills || [];
  const projectSkills = candidate.project_analysis?.project_skills || [];

  if (matched[0]) {
    questions.push(`Can you explain one project where you used ${matched[0]} in a practical way?`);
  }

  if (matched[1]) {
    questions.push(`What challenges did you face while working with ${matched[1]}, and how did you solve them?`);
  }

  if (projectSkills.length) {
    questions.push(`Walk me through your project using ${projectSkills.slice(0, 3).join(", ")}.`);
  }

  if (missing[0]) {
    questions.push(`The JD expects ${missing[0]}. How would you learn or handle this requirement?`);
  }

  questions.push("Why do you think your profile is suitable for this role?");

  return questions;
}

function ScoreBreakdownChart({ candidate }) {
  return (
    <div className="breakdown-chart">
      <ScoreBar label="Final Score" value={candidate.final_score} />
      <ScoreBar label="Skill Match" value={candidate.skill_match_score} />
      <ScoreBar label="Semantic Similarity" value={candidate.semantic_similarity_score} />
      <ScoreBar label="Project Relevance" value={candidate.project_relevance_score} />
      <ScoreBar label="Experience Relevance" value={candidate.experience_relevance_score} />
    </div>
  );
}

function CandidateComparison({ candidates, selectedName, onSelect }) {
  return (
    <div className="table-wrap compact-table">
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Candidate</th>
            <th>Final</th>
            <th>Skill</th>
            <th>Project</th>
            <th>Experience</th>
            <th>Review</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => (
            <tr
              className={candidate.candidate_name === selectedName ? "selected-row" : ""}
              key={`${candidate.candidate_name}-comparison`}
              onClick={() => onSelect(candidate.candidate_name)}
            >
              <td>#{candidate.rank}</td>
              <td>{candidate.candidate_name}</td>
              <td>{candidate.final_score}</td>
              <td>{candidate.skill_match_score}</td>
              <td>{candidate.project_relevance_score}</td>
              <td>{candidate.experience_relevance_score}</td>
              <td>{candidate.review_flag?.level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="metric-card">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ExplainableReport({ candidate }) {
  const report = candidate.explanation_report;

  if (!report) {
    return <p>{candidate.explanation}</p>;
  }

  return (
    <div className="report-body">
      <p>{report.summary}</p>
      <ReportList title="Candidate Summary" items={report.candidate_summary || []} />
      <div className="report-grid">
        <ReportList title="Strengths" items={report.strengths} />
        <ReportList title="Concerns" items={report.concerns} />
      </div>
      <div className="analysis-grid">
        <AnalysisCard title="Project Relevance" analysis={candidate.project_analysis} />
        <AnalysisCard title="Experience Relevance" analysis={candidate.experience_analysis} />
      </div>
      <div className="mini-stats">
        <span>{report.matched_skill_count} matched</span>
        <span>{report.missing_skill_count} missing</span>
        <span>{report.resume_skill_count} resume skills</span>
      </div>
      <strong className="recommendation">{report.recommendation}</strong>
    </div>
  );
}

function AnalysisCard({ title, analysis }) {
  if (!analysis) {
    return null;
  }

  return (
    <div className="analysis-card">
      <div>
        <strong>{title}</strong>
        <span>{analysis.score}%</span>
      </div>
      <p>{analysis.reason}</p>
    </div>
  );
}

function ReportList({ title, items }) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="report-list">
      <strong>{title}</strong>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ScoreBar({ label, value }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className="score-line">
      <div>
        <span>{label}</span>
        <strong>{safeValue}%</strong>
      </div>
      <div className="score-track">
        <span style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
