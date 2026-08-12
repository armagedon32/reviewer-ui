import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getRlMetricsApi,
  getAdminSettingsApi,
  updateAdminSettingsApi,
} from "../api";
import { getSystemLogo } from "../systemLogo";

const ACTION_LABELS = {
  subject_drill: "Focused Subject Drill",
  mixed_quiz: "Mixed Topic Quiz",
  timed_mock: "Timed Full Mock Board",
  remedial_lesson: "Remedial Lesson Block",
};

export default function AdminRecommendationEngine() {
  const navigate = useNavigate();
  const logoSrc = getSystemLogo();
  const [metrics, setMetrics] = useState(null);
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getRlMetricsApi(), getAdminSettingsApi()])
      .then(([m, s]) => {
        setMetrics(m);
        setSettings(s);
      })
      .catch((err) => setError(err?.message || "Failed to load adaptive engine data"));
  }, []);

  const toggleAdaptiveEnabled = async () => {
    setSaving(true);
    setError(null);
    try {
      const next = !settings?.rl_enabled;
      const updated = await updateAdminSettingsApi({
        ...settings,
        rl_enabled: next,
      });
      setSettings(updated);
    } catch (err) {
      setError(err?.message || "Failed to update adaptive engine setting");
    } finally {
      setSaving(false);
    }
  };

  const enabled = Boolean(settings?.rl_enabled);
  const actionTotal = metrics
    ? Object.values(metrics.action_distribution || {}).reduce((a, b) => a + b, 0)
    : 0;
  const ruleTotal = metrics
    ? Object.values(metrics.rule_distribution || {}).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <div className="review-header">
          <div className="review-brand">
            <img src={logoSrc} alt="System logo" className="review-logo" />
            <div className="admin-title-block">
              <p className="dashboard-kicker">Admin</p>
              <h2 className="dashboard-title">Adaptive Recommendation Engine (Simulated RL)</h2>
              <p className="dashboard-email">
                Live view of the rule-based adaptive agent that maps learner state to
                instructional actions.
              </p>
            </div>
          </div>
          <button className="review-back" onClick={() => navigate("/admin")}>
            Back to Admin
          </button>
        </div>

        {error && (
          <div className="notice notice-error" role="status">
            <div className="notice-body">
              <p className="notice-message">{error}</p>
            </div>
            <button
              type="button"
              className="notice-close"
              aria-label="Dismiss"
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        )}

        {!metrics ? (
          <p className="history-empty">Loading adaptive engine data...</p>
        ) : (
          <>
            {/* Adaptive engine status banner */}
            <div
              className="dashboard-card"
              style={{
                marginBottom: 16,
                borderColor: enabled ? "var(--success)" : "var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 34, lineHeight: 1 }}>{enabled ? "🧠" : "💤"}</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 17 }}>
                      Adaptive recommendation engine{" "}
                      <span
                        className="status-pill"
                        style={{
                          background: enabled ? "#dcfce7" : "#f1f5f9",
                          color: enabled ? "#166534" : "#475569",
                        }}
                      >
                        {enabled ? "ENABLED" : "DISABLED"}
                      </span>
                    </h3>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>
                      Policy version {metrics.policy_version} · Rule-based adaptive logic,
                      simulated RL
                    </p>
                  </div>
                </div>
                <button type="button" onClick={toggleAdaptiveEnabled} disabled={saving}>
                  {saving
                    ? "Saving..."
                    : enabled
                      ? "Turn Adaptive Engine Off"
                      : "Turn Adaptive Engine On"}
                </button>
              </div>
            </div>

            {/* Metric cards */}
            <div className="info-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 20 }}>
              <div className="dashboard-card" style={{ textAlign: "center", padding: "18px 12px" }}>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>Recommendations (30d)</p>
                <p style={{ fontSize: 32, fontWeight: 700, margin: "4px 0", color: "var(--accent)" }}>
                  {metrics.recommendations_total ?? 0}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Adaptive decisions served</p>
              </div>
              <div className="dashboard-card" style={{ textAlign: "center", padding: "18px 12px" }}>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>Feedback Events (30d)</p>
                <p style={{ fontSize: 32, fontWeight: 700, margin: "4px 0", color: "var(--accent)" }}>
                  {metrics.feedback_total ?? 0}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Performance feedback after exams</p>
              </div>
              <div className="dashboard-card" style={{ textAlign: "center", padding: "18px 12px" }}>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>Avg performance delta</p>
                <p style={{ fontSize: 32, fontWeight: 700, margin: "4px 0", color: "var(--accent)" }}>
                  {metrics.avg_performance_delta ?? "-"}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Normalized score improvement</p>
              </div>
              <div className="dashboard-card" style={{ textAlign: "center", padding: "18px 12px" }}>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>Active decision rules</p>
                <p style={{ fontSize: 32, fontWeight: 700, margin: "4px 0", color: "var(--accent)" }}>
                  {metrics.decision_rules?.length ?? 0}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Mastery-band mappings</p>
              </div>
            </div>

            <div className="dashboard-grid" style={{ marginBottom: 20 }}>
              {/* Decision rules table */}
              <section className="dashboard-card">
                <div className="card-header">
                  <h3>Policy-like Decision Rules</h3>
                  <span className="status-note">Predefined mastery-band mappings</span>
                </div>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "8px" }}>Band</th>
                      <th style={{ textAlign: "left", padding: "8px" }}>Condition</th>
                      <th style={{ textAlign: "left", padding: "8px" }}>Action</th>
                      <th style={{ textAlign: "left", padding: "8px" }}>Difficulty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(metrics.decision_rules || []).map((rule) => (
                      <tr key={rule.band}>
                        <td style={{ padding: "8px", fontWeight: 700 }}>{rule.band}</td>
                        <td style={{ padding: "8px" }}>{rule.condition} mastery</td>
                        <td style={{ padding: "8px" }}>{rule.action_label}</td>
                        <td style={{ padding: "8px" }}>{rule.difficulty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              {/* Action distribution */}
              <section className="dashboard-card">
                <div className="card-header">
                  <h3>Recommended Action Mix</h3>
                  <span className="status-note">30-day window</span>
                </div>
                {actionTotal === 0 ? (
                  <p className="history-empty">No recommendations served yet.</p>
                ) : (
                  Object.entries(metrics.action_distribution || {}).map(([actionId, count]) => (
                    <div key={actionId} style={{ marginBottom: 10 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 13,
                          marginBottom: 4,
                        }}
                      >
                        <span>{ACTION_LABELS[actionId] || actionId}</span>
                        <span style={{ color: "var(--text-secondary)" }}>{count}</span>
                      </div>
                      <div
                        style={{
                          height: 8,
                          borderRadius: 999,
                          background: "#e2e8f0",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${(count / actionTotal) * 100}%`,
                            background: "var(--accent)",
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
                {metrics.rule_distribution && (
                  <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 6px", fontWeight: 700 }}>
                      Decisions by mastery band
                    </p>
                    {ruleTotal === 0 ? (
                      <p style={{ fontSize: 13, margin: "2px 0", color: "var(--text-secondary)" }}>
                        No recommendations served yet.
                      </p>
                    ) : (
                      Object.entries(metrics.rule_distribution).map(([band, count]) => (
                        <p
                          key={band}
                          style={{
                            fontSize: 13,
                            margin: "2px 0",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>{band}</span>
                          <span style={{ color: "var(--text-secondary)" }}>{count}</span>
                        </p>
                      ))
                    )}
                  </div>
                )}
              </section>
            </div>

            {/* How it works */}
            <section className="dashboard-card">
              <div className="card-header">
                <h3>How the simulated RL component works (for verification)</h3>
                <span className="status-note">Rule-based adaptive logic</span>
              </div>
              <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, fontSize: 13.5, lineHeight: 1.55 }}>
                <li>
                  When a student opens the dashboard, the backend calls{" "}
                  <code>/recommend/next-action</code>. It reads the learner&apos;s state: latest score,
                  average subject mastery, pass streak, and weak subject areas.
                </li>
                <li>
                  The <strong>state</strong> is mapped to an <strong>action</strong> through the
                  predefined decision rules above: below 60% mastery → remedial lessons, 60–74% →
                  guided subject drills, 75–89% → mixed quizzes, 90%+ → full timed mock boards.
                  Rules are fixed by design — no autonomous policy learning occurs.
                </li>
                <li>
                  After the student takes an exam, <code>/exam/submit</code> records{" "}
                  <strong>performance feedback</strong> — the normalized score improvement — as a{" "}
                  <code>feedback</code> event in <code>rl_events</code>. This is a performance signal,
                  not a reward used to re-train the rules.
                </li>
                <li>
                  The next recommendation reflects the updated learner state, so the agent
                  <em> adapts</em> as mastery grows. The metrics above track which rules fired and how
                  scores improved over time.
                </li>
                <li>
                  Toggle the engine <strong>ON</strong> above to serve adaptive recommendations; while
                  OFF, students receive no adaptive recommendations.
                </li>
              </ol>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
