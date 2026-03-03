import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSystemLogo } from "../systemLogo";

const MOCK_CERTIFICATES = [
  {
    id: "RUI-0C2A91F443",
    learner: "Khael Bartolome",
    category: "LET",
    issued_at: "2026-02-24",
    status: "Issued",
    verification_code: "VRF-7A8B3C9D21EF",
  },
];

const MOCK_PENDING = [
  {
    learner: "Maria Santos",
    category: "LET",
    consecutive_passes: 2,
    average_score: 78,
  },
];

export default function AdminCertificationManagement() {
  const navigate = useNavigate();
  const logoSrc = getSystemLogo();
  const [issued, setIssued] = useState(MOCK_CERTIFICATES);
  const [pending, setPending] = useState(MOCK_PENDING);
  const [message, setMessage] = useState("");

  const hasIssued = issued.length > 0;
  const hasPending = pending.length > 0;

  const stats = useMemo(
    () => ({
      issued: issued.length,
      pending: pending.length,
      revoked: issued.filter((item) => item.status === "Revoked").length,
    }),
    [issued, pending]
  );

  const approveEligibility = (index) => {
    const selected = pending[index];
    const created = {
      id: `RUI-${Math.random().toString(16).slice(2, 12).toUpperCase()}`,
      learner: selected.learner,
      category: selected.category,
      issued_at: new Date().toISOString().slice(0, 10),
      status: "Issued",
      verification_code: `VRF-${Math.random().toString(16).slice(2, 14).toUpperCase()}`,
    };
    setIssued((prev) => [created, ...prev]);
    setPending((prev) => prev.filter((_, i) => i !== index));
    setMessage(`Approved ${selected.learner} and generated certificate.`);
  };

  const revokeCertificate = (id) => {
    setIssued((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "Revoked" } : item))
    );
    setMessage("Certificate revoked.");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <div className="review-header">
          <div className="review-brand">
            <img src={logoSrc} alt="System logo" className="review-logo" />
            <div className="admin-title-block">
              <p className="dashboard-kicker">Admin</p>
              <h2 className="dashboard-title">Certification Management</h2>
              <p className="dashboard-email">
                Approve eligibility, issue certificates, revoke, and track verification codes.
              </p>
            </div>
          </div>
          <button className="review-back" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>

        {message ? (
          <section className="dashboard-card">
            <div className="status-note">{message}</div>
          </section>
        ) : null}

        <section className="dashboard-card">
          <div className="card-header">
            <h3>Overview</h3>
            <span className="status-note">Certification operations</span>
          </div>
          <div className="stats-grid">
            <article className="stat-card">
              <p className="stat-title">Issued Certificates</p>
              <p className="stat-value">{stats.issued}</p>
            </article>
            <article className="stat-card">
              <p className="stat-title">Pending Eligibility</p>
              <p className="stat-value">{stats.pending}</p>
            </article>
            <article className="stat-card">
              <p className="stat-title">Revoked Certificates</p>
              <p className="stat-value">{stats.revoked}</p>
            </article>
          </div>
        </section>

        <section className="dashboard-card">
          <div className="card-header">
            <h3>Pending Eligibility Approval</h3>
            <span className="status-note">Approve pending eligibility / manual override</span>
          </div>
          {hasPending ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "760px" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "10px" }}>Learner</th>
                    <th style={{ textAlign: "left", padding: "10px" }}>Category</th>
                    <th style={{ textAlign: "left", padding: "10px" }}>Consecutive Passes</th>
                    <th style={{ textAlign: "left", padding: "10px" }}>Average Score</th>
                    <th style={{ textAlign: "left", padding: "10px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((item, index) => (
                    <tr key={`${item.learner}-${index}`}>
                      <td style={{ padding: "10px", borderTop: "1px solid #e5eaf2" }}>{item.learner}</td>
                      <td style={{ padding: "10px", borderTop: "1px solid #e5eaf2" }}>{item.category}</td>
                      <td style={{ padding: "10px", borderTop: "1px solid #e5eaf2" }}>
                        {item.consecutive_passes}
                      </td>
                      <td style={{ padding: "10px", borderTop: "1px solid #e5eaf2" }}>{item.average_score}%</td>
                      <td style={{ padding: "10px", borderTop: "1px solid #e5eaf2" }}>
                        <button
                          type="button"
                          className="admin-action-btn"
                          onClick={() => approveEligibility(index)}
                        >
                          Approve + Generate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="status-note">No pending learner eligibility requests.</p>
          )}
        </section>

        <section className="dashboard-card">
          <div className="card-header">
            <h3>Issued Certificates</h3>
            <span className="status-note">View issued / revoke / track verification</span>
          </div>
          {hasIssued ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "920px" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "10px" }}>Certificate ID</th>
                    <th style={{ textAlign: "left", padding: "10px" }}>Learner</th>
                    <th style={{ textAlign: "left", padding: "10px" }}>Category</th>
                    <th style={{ textAlign: "left", padding: "10px" }}>Issue Date</th>
                    <th style={{ textAlign: "left", padding: "10px" }}>Verification Code</th>
                    <th style={{ textAlign: "left", padding: "10px" }}>Status</th>
                    <th style={{ textAlign: "left", padding: "10px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {issued.map((item) => (
                    <tr key={item.id}>
                      <td style={{ padding: "10px", borderTop: "1px solid #e5eaf2" }}>{item.id}</td>
                      <td style={{ padding: "10px", borderTop: "1px solid #e5eaf2" }}>{item.learner}</td>
                      <td style={{ padding: "10px", borderTop: "1px solid #e5eaf2" }}>{item.category}</td>
                      <td style={{ padding: "10px", borderTop: "1px solid #e5eaf2" }}>{item.issued_at}</td>
                      <td style={{ padding: "10px", borderTop: "1px solid #e5eaf2" }}>{item.verification_code}</td>
                      <td style={{ padding: "10px", borderTop: "1px solid #e5eaf2" }}>{item.status}</td>
                      <td style={{ padding: "10px", borderTop: "1px solid #e5eaf2" }}>
                        <button
                          type="button"
                          className="admin-action-btn subtle"
                          onClick={() => revokeCertificate(item.id)}
                          disabled={item.status === "Revoked"}
                        >
                          {item.status === "Revoked" ? "Revoked" : "Revoke"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="status-note">No certificates issued yet.</p>
          )}
        </section>

        <section className="dashboard-card">
          <div className="card-header">
            <h3>Consecutive Mock Results</h3>
            <span className="status-note">Track streaks for eligibility decision</span>
          </div>
          <p className="status-note">
            Eligibility can be approved when a learner reaches 3 consecutive passing mock board
            attempts based on category threshold.
          </p>
        </section>
      </div>
    </div>
  );
}
