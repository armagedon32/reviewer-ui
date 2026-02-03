import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import InlineNotice from "../components/InlineNotice";
import { listAuditLogsApi } from "../api";
import { getSystemLogo } from "../systemLogo";

export default function AdminAuditLogs() {
  const navigate = useNavigate();
  const logoSrc = getSystemLogo();
  const [logs, setLogs] = useState([]);
  const [logQuery, setLogQuery] = useState("");
  const [logFromDate, setLogFromDate] = useState("");
  const [logToDate, setLogToDate] = useState("");
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    listAuditLogsApi()
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .catch((err) =>
        setNotice({
          type: "error",
          title: "Failed to load logs",
          message: err?.message || "Please try again.",
        })
      );
  }, []);

  const filteredLogs = useMemo(() => {
    const query = logQuery.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesQuery =
        !query ||
        log.action?.toLowerCase().includes(query) ||
        log.detail?.toLowerCase().includes(query);
      const createdAt = log.created_at ? new Date(log.created_at) : null;
      if (!createdAt || Number.isNaN(createdAt.getTime())) {
        return matchesQuery;
      }
      const fromDate = logFromDate ? new Date(`${logFromDate}T00:00:00`) : null;
      const toDate = logToDate ? new Date(`${logToDate}T23:59:59`) : null;
      const matchesFrom = fromDate ? createdAt >= fromDate : true;
      const matchesTo = toDate ? createdAt <= toDate : true;
      return matchesQuery && matchesFrom && matchesTo;
    });
  }, [logs, logQuery, logFromDate, logToDate]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <div className="review-header">
          <div className="review-brand">
            <img src={logoSrc} alt="System logo" className="review-logo" />
            <div className="admin-title-block">
              <p className="dashboard-kicker">Admin</p>
              <h2 className="dashboard-title">Audit Logs</h2>
              <p className="dashboard-email">Review recent admin activity.</p>
            </div>
          </div>
          <button className="review-back" onClick={() => navigate("/admin")}>
            Back to Admin
          </button>
        </div>

        {notice && (
          <InlineNotice
            type={notice.type}
            title={notice.title}
            message={notice.message}
            onClose={() => setNotice(null)}
          />
        )}

        <section className="dashboard-card">
          <div className="card-header">
            <h3>Latest Events</h3>
            <span className="status-note">Filter by date or text</span>
          </div>
          <div className="admin-log-filter">
            <input
              type="text"
              placeholder="Search action or detail..."
              value={logQuery}
              onChange={(event) => setLogQuery(event.target.value)}
            />
            <div className="admin-log-dates">
              <label>
                <span>From</span>
                <input
                  type="date"
                  value={logFromDate}
                  onChange={(event) => setLogFromDate(event.target.value)}
                />
              </label>
              <label>
                <span>To</span>
                <input
                  type="date"
                  value={logToDate}
                  onChange={(event) => setLogToDate(event.target.value)}
                />
              </label>
            </div>
          </div>
          {filteredLogs.length ? (
            <div className="admin-log-list">
              {filteredLogs.map((log) => (
                <div key={log.id} className="admin-log-row">
                  <div>
                    <p className="admin-log-action">{log.action}</p>
                    <p className="admin-log-detail">{log.detail}</p>
                  </div>
                  <span className="admin-log-date">
                    {log.created_at ? new Date(log.created_at).toLocaleString() : "-"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="history-empty">No audit logs found.</p>
          )}
        </section>
      </div>
    </div>
  );
}
