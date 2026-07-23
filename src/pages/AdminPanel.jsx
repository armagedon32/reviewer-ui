import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSystemLogo } from "../systemLogo";
import { getAdminSettingsApi, listUsersApi, getExamStatsApi, getQuestionsSummaryApi, listAccessRequestsApi } from "../api";

export default function AdminPanel() {
  const navigate = useNavigate();
  const logoSrc = getSystemLogo();
  const [stats, setStats] = useState(null);
  const [accessRequests, setAccessRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listUsersApi().catch(() => []),
      getExamStatsApi().catch(() => ({})),
      getQuestionsSummaryApi().catch(() => ({})),
      listAccessRequestsApi().catch(() => []),
    ]).then(([users, examStats, questionSummary, requests]) => {
      const adminCount = users.filter(u => u.role === "admin").length;
      const instructorCount = users.filter(u => u.role === "instructor").length;
      const studentCount = users.filter(u => u.role === "student").length;
      setStats({
        totalUsers: users.length,
        admins: adminCount,
        instructors: instructorCount,
        students: studentCount,
        avgScore: examStats.avg_score ?? "-",
        activeStudents: examStats.active_students ?? "-",
        totalAttempts: examStats.total_attempts ?? "-",
        totalQuestions: questionSummary.total ?? "-",
        letQuestions: questionSummary.let ?? "-",
        cpaQuestions: questionSummary.cpa ?? "-",
      });
      setAccessRequests(Array.isArray(requests) ? requests : []);
      setLoading(false);
    });
  }, []);

  const modules = [
    {
      title: "System Settings",
      desc: "Configure exam timing, passing thresholds & system options",
      path: "/admin/system-settings",
      icon: "⚙",
    },
    {
      title: "Exam Settings",
      desc: "Set question counts, time limits & mastery thresholds",
      path: "/admin/exam-settings",
      icon: "📝",
    },
    {
      title: "User Management",
      desc: "Manage accounts, roles & access permissions",
      path: "/admin/users",
      icon: "👥",
    },
    {
      title: "Audit Logs",
      desc: "Review system activity & security events",
      path: "/admin/audit-logs",
      icon: "📋",
    },
    {
      title: "Question Bank",
      desc: "Browse, add & manage all exam questions",
      path: "/question-bank",
      icon: "📚",
    },
    {
      title: "Certification Management",
      desc: "Configure certification programs & requirements",
      path: "/admin/certification-management",
      icon: "🎓",
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div className="dashboard-intro">
            <img src={logoSrc} alt="" className="dashboard-logo" style={{ height: 64, width: "auto" }} />
            <div className="dashboard-text">
              <p className="dashboard-kicker">Administrator</p>
              <h2 className="dashboard-title">Admin Dashboard</h2>
              <p className="dashboard-email">System overview and management controls</p>
            </div>
          </div>
          <button className="status-pill subtle" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </header>

        {loading ? (
          <p className="history-empty">Loading system data...</p>
        ) : (
          <>
            <div className="info-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 20 }}>
              <div className="dashboard-card" style={{ textAlign: "center", padding: "18px 12px" }}>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>Total Users</p>
                <p style={{ fontSize: 32, fontWeight: 700, margin: "4px 0", color: "var(--accent)" }}>{stats?.totalUsers ?? "-"}</p>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                  {stats?.admins ?? 0} A &middot; {stats?.instructors ?? 0} I &middot; {stats?.students ?? 0} S
                </p>
              </div>
              <div className="dashboard-card" style={{ textAlign: "center", padding: "18px 12px" }}>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>Exams Taken</p>
                <p style={{ fontSize: 32, fontWeight: 700, margin: "4px 0", color: "var(--accent)" }}>{stats?.totalAttempts ?? "-"}</p>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                  Avg score: {stats?.avgScore ?? "-"}%
                </p>
              </div>
              <div className="dashboard-card" style={{ textAlign: "center", padding: "18px 12px" }}>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>Question Bank</p>
                <p style={{ fontSize: 32, fontWeight: 700, margin: "4px 0", color: "var(--accent)" }}>{stats?.totalQuestions ?? "-"}</p>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                  {stats?.letQuestions ?? 0} LET &middot; {stats?.cpaQuestions ?? 0} CPA
                </p>
              </div>
              <div className="dashboard-card" style={{ textAlign: "center", padding: "18px 12px" }}>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>Pending Approvals</p>
                <p style={{
                  fontSize: 32, fontWeight: 700, margin: "4px 0",
                  color: accessRequests.length > 0 ? "var(--danger)" : "var(--success)",
                }}>
                  {accessRequests.length}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                  Instructor access requests
                </p>
              </div>
            </div>

            {accessRequests.length > 0 && (
              <div className="dashboard-card" style={{ marginBottom: 20, borderColor: "var(--danger)" }}>
                <div className="card-header">
                  <h3 style={{ color: "var(--danger)" }}>Pending Access Requests</h3>
                  <button className="status-pill subtle" onClick={() => navigate("/admin/users")}>
                    Review
                  </button>
                </div>
                {accessRequests.slice(0, 5).map((req, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", padding: "8px 0",
                    borderBottom: i < Math.min(accessRequests.length, 5) - 1 ? "1px solid var(--border)" : "none",
                    fontSize: 13,
                  }}>
                    <span>{req.email || req.user_id || "Unknown"}</span>
                    <span style={{ color: "var(--text-secondary)" }}>{req.detail || ""}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="info-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              {modules.map(m => (
                <div
                  key={m.path}
                  className="dashboard-card"
                  style={{ cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" }}
                  onClick={() => navigate(m.path)}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <span style={{ fontSize: 28, lineHeight: 1 }}>{m.icon}</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 16 }}>{m.title}</h4>
                      <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                        {m.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
