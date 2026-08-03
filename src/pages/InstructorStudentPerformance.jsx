import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getClassAnalyticsApi, getStudentPerformanceApi } from "../api";
import { getSystemLogo } from "../systemLogo";
import { getUser } from "../auth";

const EMPTY_DETAIL = null;

function nameOf(profile) {
  return [profile.first_name, profile.middle_name, profile.last_name].filter(Boolean).join(" ") || "—";
}

export default function InstructorStudentPerformance() {
  const logo = getSystemLogo();
  const navigate = useNavigate();

  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [program, setProgram] = useState("");
  const [letTrack, setLetTrack] = useState("");
  const [manualProgram, setManualProgram] = useState("");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("latest_score");
  const [sortDir, setSortDir] = useState("asc");

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(EMPTY_DETAIL);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  useEffect(() => {
    const user = getUser();
    const email = user?.email || "";
    const stored = localStorage.getItem("instructor_profile_" + email);
    if (stored) {
      try {
        const p = JSON.parse(stored);
        setProgram(p.program || "");
        setManualProgram(p.program || "");
        setLetTrack(p.let_track || "");
      } catch {}
    }
  }, []);

  const activeProgram = manualProgram || program;

  useEffect(() => {
    loadRoster();
  }, [activeProgram, letTrack]);

  async function loadRoster() {
    setLoading(true);
    setError(null);
    try {
      const result = await getClassAnalyticsApi(activeProgram || undefined, letTrack || undefined);
      setRoster(result.students || []);
    } catch (e) {
      setError(e.message || "Failed to load student list");
    } finally {
      setLoading(false);
    }
  }

  async function openStudent(userId) {
    setSelectedId(userId);
    setDetail(EMPTY_DETAIL);
    setDetailLoading(true);
    setDetailError(null);
    try {
      const result = await getStudentPerformanceApi(userId);
      setDetail(result);
    } catch (e) {
      setDetailError(e.message || "Failed to load student details");
    } finally {
      setDetailLoading(false);
    }
  }

  function toggleSort(field) {
    if (sortField === field) {
      setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  const filtered = roster
    .filter(s =>
      search
        ? s.email.toLowerCase().includes(search.toLowerCase()) ||
          (s.major || "").toLowerCase().includes(search.toLowerCase()) ||
          (s.target_licensure || "").toLowerCase().includes(search.toLowerCase())
        : true
    )
    .sort((a, b) => {
      const av = a[sortField] ?? "";
      const bv = b[sortField] ?? "";
      if (typeof av === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

  const profile = detail?.profile || {};
  const stats = detail?.stats || {};
  const maxSubj = detail
    ? Math.max(...detail.subject_breakdown.map(s => s.avg_percentage), 1)
    : 1;
  const maxTrend = detail
    ? Math.max(...detail.trend.map(t => t.score), 1)
    : 1;

  const readinessColor =
    detail?.readiness?.level === "high"
      ? "var(--success)"
      : detail?.readiness?.level === "moderate"
      ? "var(--success)"
      : detail?.readiness?.level === "developing"
      ? "var(--warning, #f59e0b)"
      : detail?.readiness?.level === "risk"
      ? "var(--danger)"
      : "var(--text-secondary)";

  const statItems = detail
    ? [
        { label: "Total Attempts", value: stats.total_attempts ?? 0 },
        { label: "Average Score", value: `${stats.avg_score ?? 0}%` },
        { label: "Latest Score", value: `${stats.latest_score ?? 0}%` },
        { label: "Pass Rate", value: `${stats.pass_rate ?? 0}%` },
        { label: "Best Score", value: `${stats.best_score ?? 0}%` },
      ]
    : [];

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div className="dashboard-intro">
            <img src={logo} alt="" className="dashboard-logo" style={{ height: 64, width: "auto" }} />
            <div className="dashboard-text">
              <p className="dashboard-kicker">Instructor Tools</p>
              <h2 className="dashboard-title">Individual Student Performance</h2>
              <p className="dashboard-email">
                Select a student to view their detailed performance.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              value={manualProgram}
              onChange={e => {
                setManualProgram(e.target.value);
                if (e.target.value !== "LET") setLetTrack("");
              }}
              style={selectStyle}
            >
              <option value="">All Programs</option>
              <option value="LET">LET</option>
              <option value="CPA">CPA</option>
            </select>
            {manualProgram === "LET" && (
              <select
                value={letTrack}
                onChange={e => setLetTrack(e.target.value)}
                style={selectStyle}
              >
                <option value="">All Tracks</option>
                <option value="Elementary">Elementary</option>
                <option value="Secondary">Secondary</option>
              </select>
            )}
            <button className="status-pill subtle" onClick={() => navigate("/instructor-performance")}>
              Back
            </button>
          </div>
        </header>

        {loading && <p className="history-empty">Loading student list...</p>}
        {error && <p className="history-empty">Error: {error}</p>}

        {!loading && !error && (
          <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "start" }}>
            {/* Student roster */}
            <div className="dashboard-card" style={{ maxHeight: "calc(100vh - 220px)", display: "flex", flexDirection: "column" }}>
              <div className="card-header">
                <h3>Students ({filtered.length})</h3>
              </div>
              <input
                type="text"
                placeholder="Search student..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...selectStyle, width: "100%", marginBottom: 10 }}
              />
              <div style={{ overflowY: "auto", flex: 1 }}>
                {filtered.length === 0 ? (
                  <p className="history-empty">No students found.</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--border)" }}>
                        <th style={{ ...thStyle, cursor: "pointer" }} onClick={() => toggleSort("email")}>
                          Email {sortField === "email" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th style={{ ...thStyle, cursor: "pointer", textAlign: "center" }} onClick={() => toggleSort("latest_score")}>
                          Score {sortField === "latest_score" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(s => (
                        <tr
                          key={s.user_id || s.email}
                          onClick={() => openStudent(s.user_id)}
                          style={{
                            cursor: "pointer",
                            borderBottom: "1px solid var(--border)",
                            background: selectedId === s.user_id ? "var(--surface-alt, rgba(128,128,128,0.08))" : "transparent",
                          }}
                        >
                          <td style={{ ...tdStyle, padding: "8px 10px" }}>
                            <div style={{ fontWeight: 600 }}>{s.email}</div>
                            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                              {s.target_licensure || "—"}
                              {s.major && s.major !== "Unspecified" ? ` · ${s.major}` : ""}
                            </div>
                          </td>
                          <td
                            style={{
                              ...tdStyle,
                              padding: "8px 10px",
                              textAlign: "center",
                              fontWeight: 600,
                              color:
                                s.latest_score >= 75
                                  ? "var(--success)"
                                  : s.latest_score >= 60
                                  ? "var(--warning, #f59e0b)"
                                  : "var(--danger)",
                            }}
                          >
                            {s.latest_score}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Detail panel */}
            <div>
              {detailLoading && <p className="history-empty">Loading student details...</p>}
              {detailError && <p className="history-empty">Error: {detailError}</p>}

              {detail && !detailLoading && !detailError && (
                <>
                  <div className="dashboard-card">
                    <div className="card-header">
                      <h3>Student Profile</h3>
                      <span className="status-pill subtle">
                        {profile.target_licensure || "No licensure"}
                      </span>
                    </div>
                    <div className="info-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                      <Info label="Full Name" value={nameOf(profile)} />
                      <Info label="Student ID" value={profile.student_id_number || "—"} />
                      <Info label="Email" value={profile.email || "—"} />
                      <Info label="Program / Degree" value={profile.program_degree || "—"} />
                      <Info label="Year Level" value={profile.year_level ? String(profile.year_level) : "—"} />
                      <Info label="Section / Class" value={profile.section_class || "—"} />
                      <Info label="Track / Specialization" value={profile.major_specialization || profile.let_track || "—"} />
                      <Info label="Passing Threshold" value={`${profile.required_passing_threshold ?? 75}%`} />
                    </div>
                  </div>

                  <div className="info-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)", marginTop: 16 }}>
                    {statItems.map(item => (
                      <div key={item.label} className="dashboard-card" style={{ textAlign: "center", padding: "16px 12px" }}>
                        <p style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "var(--accent)" }}>{item.value}</p>
                        <p style={{ fontSize: 12, margin: "4px 0 0", color: "var(--text-secondary)" }}>{item.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="dashboard-card" style={{ marginTop: 16 }}>
                    <div className="card-header">
                      <h3>Readiness Indicator</h3>
                      <span className="status-pill subtle" style={{ color: readinessColor, borderColor: readinessColor }}>
                        {detail.readiness.label}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 12px" }}>
                      Based on the average of the last 3 attempts and overall pass rate.
                    </p>
                    {detail.weak_subjects.length > 0 && (
                      <p style={{ fontSize: 13, margin: 0 }}>
                        Weak subjects:{" "}
                        <span style={{ color: "var(--danger)" }}>{detail.weak_subjects.join(", ")}</span>
                      </p>
                    )}
                  </div>

                  <div className="analytics-split">
                    <div className="dashboard-card">
                      <div className="card-header">
                        <h3>Subject Performance</h3>
                      </div>
                      {detail.subject_breakdown.length === 0 ? (
                        <p className="history-empty">No subject data yet.</p>
                      ) : (
                        <div style={{ maxHeight: 320, overflowY: "auto" }}>
                          {detail.subject_breakdown.map(subj => (
                            <div key={subj.subject} style={{ marginBottom: 10 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 2 }}>
                                <span>{subj.subject}</span>
                                <span style={{ color: subj.avg_percentage < 60 ? "var(--danger)" : "var(--text-secondary)" }}>
                                  {subj.avg_percentage}% avg &middot; {subj.correct}/{subj.total}
                                </span>
                              </div>
                              <div style={{ height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                                <div style={{
                                  width: `${(subj.avg_percentage / maxSubj) * 100}%`,
                                  height: "100%",
                                  background:
                                    subj.avg_percentage < 60
                                      ? "var(--danger)"
                                      : subj.avg_percentage < 75
                                      ? "var(--warning, #f59e0b)"
                                      : "var(--success)",
                                  borderRadius: 4,
                                  transition: "width 0.5s",
                                }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="dashboard-card">
                      <div className="card-header">
                        <h3>Score Trend</h3>
                      </div>
                      {detail.trend.length === 0 ? (
                        <p className="history-empty">No attempts yet.</p>
                      ) : (
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 120, padding: "10px 0" }}>
                          {detail.trend.map((point, i) => {
                            const h = Math.max(4, (point.score / maxTrend) * 100);
                            return (
                              <div key={`${point.date}-${i}`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                                <div style={{
                                  width: "100%",
                                  height: `${h}%`,
                                  background: point.score >= 75 ? "var(--success)" : point.score >= 60 ? "var(--warning, #f59e0b)" : "var(--danger)",
                                  borderRadius: "3px 3px 0 0",
                                  minHeight: 4,
                                }} />
                                <span style={{ fontSize: 9, color: "var(--text-secondary)", marginTop: 2, transform: "rotate(-45deg)", whiteSpace: "nowrap" }}>
                                  {point.date.slice(5)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="dashboard-card" style={{ marginTop: 16 }}>
                    <div className="card-header">
                      <h3>Mock Board Attempt History</h3>
                    </div>
                    {detail.history.length === 0 ? (
                      <p className="history-empty">No attempts recorded.</p>
                    ) : (
                      <div style={{ maxHeight: 360, overflowY: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                          <thead>
                            <tr style={{ borderBottom: "2px solid var(--border)" }}>
                              <th style={thStyle}>Date</th>
                              <th style={thStyle}>Exam Type</th>
                              <th style={thStyle}>Score</th>
                              <th style={thStyle}>Percentage</th>
                              <th style={thStyle}>Result</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detail.history.map((attempt, i) => (
                              <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                                <td style={tdStyle}>
                                  {attempt.date ? new Date(attempt.date).toLocaleString() : "—"}
                                </td>
                                <td style={tdStyle}>{attempt.exam_type || "—"}</td>
                                <td style={tdStyle}>{attempt.score}/{attempt.total}</td>
                                <td style={{ ...tdStyle, fontWeight: 600, color: attempt.percentage >= 75 ? "var(--success)" : attempt.percentage >= 60 ? "var(--warning, #f59e0b)" : "var(--danger)" }}>
                                  {attempt.percentage}%
                                </td>
                                <td style={tdStyle}>
                                  <span className="status-pill subtle">
                                    {attempt.result || "—"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}

              {!detail && !detailLoading && !detailError && (
                <div className="dashboard-card" style={{ textAlign: "center", padding: "40px 20px" }}>
                  <p style={{ fontSize: 15, margin: 0, color: "var(--text-secondary)" }}>
                    Select a student from the list to see their individual performance details.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: 12, margin: "0 0 2px", color: "var(--text-secondary)" }}>{label}</p>
      <p style={{ fontSize: 14, margin: 0, fontWeight: 600, overflowWrap: "anywhere" }}>{value}</p>
    </div>
  );
}

const selectStyle = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid var(--border)",
  fontSize: 13,
  background: "var(--surface)",
  color: "var(--text)",
};

const thStyle = {
  textAlign: "left",
  padding: "8px 10px",
  whiteSpace: "nowrap",
  userSelect: "none",
  position: "sticky",
  top: 0,
  background: "var(--surface)",
  zIndex: 1,
};

const tdStyle = {
  padding: "7px 10px",
  maxWidth: 200,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
