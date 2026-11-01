import { Moon, Sun, Sparkles, ShieldCheck } from "lucide-react";

export function AppHeader({ theme, onToggleTheme, onLoadSample, hasData }) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="brand-logo" aria-hidden="true">
            <span className="logo-icon">V</span>
          </div>
          <div className="brand-text">
            <div className="brand-row">
              <span className="brand-title">Veritas ATS</span>
              <span className="brand-badge">Explainable AI</span>
            </div>
            <p className="brand-tagline">Fair, interpretable resume screening & candidate ranking</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn-ghost sample-btn"
            onClick={onLoadSample}
            title="Load demo job description and candidate profiles without uploading files"
          >
            <Sparkles size={16} />
            <span>Load sample data</span>
          </button>

          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
