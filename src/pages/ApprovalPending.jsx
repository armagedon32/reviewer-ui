import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessStatusApi, requestAccessApi } from "../api";
import { getUser } from "../auth";
import InlineNotice from "../components/InlineNotice";
import { getSystemLogo } from "../systemLogo";

export default function ApprovalPending() {
  const user = getUser();
  const logo = getSystemLogo();
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending");
  const [requestedAt, setRequestedAt] = useState(null);
  const [notice, setNotice] = useState(null);

  const refreshStatus = async () => {
    try {
      const data = await getAccessStatusApi();
      setStatus(data.status || "pending");
      setRequestedAt(data.requested_at || null);
      if (data.status === "approved") {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setNotice({
        type: "error",
        title: "Unable to check status",
        message: err?.message || "Please try again.",
      });
    }
  };

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const resendRequest = async () => {
    try {
      const result = await requestAccessApi();
      setStatus(result.status || "pending");
      setRequestedAt(result.requested_at || null);
      setNotice({
        type: "success",
        title: "Request sent",
        message: "Your approval request was resent.",
      });
    } catch (err) {
      setNotice({
        type: "error",
        title: "Request failed",
        message: err?.message || "Unable to resend approval request.",
      });
    }
  };

  const isExpired = status === "expired";
  const isDenied = status === "denied";

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div className="dashboard-intro">
            <img src={logo} alt="System logo" className="dashboard-logo" />
            <div className="dashboard-text">
              <p className="dashboard-kicker">Account status</p>
              <div className="dashboard-heading">
                <h2 className="dashboard-title">Approval Pending</h2>
                <div className="dashboard-status">
                  <span className="status-pill subtle">Pending</span>
                  <span className="status-note">Last sync: just now</span>
                </div>
              </div>
              <p className="dashboard-email">{user?.email}</p>
            </div>
          </div>
        </header>

        {notice && (
          <InlineNotice
            type={notice.type}
            title={notice.title}
            message={notice.message}
            onClose={() => setNotice(null)}
          />
        )}

        <div className="dashboard-grid">
          <section className="dashboard-card">
            <h3>
              {isDenied
                ? "Access denied"
                : isExpired
                  ? "Approval request expired"
                  : "Awaiting admin approval"}
            </h3>
            <p className="status-note" style={{ marginTop: 8 }}>
              {isDenied
                ? "Your account is inactive. Please contact the administrator or resend a request."
                : isExpired
                  ? "Your request timed out after 7 days. Please resend to notify the admin."
                  : "Your request is pending. Please wait for instructor/admin approval."}
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              {(isExpired || isDenied) && (
                <button style={{ width: "auto" }} onClick={resendRequest}>
                  Resend approval request
                </button>
              )}
              <button
                style={{ width: "auto", background: "#e2e8f0", color: "#0f172a" }}
                onClick={() => navigate("/dashboard")}
              >
                Back to dashboard
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
