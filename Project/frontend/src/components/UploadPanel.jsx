import { useState, useRef } from "react";
import {
  ClipboardList,
  Upload,
  FileText,
  X,
  Loader2,
  Sparkles,
  AlertCircle,
  FileCheck
} from "lucide-react";

export function UploadPanel({
  jobDescription,
  setJobDescription,
  resumes,
  onAddFiles,
  onRemoveResume,
  onSubmit,
  loading,
  error,
  onClearAll
}) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const charCount = jobDescription.length;
  const wordCount = jobDescription.trim()
    ? jobDescription.trim().split(/\s+/).length
    : 0;

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddFiles(e.dataTransfer.files);
    }
  }

  function handleFileChange(e) {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(e.target.files);
      // Reset input value so re-selecting same files triggers change
      e.target.value = "";
    }
  }

  return (
    <section className="upload-section" aria-labelledby="upload-heading">
      <div className="section-header">
        <div>
          <h2 id="upload-heading" className="section-title">Job & Candidate Intake</h2>
          <p className="section-desc">
            Provide the target job description and candidate resumes to rank matches using our 4-pillar explainable ATS.
          </p>
        </div>
        {(jobDescription || resumes.length > 0) && (
          <button
            type="button"
            className="btn-text-subtle"
            onClick={onClearAll}
            disabled={loading}
          >
            Clear all
          </button>
        )}
      </div>

      <form className="upload-form" onSubmit={onSubmit}>
        <div className="intake-grid">
          {/* Left Column: Job Description */}
          <div className="card-box jd-box">
            <div className="field-header">
              <label htmlFor="jd-textarea" className="field-label">
                <ClipboardList size={17} className="field-icon" />
                <span>Job Description</span>
              </label>
              <div className="count-badges">
                <span className="count-pill">{wordCount} words</span>
                <span className="count-pill">{charCount} chars</span>
              </div>
            </div>

            <textarea
              id="jd-textarea"
              className="form-textarea"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description, required skills, preferred qualifications, and experience expectations here..."
              disabled={loading}
              rows={9}
            />

            <div className="field-footer">
              <span className="helper-hint">
                Include explicit skills (e.g. Python, SQL) and tenure requirements for best accuracy.
              </span>
            </div>
          </div>

          {/* Right Column: Resume Drop Zone & File List */}
          <div className="card-box dropzone-box">
            <div className="field-header">
              <label className="field-label">
                <FileCheck size={17} className="field-icon" />
                <span>Candidate Resumes</span>
              </label>
              <span className="count-pill primary-pill">
                {resumes.length} {resumes.length === 1 ? "resume" : "resumes"} attached
              </span>
            </div>

            <div
              className={`dropzone-surface ${dragActive ? "is-drag-active" : ""}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              aria-label="Upload candidate resumes: drop files here or click to browse"
            >
              <div className="dropzone-icon-wrap">
                <Upload size={22} className="dropzone-icon" />
              </div>
              <div className="dropzone-text">
                <p className="dropzone-primary">
                  <span className="browse-link">Click to upload</span> or drag and drop
                </p>
                <p className="dropzone-secondary">Supported formats: PDF, TXT (up to 10MB each)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                multiple
                className="hidden-file-input"
                onChange={handleFileChange}
                disabled={loading}
              />
            </div>

            {/* Uploaded File Chips */}
            {resumes.length > 0 && (
              <div className="files-container" aria-label="Attached files list">
                <div className="chips-list">
                  {resumes.map((file) => (
                    <div className="file-chip" key={file.name}>
                      <FileText size={15} className="chip-icon" />
                      <span className="chip-name" title={file.name}>
                        {file.name}
                      </span>
                      <button
                        type="button"
                        className="chip-remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveResume(file.name);
                        }}
                        disabled={loading}
                        aria-label={`Remove file ${file.name}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="form-error-banner" role="alert">
            <AlertCircle size={18} className="error-icon" />
            <div className="error-text">
              <strong>Action required:</strong> {error}
            </div>
          </div>
        )}

        <div className="form-action-bar">
          <div className="action-hint">
            {resumes.length > 0 && jobDescription.trim() ? (
              <span>Ready to evaluate {resumes.length} candidates against role criteria.</span>
            ) : (
              <span>Paste a job description and attach at least one resume to run ranking.</span>
            )}
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !jobDescription.trim() || resumes.length === 0}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin-icon" />
                <span>Evaluating Candidates...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Rank Candidates</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
