import { useNavigate } from "react-router-dom";
import { getSystemLogo } from "../systemLogo";

export default function InstructorPerformance() {
  const logo = getSystemLogo();
  const navigate = useNavigate();

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div className="dashboard-intro">
            <img
              src={logo}
              alt="System logo"
              className="dashboard-logo"
              style={{ height: 64, width: "auto" }}
            />
            <div className="dashboard-text">
              <p className="dashboard-kicker">Instructor Tools</p>
              <h2 className="dashboard-title">Student Performance Hub</h2>
              <p className="dashboard-email">
                Choose a module to review class performance.
              </p>
            </div>
          </div>
        </header>

        <div className="dashboard-card actions-card">
          <div className="card-header">
            <h3>Performance Modules</h3>
            <button className="status-pill subtle" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
          <div className="action-grid">
            <button>Class-Level Performance Analytics</button>
            <button>Individual Student Performance List</button>
            <button>Topic-Based Strength and Weakness Analysis</button>
            <button>Performance Trend / Momentum Indicator</button>
            <button>Mock Board Attempt History</button>
            <button>Readiness Indicator</button>
            <button onClick={() => navigate("/instructor-exam-preview")}>
              Preview Exam Sheet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
