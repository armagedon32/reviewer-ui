import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInstructorRlMetricsApi } from "../api";
import { getSystemLogo } from "../systemLogo";
import { getUser } from "../auth";

const ACTION_LABELS = {
  subject_drill: "Focused Subject Drill",
  mixed_quiz: "Mixed Topic Quiz",
  timed_mock: "Timed Full Mock Board",
  remedial_lesson: "Remedial Lesson Block",
};

export default function InstructorRlEngine() {
  const navigate = useNavigate();
  const logoSrc = getSystemLogo();
  const [metrics, setMetrics] = useState(null);
  const [program, setProgram] = useState("");
  const [manualProgram, setManualProgram] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = getUser();
    const email = user?.email || "";
    const stored = localStorage.getItem("instructor_profile_" + email);
    if (stored) {
      try {
        const p = JSON.parse(stored);
        setProgram(p.program || "");
        setManualProgram(p.program || "");
      } catch {}
    }
  }, []);

  const activeProgram = manualProgram || program;

  useEffect(() => {
    setLoading(true);
    setError(null);
    getInstructorRlMetricsApi(activeProgram || undefined)
      .then((data) => setMetrics(data))
      .catch((err) => setError(err?.message || "Failed to load RL metrics"))
      .finally(() => setLoading(false));
  }, [activeProgram]);

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
              <p className="dashboard-kicker">Instructor Tools</p>
              <h2 className="dashboard-title">Adaptive Recommendation Engine (Simulated RL)</h2>
              <p className="dashboard-email">
                How the rule-based adaptive agent serves your students: mastery bands,
                recommended actions, and improvement over time.
              </p>
            </div>
          </div>
          <button className="review-back" onClick={() => navigate("/instructor-performance")}>
            Back to Modules
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

        {loading ? (
          <p className="history-empty">Loading adaptive engine data...</p>
        ) : !metrics ? (
          <p className="history-empty">No data available.</p>
        ) : (
          <>
            <div
              className="dashboard-card"
              style={{
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 28, lineHeight: 1 }}>🎯</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{metrics.program}</h3>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>
                    Policy version {metrics.policy_version} · {metrics.students_total} enrolled ·
                    {metrics.students_recommended} with active recommendations
                  </p>
                </div>
              </div>
              <input
                type="text"
                className="search-input"
                placeholder="Filter by program (e.g. LET, CPA)"
                value={manualProgram}
                onChange={(e) => setManualProgram(e.target.value)}
                style={{ maxWidth: 220 }}
              />
            </div>

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
                <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>Students / recommended</p>
                <p style={{ fontSize: 32, fontWeight: 700, margin: "4px 0", color: "var(--accent)" }}>
                  {metrics.students_recommended ?? 0}/{metrics.students_total ?? 0}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Students receiving adaptive actions</p>
              </div>
            </div>

            <div className="dashboard-grid" style={{ marginBottom: 20 }}>
              {/* Mastery band members */}
              <section className="dashboard-card">
                <div className="card-header">
                  <h3>Students by Mastery Band</h3>
                  <span className="status-note">Current adaptive state</span>
                </div>
                {Object.entries(metrics.band_members || {}).map(([band, members]) => (
                  <div key={band} style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 13,
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ fontWeight: 700 }}>{band}</span>
                      <span style={{ color: "var(--text-secondary)" }}>{members.length} student(s)</span>
                    </div>
                    {members.length ? (
                      <div className="history-list">
                        {members.map((m) => (
                          <div key={m.user_id} className="history-row">
                            <p className="history-title">{m.name}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="history-empty" style={{ margin: 0 }}>No students in this band yet.</p>
                    )}
                  </div>
                ))}
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
                <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 6px", fontWeight: 700 }}>
                    Decisions by mastery band
                  </p>
                  {ruleTotal === 0 ? (
                    <p style={{ fontSize: 13, margin: "2px 0", color: "var(--text-secondary)" }}>
                      No recommendations served yet.
                    </p>
                  ) : (
                    Object.entries(metrics.rule_distribution || {}).map(([band, count]) => (
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
              </section>
            </div>

            {/* Decision rules */}
            <section className="dashboard-card">
              <div className="card-header">
                <h3>Policy-like Decision Rules</h3>
                <span className="status-note">Predefined mastery-band mappings</span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
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
          </>
        )}
      </div>
    </div>
  );
}