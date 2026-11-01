export function LoadingSkeleton() {
  return (
    <div className="skeleton-container" aria-busy="true" aria-label="Loading candidate evaluation results">
      {/* Metrics Row Skeleton */}
      <div className="metrics-row">
        {[1, 2, 3].map((i) => (
          <div key={i} className="metric-card skeleton-card">
            <div className="skeleton-box skeleton-icon" />
            <div className="skeleton-content">
              <div className="skeleton-box skeleton-text-sm" />
              <div className="skeleton-box skeleton-text-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Fairness Banner Skeleton */}
      <div className="card-box skeleton-card banner-skeleton">
        <div className="skeleton-box skeleton-icon" />
        <div className="skeleton-content" style={{ flex: 1 }}>
          <div className="skeleton-box skeleton-text-md" style={{ width: "40%" }} />
          <div className="skeleton-box skeleton-text-sm" style={{ width: "90%", marginTop: "8px" }} />
        </div>
      </div>

      {/* Ranking Leaderboard Skeleton */}
      <div className="card-box skeleton-card ranking-skeleton">
        <div className="skeleton-box skeleton-text-md" style={{ width: "25%", marginBottom: "20px" }} />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-bar-row">
            <div className="skeleton-box skeleton-rank" />
            <div className="skeleton-box skeleton-name" />
            <div className="skeleton-box skeleton-track" />
            <div className="skeleton-box skeleton-score" />
          </div>
        ))}
      </div>

      {/* Candidate Card Skeleton */}
      <div className="card-box skeleton-card candidate-skeleton">
        <div className="skeleton-header-row">
          <div className="skeleton-box skeleton-circle" />
          <div className="skeleton-content" style={{ flex: 1 }}>
            <div className="skeleton-box skeleton-text-md" style={{ width: "35%" }} />
            <div className="skeleton-box skeleton-text-sm" style={{ width: "20%", marginTop: "6px" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
