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

const POLICY_MODES = {
  baseline: "Random exploration (no learning)",
  bandit: "Thompson sampling (RL arm)",
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
      .catch((err) => setError(err?.message || "Failed to load RL data"));
  }, []);

  const toggleRlEnabled = async () => {
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
      setError(err?.message || "Failed to update RL setting");
    } finally {
      setSaving(false);
    }
  };

  const enabled = Boolean(settings?.rl_enabled);
  const actionTotal = metrics
    ? Object.values(metrics.action_distribution || {}).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <div className="review-header">
          <div className="review-brand">
            <img src={logoSrc} alt="System logo" className="review-logo" />
            <div className="admin-title-block">
              <p className="dashboard-kicker">Admin</p>
              <h2 className="dashboard-title">Recommendation Engine (RL)</h2>
              <p className="dashboard-email">
                Live view of the adaptive recommendation agent &amp; its A/B experiment.
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
          <p className="history-empty">Loading RL metrics...</p>
        ) : (
          <>
            {/* RL Status banner */}
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
                      Reinforcement Learning agent{" "}
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
                      Policy version {metrics.policy_version} · Experiment split{" "}
                      {metrics.experiment_split}% no-learning exploration baseline /{" "}
                      {100 - (metrics.experiment_split || 50)}% Thompson bandit
                    </p>
                  </div>
                </div>
                <button type="button" onClick={toggleRlEnabled} disabled={saving}>
                  {saving
                    ? "Saving..."
                    : enabled
                      ? "Turn RL Off"
                      : "Turn RL On"}
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
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Agent decisions served</p>
              </div>
              <div className="dashboard-card" style={{ textAlign: "center", padding: "18px 12px" }}>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>Reward Events (30d)</p>
                <p style={{ fontSize: 32, fontWeight: 700, margin: "4px 0", color: "var(--accent)" }}>
                  {metrics.feedback_total ?? 0}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Auto rewards after exams</p>
              </div>
              <div className="dashboard-card" style={{ textAlign: "center", padding: "18px 12px" }}>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>Baseline avg reward</p>
                <p style={{ fontSize: 32, fontWeight: 700, margin: "4px 0", color: "var(--accent)" }}>
                  {metrics.ab_groups?.baseline?.avg_reward ?? "-"}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                  Exploration arm ({metrics.ab_groups?.baseline?.feedback_count ?? 0} rewards)
                </p>
              </div>
              <div className="dashboard-card" style={{ textAlign: "center", padding: "18px 12px" }}>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>Bandit avg reward</p>
                <p style={{ fontSize: 32, fontWeight: 700, margin: "4px 0", color: "var(--accent)" }}>
                  {metrics.ab_groups?.bandit?.avg_reward ?? "-"}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                  Thompson arm ({metrics.ab_groups?.bandit?.feedback_count ?? 0} rewards)
                </p>
              </div>
            </div>

            <div className="dashboard-grid" style={{ marginBottom: 20 }}>
              {/* A/B groups table */}
              <section className="dashboard-card">
                <div className="card-header">
                  <h3>A/B Experiment — Baseline vs Bandit</h3>
                  <span className="status-note">Users split deterministically by ID hash</span>
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
                      <th style={{ textAlign: "left", padding: "8px" }}>Arm</th>
                      <th style={{ textAlign: "left", padding: "8px" }}>Policy</th>
                      <th style={{ textAlign: "left", padding: "8px" }}>Recommendations</th>
                      <th style={{ textAlign: "left", padding: "8px" }}>Rewards</th>
                      <th style={{ textAlign: "left", padding: "8px" }}>Avg Reward</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["baseline", "bandit"].map((group) => (
                      <tr key={group}>
                        <td style={{ padding: "8px", fontWeight: 700 }}>{group}</td>
                        <td style={{ padding: "8px" }}>
                          {group === "baseline" ? "Random exploration (no learning)" : "Thompson sampling"}
                        </td>
                        <td style={{ padding: "8px" }}>
                          {metrics.ab_groups?.[group]?.recommendations ?? 0}
                        </td>
                        <td style={{ padding: "8px" }}>
                          {metrics.ab_groups?.[group]?.feedback_count ?? 0}
                        </td>
                        <td style={{ padding: "8px" }}>
                          {metrics.ab_groups?.[group]?.avg_reward ?? "-"}
                        </td>
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
                {metrics.policy_mode_counts && (
                  <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 6px", fontWeight: 700 }}>
                      Decisions by policy mode
                    </p>
                    {Object.entries(metrics.policy_mode_counts).map(([mode, count]) => (
                      <p key={mode} style={{ fontSize: 13, margin: "2px 0", display: "flex", justifyContent: "space-between" }}>
                        <span>{POLICY_MODES[mode] || mode}</span>
                        <span style={{ color: "var(--text-secondary)" }}>{count}</span>
                      </p>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* How it works */}
            <section className="dashboard-card">
              <div className="card-header">
                <h3>How the RL component works (for verification)</h3>
                <span className="status-note">Live implementation</span>
              </div>
              <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, fontSize: 13.5, lineHeight: 1.55 }}>
                <li>
                  When a student opens the dashboard, the backend calls{" "}
                  <code>/recommend/next-action</code>. The user is deterministically placed into a{" "}
                  <strong>baseline</strong> (no-learning) or <strong>bandit</strong> (RL) arm using a hash
                  of their ID (50/50 when RL is enabled).
                </li>
                <li>
                  Each action has a <strong>Beta</strong> posterior — Beta(1,1), i.e. uniform, before any
                  data. The <strong>bandit arm</strong> draws one sample from each action&apos;s posterior and
                  plays the action with the highest draw (<strong>Thompson sampling</strong>), so it exploits
                  what has worked while still exploring. The baseline arm picks uniformly at random and
                  never learns.
                </li>
                <li>
                  After the student takes an exam, <code>/exam/submit</code> automatically computes a{" "}
                  <strong>reward</strong> from the score delta and pass/fail outcome and stores it as a{" "}
                  <code>feedback</code> event in <code>rl_events</code>.
                </li>
                <li>
                  Each reward updates the played action&apos;s Beta posterior (positive reward adds to the
                  success count, negative to the failure count). The agent&apos;s picks and rewards update the
                  metrics above, so the two arms can be compared over time.
                </li>
                <li>
                  Toggle the agent <strong>ON</strong> above to activate learning for the bandit arm;
                  while OFF, every user receives random (no-learning) recommendations.
                </li>
              </ol>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
