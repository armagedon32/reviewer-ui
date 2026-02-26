import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../auth";
import { getAppSettingsApi, getExamHistoryApi, getProfileApi } from "../api";
import { getSystemLogo } from "../systemLogo";

export default function Analytics() {
  const logo = getSystemLogo();
  const navigate = useNavigate();
  const user = getUser();
  const [profile, setProfile] = useState(null);
  const [examHistory, setExamHistory] = useState([]);
  const [appSettings, setAppSettings] = useState(null);

  useEffect(() => {
    const historyKey = user?.email ? `exam_history_${user.email}` : "exam_history";
    getExamHistoryApi()
      .then((data) => {
        setExamHistory(data);
        localStorage.setItem(historyKey, JSON.stringify(data));
        if (data.length === 0) {
          localStorage.removeItem(historyKey);
        }
      })
      .catch(() => {
        const stored = localStorage.getItem(historyKey);
        if (!stored) return;
        try {
          setExamHistory(JSON.parse(stored));
        } catch {
          setExamHistory([]);
        }
      });
  }, [user?.email]);

  useEffect(() => {
    getProfileApi()
      .then((data) => setProfile(data))
      .catch(() => setProfile(null));
  }, []);

  useEffect(() => {
    getAppSettingsApi()
      .then((data) => setAppSettings(data))
      .catch(() => setAppSettings(null));
  }, []);

  const latestExam = examHistory[0] || null;
  const latestSubjects = latestExam?.subject_performance || {};
  const subjectBreakdown = Object.keys(latestSubjects).length
    ? Object.entries(latestSubjects).map(([label, stat]) => ({
        label,
        value: Math.round((stat.correct / stat.total) * 100),
      }))
    : [];

  const performanceTrend = examHistory
    .slice(0, 8)
    .reverse()
    .map((entry) => ({
      date: entry.date,
      percentage: entry.percentage,
    }));
  const performanceTrendDelta = performanceTrend.length
    ? performanceTrend[performanceTrend.length - 1].percentage - performanceTrend[0].percentage
    : 0;
  const performanceTrendDirection =
    performanceTrendDelta > 0 ? "up" : performanceTrendDelta < 0 ? "down" : "flat";
  const performanceTrendLabel =
    performanceTrendDirection === "up"
      ? "Improving"
      : performanceTrendDirection === "down"
        ? "Declining"
        : "Steady";

  const totalAttempts = examHistory.length;
  const passCount = examHistory.filter((entry) => entry.result === "PASS").length;
  const passRate = totalAttempts ? Math.round((passCount / totalAttempts) * 100) : 0;
  const averageScore = totalAttempts
    ? Math.round(
        examHistory.reduce((sum, entry) => sum + entry.percentage, 0) / totalAttempts
      )
    : 0;
  const requiredThreshold =
    typeof profile?.required_passing_threshold === "number"
      ? profile.required_passing_threshold
      : typeof appSettings?.passing_threshold_default === "number"
        ? appSettings.passing_threshold_default
        : 75;
  const masteryThreshold =
    typeof appSettings?.mastery_threshold === "number" ? appSettings.mastery_threshold : 90;
  const developingThreshold = Math.max(0, masteryThreshold - 15);
  const guidedThreshold = Math.max(0, masteryThreshold - 30);
  const exploratoryThreshold = Math.max(0, masteryThreshold - 45);
  const passStreakIndex = examHistory.length
    ? examHistory.findIndex((entry) => entry.result !== "PASS")
    : -1;
  const passStreakCount = passStreakIndex === -1 ? examHistory.length : passStreakIndex;
  const streakQualified = passStreakCount >= 5;
  const latestQualified =
    latestExam && typeof latestExam.percentage === "number"
      ? latestExam.percentage >= masteryThreshold
      : false;
  const badge =
    latestExam && typeof latestExam.percentage === "number"
      ? latestExam.percentage >= masteryThreshold
        ? {
            color: "green",
            label: "Mastery",
            note: "Ready for certification / mock board pass",
          }
        : latestExam.percentage >= developingThreshold
          ? { color: "yellow", label: "Developing", note: "Needs targeted review" }
          : latestExam.percentage >= guidedThreshold
            ? { color: "orange", label: "Guided", note: "Requires structured intervention" }
            : latestExam.percentage >= exploratoryThreshold
              ? { color: "blue", label: "Exploratory", note: "Early-stage learning" }
              : { color: "red", label: "Struggling", note: "Immediate remediation" }
      : null;

  const weakestSubject = subjectBreakdown.length
    ? subjectBreakdown.reduce(
        (weakest, item) => (item.value < weakest.value ? item : weakest),
        subjectBreakdown[0]
      )
    : null;

  const readinessSteps = 2;
  const latestScore = latestExam?.percentage ?? 0;
  const prevScore = examHistory.length > 1 ? examHistory[1].percentage : latestScore;
  const baseDelta = latestScore - prevScore;
  const projectedScores = [];
  let projected = latestScore;
  let delta = baseDelta;
  for (let i = 0; i < readinessSteps; i += 1) {
    delta *= 0.7;
    projected += delta;
    projectedScores.push(Math.max(0, Math.min(100, Math.round(projected))));
  }
  const readinessLow = projectedScores.length ? Math.min(...projectedScores) : latestScore;
  const readinessHigh = projectedScores.length ? Math.max(...projectedScores) : latestScore;

  const trendStyleFor = (percentage) => {
    if (percentage >= masteryThreshold) {
      return {
        background: "linear-gradient(180deg, #16a34a, #4ade80)",
        boxShadow: "0 8px 18px rgba(22, 163, 74, 0.25)",
      };
    }
    if (percentage >= 75) {
      return {
        background: "linear-gradient(180deg, #0ea5e9, #7dd3fc)",
        boxShadow: "0 8px 18px rgba(14, 165, 233, 0.25)",
      };
    }
    if (percentage >= 60) {
      return {
        background: "linear-gradient(180deg, #f59e0b, #fcd34d)",
        boxShadow: "0 8px 18px rgba(245, 158, 11, 0.25)",
      };
    }
    if (percentage >= 40) {
      return {
        background: "linear-gradient(180deg, #f97316, #fdba74)",
        boxShadow: "0 8px 18px rgba(249, 115, 22, 0.25)",
      };
    }
    return {
      background: "linear-gradient(180deg, #ef4444, #fca5a5)",
      boxShadow: "0 8px 18px rgba(239, 68, 68, 0.25)",
    };
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <div className="review-header">
          <div className="review-brand">
            <img src={logo} alt="System logo" className="review-logo" />
            <div className="analytics-title-block">
              <p className="dashboard-kicker">Analytics</p>
              <h2 className="dashboard-title">Performance Overview</h2>
              <p className="dashboard-email">
                Actionable insights based on your recent exams.
              </p>
            </div>
          </div>
          <button className="review-back" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
        {(streakQualified || latestQualified) && (
          <section className="dashboard-card">
            <div className="card-header">
              <h3>Performance Milestone</h3>
              <span className="status-pill pass">Ready</span>
            </div>
            <p className="status-note" style={{ marginTop: 8 }}>
              {streakQualified
                ? `Congratulations! You passed ${passStreakCount} consecutive ${profile?.target_licensure || "licensure"} mock exams with ≥${requiredThreshold}%.`
                : `Congratulations! You reached the target score of ${requiredThreshold}% in your latest mock exam.`}
            </p>
            <p className="status-note" style={{ marginTop: 6 }}>
              You are now marked as READY to take the{" "}
              {profile?.target_licensure || "licensure"} examination.
            </p>
          </section>
        )}

        <section className="dashboard-card">
          <div className="card-header">
            <h3>Student Info</h3>
            <span className="status-note">Profile summary</span>
          </div>
          <div className="analytics-info-grid">
            <div className="info-item">
              <span className="info-label">Name</span>
              <span className="info-value">
                {profile
                  ? [profile.first_name, profile.middle_name, profile.last_name]
                      .filter(Boolean)
                      .join(" ")
                  : "Not set"}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{user?.email || "-"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Program</span>
              <span className="info-value">{profile?.program_degree || "Not set"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Target Licensure</span>
              <span className="info-value">{profile?.target_licensure || "Not set"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Specialization</span>
              <span className="info-value">{profile?.major_specialization || "Not set"}</span>
            </div>
            <div className="info-item badge-item">
              <span className="info-label">Badge</span>
              <div className="badge-line">
                <svg
                  className={`badge-icon ${badge ? badge.color : "muted"}`}
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                >
                  <circle cx="16" cy="12" r="8" />
                  <path d="M9 20l-1 9 8-5 8 5-1-9" />
                </svg>
                <span className="info-value">
                  {badge ? `${badge.label} Badge` : "Badge pending"}
                </span>
              </div>
              <span className={`badge-pill ${badge ? badge.color : "muted"}`}>
                {badge ? badge.note : "Take your first exam to unlock"}
              </span>
            </div>
          </div>
        </section>

        <section className="dashboard-card">
          <div className="card-header">
            <h3>Summary</h3>
            <span className="status-note">All attempts</span>
          </div>
          <div className="analytics-grid">
            <div className="metric">
              <span className="metric-label">Latest Exam</span>
              <span className="metric-value">
                {latestExam ? `${latestExam.percentage}%` : "-"}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Average</span>
              <span className="metric-value">{totalAttempts ? `${averageScore}%` : "-"}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Pass Rate</span>
              <span className="metric-value">{totalAttempts ? `${passRate}%` : "-"}</span>
            </div>
          </div>
          <div className="analytics-split">
            <div>
              <p className="analytics-label">Attempts</p>
              <p className="analytics-value">{totalAttempts}</p>
            </div>
            <div>
              <p className="analytics-label">Target</p>
              <p className="analytics-value">
                {profile?.required_passing_threshold
                  ? `${profile.required_passing_threshold}%`
                  : typeof appSettings?.passing_threshold_default === "number"
                    ? `${appSettings.passing_threshold_default}%`
                    : "75%"}
              </p>
            </div>
          </div>
        </section>

        <div className="dashboard-grid">
          <section className="dashboard-card progress-card">
            <div className="card-header">
              <h3>Improvement Trend</h3>
              <span className="trend-pill positive">
                {latestExam ? `${latestExam.percentage}%` : "No data"}
              </span>
            </div>
            <div className="trend-graph">
              {performanceTrend.length ? (
                <div className={`trend-sparkline ${performanceTrendDirection}`}>
                  <svg
                    viewBox="0 0 220 90"
                    role="img"
                    aria-label="Student performance trend"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="analyticsTrendLine" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                      <linearGradient id="analyticsTrendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(14, 165, 233, 0.35)" />
                        <stop offset="100%" stopColor="rgba(34, 197, 94, 0.05)" />
                      </linearGradient>
                    </defs>
                    <path
                      className="trend-area"
                      d={`M 0 85 ${performanceTrend
                        .map((entry, index) => {
                          const x = (index / (performanceTrend.length - 1 || 1)) * 220;
                          const y = 85 - (entry.percentage / 100) * 70;
                          return `L ${x} ${y}`;
                        })
                        .join(" ")} L 220 85 Z`}
                      fill="url(#analyticsTrendFill)"
                    />
                    <polyline
                      className="trend-line"
                      fill="none"
                      stroke="url(#analyticsTrendLine)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={performanceTrend
                        .map((entry, index) => {
                          const x = (index / (performanceTrend.length - 1 || 1)) * 220;
                          const y = 85 - (entry.percentage / 100) * 70;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />
                    {performanceTrend.map((entry, index) => {
                      const x = (index / (performanceTrend.length - 1 || 1)) * 220;
                      const y = 85 - (entry.percentage / 100) * 70;
                      return (
                        <circle
                          key={`${entry.date}-${index}`}
                          cx={x}
                          cy={y}
                          r="3.5"
                          className="trend-dot"
                        />
                      );
                    })}
                  </svg>
                  <div className="trend-footer">
                    <span className="trend-label">
                      {new Date(performanceTrend[0].date).toLocaleDateString()}
                    </span>
                    <span className="trend-note">
                      {performanceTrendLabel}
                      <strong>
                        {performanceTrendDelta > 0 ? "+" : ""}
                        {performanceTrendDelta}%
                      </strong>
                    </span>
                    <span className="trend-label">
                      {new Date(
                        performanceTrend[performanceTrend.length - 1].date
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="trend-empty">No exam data yet</div>
              )}
            </div>
            <div className="trend-metrics">
              <div className="metric">
                <span className="metric-label">Latest Exam</span>
                <span className="metric-value">
                  {latestExam ? `${latestExam.percentage}%` : "-"}
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">Average</span>
                <span className="metric-value">{totalAttempts ? `${averageScore}%` : "-"}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Target</span>
                <span className="metric-value">{`${requiredThreshold}%`}</span>
              </div>
            </div>
          </section>

          <section className="dashboard-card results-card">
            <div className="card-header">
              <h3>Results Snapshot</h3>
              <span className="status-note">Recent breakdown</span>
            </div>
            {subjectBreakdown.length ? (
              <>
                <div className="results-list">
                  {subjectBreakdown.map((item) => (
                    <div key={item.label} className="result-row">
                      <span className="result-label">{item.label}</span>
                      <div className="result-bar">
                        <span style={{ width: `${item.value}%` }} />
                      </div>
                      <span className="result-score">{item.value}%</span>
                    </div>
                  ))}
                </div>
                <div className="highlight-card">
                  <p className="highlight-title">Focus Area</p>
                  <p className="highlight-text">
                    Because your {weakestSubject?.label} accuracy (
                    {weakestSubject?.value ?? 0}%) is below the {masteryThreshold}% mastery threshold,
                    the system recommends focused remediation in this area.
                  </p>
                </div>
                <div className="forecast-card">
                  <div className="forecast-header">
                    <span className="forecast-step">LT</span>
                    <div>
                      <p className="forecast-title">Long-Term Readiness Forecast</p>
                      <p className="forecast-subtitle">
                        Based on current policy trajectory
                      </p>
                    </div>
                  </div>
                  <div className="forecast-score">
                    Predicted Readiness: {readinessLow}% - {readinessHigh}%
                  </div>
                  <ul className="forecast-bullets">
                    <li>Recent performance: {latestScore}% (latest exam)</li>
                    <li>Improvement velocity: {Math.round(baseDelta)}% per attempt</li>
                    <li>Diminishing gains assumed across {readinessSteps} future attempts</li>
                  </ul>
                </div>
              </>
            ) : (
              <p className="history-empty">No results yet.</p>
            )}
          </section>
        </div>

        <section className="dashboard-card history-card">
          <div className="card-header">
            <h3>Exam History</h3>
            <span className="status-note">Most recent results</span>
          </div>
          {examHistory.length ? (
            <div className="history-list">
              {examHistory.map((entry, index) => (
                <div key={`${entry.date}-${index}`} className="history-row">
                  <div>
                    <p className="history-title">
                      {entry.result} {entry.percentage}%
                    </p>
                    <p className="history-subtitle">
                      {new Date(entry.date).toLocaleString()}
                    </p>
                  </div>
                  <span className="history-score">
                    {entry.score}/{entry.total}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="history-empty">No exams recorded yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
