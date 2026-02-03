import { useNavigate } from "react-router-dom";
import { getSystemLogo } from "../systemLogo";

export default function AdminPanel() {
  const navigate = useNavigate();
  const logoSrc = getSystemLogo();

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <div className="review-header">
          <div className="review-brand">
            <img src={logoSrc} alt="System logo" className="review-logo" />
            <div className="admin-title-block">
              <p className="dashboard-kicker">Admin</p>
              <h2 className="dashboard-title">System Settings</h2>
              <p className="dashboard-email">Manage exam timing and user access.</p>
            </div>
          </div>
          <button className="review-back" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>

        <section className="dashboard-card">
          <div className="card-header">
            <h3>Admin Controls</h3>
            <span className="status-note">Open a module</span>
          </div>
          <div className="admin-control-actions">
            <button type="button" onClick={() => navigate("/admin/system-settings")}>
              System Settings
            </button>
            <button type="button" onClick={() => navigate("/admin/exam-settings")}>
              Exam Settings
            </button>
            <button type="button" onClick={() => navigate("/admin/users")}>
              User Management
            </button>
            <button type="button" onClick={() => navigate("/admin/audit-logs")}>
              Audit Logs
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
