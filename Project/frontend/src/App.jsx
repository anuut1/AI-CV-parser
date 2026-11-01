import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { rankResumes } from "./api";
import { SAMPLE_JOB_DESCRIPTION, SAMPLE_RESULTS_DATA } from "./data/sampleData";
import { AppHeader } from "./components/AppHeader";
import { UploadPanel } from "./components/UploadPanel";
import { MetricsRow } from "./components/MetricsRow";
import { FairnessBanner } from "./components/FairnessBanner";
import { RankingChart } from "./components/RankingChart";
import { ScoreBreakdown } from "./components/ScoreBreakdown";
import { CandidateCard } from "./components/CandidateCard";
import { ComparisonTable } from "./components/ComparisonTable";
import { EmptyState } from "./components/EmptyState";
import { LoadingSkeleton } from "./components/LoadingSkeleton";

import "./tokens.css";
import "./styles.css";

function App() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumes, setResumes] = useState([]);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCandidateName, setSelectedCandidateName] = useState("");

  // Theme Management: light / dark mode
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("veritas_theme");
    if (saved) return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("veritas_theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  // File Handlers
  function addFiles(fileList) {
    const nextFiles = Array.from(fileList).filter((file) =>
      /\.(pdf|docx|doc|txt)$/i.test(file.name)
    );
    if (nextFiles.length === 0) {
      setError("Please select valid resume documents (.pdf, .docx, .doc, or .txt).");
      return;
    }
    setError("");
    setResumes((current) => {
      const existingNames = new Set(current.map((f) => f.name));
      const deduplicated = nextFiles.filter((f) => !existingNames.has(f.name));
      return [...current, ...deduplicated];
    });
  }

  function removeResume(fileName) {
    setResumes((current) => current.filter((file) => file.name !== fileName));
  }

  function clearAll() {
    setJobDescription("");
    setResumes([]);
    setData(null);
    setError("");
    setSelectedCandidateName("");
  }

  // Load Sample Demo Data
  function loadSampleData() {
    setError("");
    setJobDescription(SAMPLE_JOB_DESCRIPTION);
    // Create dummy files for visual chips
    const mockFiles = [
      new File([""], "aarav_patel_senior_backend.pdf", { type: "application/pdf" }),
      new File([""], "riya_mehta_fresher_developer.pdf", { type: "application/pdf" }),
      new File([""], "priya_nair_ml_engineer.pdf", { type: "application/pdf" }),
      new File([""], "vikram_singh_accounting.pdf", { type: "application/pdf" })
    ];
    setResumes(mockFiles);
    setData(SAMPLE_RESULTS_DATA);
    setSelectedCandidateName(SAMPLE_RESULTS_DATA.results[0]?.candidate_name || "");
  }

  // Form Submit: Real Backend Call
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!jobDescription.trim()) {
      setError("Please paste a job description before ranking.");
      return;
    }
    if (resumes.length === 0) {
      setError("Please attach at least one resume (.pdf or .txt).");
      return;
    }

    setLoading(true);
    setData(null);

    try {
      const result = await rankResumes(jobDescription, resumes);
      setData(result);
      if (result.results && result.results.length > 0) {
        setSelectedCandidateName(result.results[0].candidate_name);
      }
    } catch (requestError) {
      setError(
        requestError.message ||
          "Failed to connect to backend ranking service. Ensure backend is running at http://127.0.0.1:8001."
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedCandidate =
    data?.results?.find((c) => c.candidate_name === selectedCandidateName) ||
    data?.results?.[0];

  return (
    <div className="app-shell">
      <AppHeader
        theme={theme}
        onToggleTheme={toggleTheme}
        onLoadSample={loadSampleData}
        hasData={Boolean(data)}
      />

      <main className="main-content">
        <div className="content-container">
          {/* Section 1: Intake & Upload */}
          <UploadPanel
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            resumes={resumes}
            onAddFiles={addFiles}
            onRemoveResume={removeResume}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            onClearAll={clearAll}
          />

          {/* Section 2: Loading State */}
          {loading && <LoadingSkeleton />}

          {/* Section 3: Empty State */}
          {!loading && !data && (
            <EmptyState onLoadSample={loadSampleData} />
          )}

          {/* Section 4: Results Dashboard */}
          {!loading && data && (
            <div className="results-dashboard" id="results-section">
              {/* Top Metrics Row */}
              <MetricsRow results={data.results} />

              {/* Bias / Fairness Notice */}
              <FairnessBanner fairnessReport={data.fairness_report} />

              {/* Rankings Leaderboard */}
              <RankingChart
                candidates={data.results}
                selectedCandidateName={selectedCandidateName}
                onSelectCandidate={(name) => setSelectedCandidateName(name)}
              />

              {/* 4-Pillar Score Composition for Focused Candidate */}
              {selectedCandidate && (
                <ScoreBreakdown candidate={selectedCandidate} />
              )}

              {/* Side-by-Side Candidate Comparison Table */}
              <ComparisonTable
                candidates={data.results}
                selectedCandidateName={selectedCandidateName}
                onSelectCandidate={(name) => setSelectedCandidateName(name)}
              />

              {/* Detailed Candidate Cards */}
              <section className="candidates-detail-section" aria-label="Detailed candidate evaluations">
                <div className="section-header">
                  <div>
                    <h3 className="section-title">Deep Candidate Evaluations</h3>
                    <p className="section-desc">
                      Expand any candidate card to inspect strengths, concerns, missing skills, and auto-generated interview questions.
                    </p>
                  </div>
                </div>

                <div className="cards-stack">
                  {data.results.map((candidate, idx) => (
                    <CandidateCard
                      key={candidate.candidate_name}
                      candidate={candidate}
                      isInitiallyExpanded={idx === 0 || candidate.candidate_name === selectedCandidateName}
                    />
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-inner">
          <p>© 2026 Veritas ATS — Explainable AI Candidate Evaluation</p>
          <div className="footer-links">
            <span>55% Skill</span>
            <span>•</span>
            <span>25% Semantic</span>
            <span>•</span>
            <span>10% Project</span>
            <span>•</span>
            <span>10% Experience</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
