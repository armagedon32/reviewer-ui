import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../auth";
import { getProfileApi } from "../api";
import logo from "../assets/logo.png";

export default function Analytics() {
  const navigate = useNavigate();
  const user = getUser();
  const [profile, setProfile] = useState(null);

  const examHistory = useMemo(() => {
    const historyKey = user?.email ? `exam_history_${user.email}` : "exam_history";
    const stored = localStorage.getItem(historyKey);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }, [user?.email]);

  useEffect(() => {
    getProfileApi()
      .then((data) => setProfile(data))
      .catch(() => setProfile(null));
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

  const totalAttempts = examHistory.length;
  const passCount = examHistory.filter((entry) => entry.result === "PASS").length;
  const passRate = totalAttempts ? Math.round((passCount / totalAttempts) * 100) : 0;
  const averageScore = totalAttempts
    ? Math.round(
        examHistory.reduce((sum, entry) => sum + entry.percentage, 0) / totalAttempts
      )
    : 0;
  const badge =
    latestExam && typeof latestExam.percentage === "number"
      ? latestExam.percentage >= 90
        ? {
            color: "green",
            label: "Mastery",
            note: "Ready for certification / mock board pass",
          }
        : latestExam.percentage >= 75
          ? { color: "yellow", label: "Developing", note: "Needs targeted review" }
          : latestExam.percentage >= 60
            ? { color: "orange", label: "Guided", note: "Requires structured intervention" }
            : latestExam.percentage >= 40
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
    if (percentage >= 90) {
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
                  : "90%"}
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
                performanceTrend.map((entry, index) => (
                  <div key={`${entry.date}-${index}`} className="trend-column">
                    <div
                      className="trend-bar"
                      style={{
                        height: `${entry.percentage}%`,
                        ...trendStyleFor(entry.percentage),
                      }}
                      title={`${entry.percentage}%`}
                    />
                    <span className="trend-label">
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                  </div>
                ))
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
                <span className="metric-value">90%</span>
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
                    {weakestSubject?.value ?? 0}%) is below the 90% mastery threshold,
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
