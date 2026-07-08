import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getClassAnalyticsApi } from "../api";
import { getSystemLogo } from "../systemLogo";
import { getUser } from "../auth";

export default function ClassAnalytics() {
  const logo = getSystemLogo();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [program, setProgram] = useState("");
  const [letTrack, setLetTrack] = useState("");
  const [manualProgram, setManualProgram] = useState("");
  const [sortField, setSortField] = useState("latest_score");
  const [sortDir, setSortDir] = useState("asc");
  const [search, setSearch] = useState("");

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
    loadData();
  }, [activeProgram, letTrack]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const result = await getClassAnalyticsApi(activeProgram || undefined, letTrack || undefined);
      setData(result);
    } catch (e) {
      setError(e.message || "Unknown error — check console (F12) for details");
      console.error("ClassAnalytics fetch error:", e);
    } finally {
      setLoading(false);
    }
  }

  function toggleSort(field) {
    if (sortField === field) {
      setSortDir(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  const sortedStudents = data
    ? [...data.students].filter(s =>
        search ? s.email.toLowerCase().includes(search.toLowerCase()) || s.major?.toLowerCase().includes(search.toLowerCase()) : true
      ).sort((a, b) => {
        const av = a[sortField] ?? "";
        const bv = b[sortField] ?? "";
        if (typeof av === "number") return sortDir === "asc" ? av - bv : bv - av;
        return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      })
    : [];

  const summaryItems = data ? [
    { label: "Class Average", value: `${data.summary.avg_score}%` },
    { label: "Pass Rate", value: `${data.summary.pass_rate}%` },
    { label: "Active Students", value: data.summary.active_students },
    { label: "With Exams", value: data.summary.students_with_exams },
    { label: "Total Attempts", value: data.summary.total_attempts },
  ] : [];

  const maxDist = data ? Math.max(...Object.values(data.score_distribution), 1) : 1;

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div className="dashboard-intro">
            <img src={logo} alt="" className="dashboard-logo" style={{ height: 64, width: "auto" }} />
            <div className="dashboard-text">
              <p className="dashboard-kicker">Instructor Tools</p>
              <h2 className="dashboard-title">Class-Level Performance Analytics</h2>
              <p className="dashboard-email">
                Program: <strong>{activeProgram || "All"}</strong>
                {activeProgram === "LET" && letTrack && ` (${letTrack})`}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              value={manualProgram}
              onChange={e => { setManualProgram(e.target.value); if (e.target.value !== "LET") setLetTrack(""); }}
              style={{
                padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)",
                fontSize: 13, background: "var(--surface)", color: "var(--text)",
              }}
            >
              <option value="">All Programs</option>
              <option value="LET">LET</option>
              <option value="CPA">CPA</option>
            </select>
            {manualProgram === "LET" && (
              <select
                value={letTrack}
                onChange={e => setLetTrack(e.target.value)}
                style={{
                  padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)",
                  fontSize: 13, background: "var(--surface)", color: "var(--text)",
                }}
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

        {loading && <p className="history-empty">Loading analytics...</p>}
        {error && <p className="history-empty">Error: {error}</p>}

        {data && (
          <>
            <div className="info-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)", marginBottom: 20 }}>
              {summaryItems.map(item => (
                <div key={item.label} className="dashboard-card" style={{ textAlign: "center", padding: "16px 12px" }}>
                  <p style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "var(--accent)" }}>{item.value}</p>
                  <p style={{ fontSize: 13, margin: "4px 0 0", color: "var(--text-secondary)" }}>{item.label}</p>
                </div>
              ))}
            </div>

            <div className="analytics-split">
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Subject Weakness Analysis</h3>
                </div>
                {data.subject_weakness.length === 0 ? (
                  <p className="history-empty">No subject data yet.</p>
                ) : (
                  <div style={{ maxHeight: 320, overflowY: "auto" }}>
                    {data.subject_weakness.map((sw, i) => (
                      <div key={sw.subject} style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 2 }}>
                          <span>{sw.subject}</span>
                          <span style={{ color: sw.class_avg < 60 ? "var(--danger)" : "var(--text-secondary)" }}>
                            {sw.class_avg}% avg &middot; {sw.students_below_60} below 60%
                          </span>
                        </div>
                        <div style={{ height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{
                            width: `${Math.min(sw.class_avg, 100)}%`,
                            height: "100%",
                            background: sw.class_avg < 60 ? "var(--danger)" : sw.class_avg < 75 ? "var(--warning, #f59e0b)" : "var(--success)",
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
                  <h3>Score Distribution</h3>
                </div>
                {Object.entries(data.score_distribution).map(([range, count]) => (
                  <div key={range} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 2 }}>
                      <span>{range}%</span>
                      <span>{count} students</span>
                    </div>
                    <div style={{ height: 10, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{
                        width: `${(count / maxDist) * 100}%`,
                        height: "100%",
                        background: range.startsWith("0") || range.startsWith("21") ? "var(--danger)" :
                                     range.startsWith("41") ? "var(--warning, #f59e0b)" : "var(--success)",
                        borderRadius: 4,
                        transition: "width 0.5s",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-card" style={{ marginTop: 20 }}>
              <div className="card-header">
                <h3>Student Performance</h3>
                <input
                  type="text"
                  placeholder="Search by email or major..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                    fontSize: 13,
                    width: 250,
                    background: "var(--surface)",
                    color: "var(--text)",
                  }}
                />
              </div>
              {sortedStudents.length === 0 ? (
                <p className="history-empty">No students found.</p>
              ) : (
                <div style={{ maxHeight: 500, overflowY: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--border)" }}>
                        <th style={thStyle} onClick={() => toggleSort("email")}>Email {sortField === "email" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
                        <th style={thStyle} onClick={() => toggleSort("latest_score")}>Score {sortField === "latest_score" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
                        <th style={thStyle} onClick={() => toggleSort("latest_result")}>Result {sortField === "latest_result" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
                        <th style={thStyle} onClick={() => toggleSort("total_attempts")}>Attempts {sortField === "total_attempts" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
                        <th style={thStyle}>Weak Subjects</th>
                        <th style={thStyle} onClick={() => toggleSort("track")}>Track {sortField === "track" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
                        <th style={thStyle} onClick={() => toggleSort("target_licensure")}>Program {sortField === "target_licensure" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedStudents.map(s => (
                        <tr key={s.email} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={tdStyle}>{s.email}</td>
                          <td style={{ ...tdStyle, fontWeight: 600, color: s.latest_score >= 75 ? "var(--success)" : s.latest_score >= 60 ? "var(--warning, #f59e0b)" : "var(--danger)" }}>
                            {s.latest_score}%
                          </td>
                          <td style={tdStyle}>{s.latest_result}</td>
                          <td style={tdStyle}>{s.total_attempts}</td>
                          <td style={tdStyle}>
                            {s.weak_subjects.length > 0
                              ? <span style={{ color: "var(--danger)" }}>{s.weak_subjects.join(", ")}</span>
                              : <span style={{ color: "var(--text-secondary)" }}>—</span>
                            }
                          </td>
                          <td style={tdStyle}>{s.track}</td>
                          <td style={tdStyle}>{s.target_licensure}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {data.trend.length > 1 && (
              <div className="dashboard-card" style={{ marginTop: 20 }}>
                <div className="card-header">
                  <h3>Class Performance Trend (Last 14 Days)</h3>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 120, padding: "10px 0" }}>
                  {data.trend.map((point, i) => {
                    const h = Math.max(4, (point.avg_score / 100) * 100);
                    return (
                      <div key={point.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                        <div style={{
                          width: "100%",
                          height: `${h}%`,
                          background: point.avg_score >= 75 ? "var(--success)" : point.avg_score >= 60 ? "var(--warning, #f59e0b)" : "var(--danger)",
                          borderRadius: "3px 3px 0 0",
                          minHeight: 4,
                          position: "relative",
                        }}>
                          <span style={{
                            position: "absolute",
                            top: -16,
                            left: "50%",
                            transform: "translateX(-50%)",
                            fontSize: 10,
                            whiteSpace: "nowrap",
                            color: "var(--text-secondary)",
                          }}>
                            {point.avg_score}%
                          </span>
                        </div>
                        {data.trend.length <= 7 && (
                          <span style={{ fontSize: 9, color: "var(--text-secondary)", marginTop: 2, transform: "rotate(-45deg)", whiteSpace: "nowrap" }}>
                            {point.date.slice(5)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "8px 10px",
  cursor: "pointer",
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
