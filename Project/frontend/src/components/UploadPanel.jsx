import { useState, useRef } from "react";
import {
  ClipboardList,
  Upload,
  FileText,
  X,
  Loader2,
  Sparkles,
  AlertCircle,
  FileCheck,
  FileUp
} from "lucide-react";
import { extractDocumentText } from "../api";

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
  const [extractingJd, setExtractingJd] = useState(false);
  const [jdUploadError, setJdUploadError] = useState("");
  const fileInputRef = useRef(null);
  const jdFileInputRef = useRef(null);

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

  async function handleJdFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setJdUploadError("");

    const filename = file.name.toLowerCase();
    if (filename.endsWith(".txt")) {
      try {
        const text = await file.text();
        setJobDescription(text.trim());
      } catch (err) {
        setJdUploadError("Failed to read text from JD file.");
      } finally {
        e.target.value = "";
      }
      return;
    }

    if (filename.endsWith(".pdf") || filename.endsWith(".docx") || filename.endsWith(".doc")) {
      setExtractingJd(true);
      try {
        const res = await extractDocumentText(file);
        if (res.text) {
          setJobDescription(res.text.trim());
        } else {
          setJdUploadError("No readable text found in the uploaded document.");
        }
      } catch (err) {
        setJdUploadError(err.message || "Failed to extract text from document.");
      } finally {
        setExtractingJd(false);
        e.target.value = "";
      }
    } else {
      setJdUploadError("Unsupported format. Use .txt, .pdf, .docx, or .doc.");
      e.target.value = "";
    }
  }

  return (
    <section className="upload-section" aria-labelledby="upload-heading">
      <div className="section-header">
        <div>
          <h2 id="upload-heading" className="section-title">Job & Candidate Intake</h2>
          <p className="section-desc">
            Provide the target job description and candidate resumes (PDF, Word DOCX/DOC, TXT) to rank matches using our 4-pillar explainable ATS.
          </p>
        </div>
        {(jobDescription || resumes.length > 0) && (
          <button
            type="button"
            className="btn-text-subtle"
            onClick={onClearAll}
            disabled={loading || extractingJd}
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
              <div className="header-actions-inline">
                <button
                  type="button"
                  className="btn-upload-jd"
                  onClick={() => jdFileInputRef.current?.click()}
                  disabled={extractingJd || loading}
                  title="Upload a JD document (.pdf, .docx, .doc, .txt)"
                >
                  {extractingJd ? (
                    <Loader2 size={13} className="spin-icon" />
                  ) : (
                    <FileUp size={13} />
                  )}
                  <span>{extractingJd ? "Extracting..." : "Upload JD document"}</span>
                </button>
                <input
                  ref={jdFileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden-file-input"
                  onChange={handleJdFileChange}
                  disabled={loading || extractingJd}
                />
                <span className="count-pill">{wordCount} words</span>
                <span className="count-pill">{charCount} chars</span>
              </div>
            </div>

            <textarea
              id="jd-textarea"
              className="form-textarea"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description, required skills, and experience expectations here, or click 'Upload JD document' above..."
              disabled={loading || extractingJd}
              rows={9}
            />

            {jdUploadError && (
              <p className="field-error-subtext">{jdUploadError}</p>
            )}

            <div className="field-footer">
              <span className="helper-hint">
                Supported for upload: PDF, Word (DOCX/DOC), TXT. Include explicit skills (e.g. Python, SQL) for best accuracy.
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
                {resumes.length} {resumes.length === 1 ? "document" : "documents"} attached
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
              aria-label="Upload candidate resumes: drop documents here or click to browse"
            >
              <div className="dropzone-icon-wrap">
                <Upload size={22} className="dropzone-icon" />
              </div>
              <div className="dropzone-text">
                <p className="dropzone-primary">
                  <span className="browse-link">Click to upload</span> or drag and drop
                </p>
                <p className="dropzone-secondary">
                  Supported formats: PDF, DOCX, DOC, TXT (up to 10MB each)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
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
              <span>Provide a job description and attach at least one resume (PDF, Word, or TXT).</span>
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
