import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteUserApi,
  getAdminSettingsApi,
  listAuditLogsApi,
  listAccessRequestsApi,
  listAccessStatusesApi,
  listUsersApi,
  approveAccessRequestApi,
  denyAccessRequestApi,
  resetUserExamsApi,
  resetUserPasswordApi,
  setUserStatusApi,
  updateAdminSettingsApi,
} from "../api";
import AlertModal from "../components/AlertModal";
import logo from "../assets/logo.png";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    exam_time_limit_minutes: 90,
    exam_question_count: 50,
  });
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [accessStatuses, setAccessStatuses] = useState({});
  const [userFilter, setUserFilter] = useState("");
  const [logQuery, setLogQuery] = useState("");
  const [logFromDate, setLogFromDate] = useState("");
  const [logToDate, setLogToDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "success",
    confirmText: "OK",
    cancelText: "",
    onConfirm: null,
    onCancel: null,
  });
  const [resetModal, setResetModal] = useState({
    open: false,
    user: null,
    submitting: false,
    error: "",
    temporaryPassword: "",
    expiresAt: "",
  });

  const closeModal = () =>
    setModal((prev) => ({
      ...prev,
      open: false,
    }));

  const showModal = (payload) =>
    setModal({
      open: true,
      title: payload.title,
      message: payload.message,
      type: payload.type || "success",
      confirmText: payload.confirmText || "OK",
      cancelText: payload.cancelText || "",
      onConfirm: payload.onConfirm || closeModal,
      onCancel: payload.onCancel || closeModal,
    });

  const openResetModal = (user) => {
    setResetModal({
      open: true,
      user,
      submitting: false,
      error: "",
      temporaryPassword: "",
      expiresAt: "",
    });
  };

  const closeResetModal = () =>
    setResetModal((prev) => ({
      ...prev,
      open: false,
      user: null,
    }));



  useEffect(() => {
    getAdminSettingsApi()
      .then((data) => {
        if (data?.exam_time_limit_minutes) {
          setSettings({
            exam_time_limit_minutes: data.exam_time_limit_minutes,
            exam_question_count: data.exam_question_count ?? 50,
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshUsers();
    const usersTimer = setInterval(refreshUsers, 5000);
    return () => clearInterval(usersTimer);
  }, []);

  useEffect(() => {
    refreshLogs();
  }, []);

  useEffect(() => {
    const refreshAccessRequests = () => {
      listAccessRequestsApi()
        .then((data) => setAccessRequests(Array.isArray(data) ? data : []))
        .catch(() => setAccessRequests([]));
      listAccessStatusesApi()
        .then((data) => {
          const map = {};
          (Array.isArray(data) ? data : []).forEach((item) => {
            if (item && typeof item.id === "number") {
              map[item.id] = {
                status: item.status,
                detail: item.detail || "",
              };
            }
          });
          setAccessStatuses(map);
        })
        .catch(() => setAccessStatuses({}));
    };
    refreshAccessRequests();
    const timer = setInterval(refreshAccessRequests, 5000);
    return () => clearInterval(timer);
  }, []);

  const refreshUsers = () => {
    listUsersApi()
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));
  };

  const refreshLogs = () => {
    listAuditLogsApi()
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .catch(() => setLogs([]));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updated = await updateAdminSettingsApi(settings);
      setSettings({
        exam_time_limit_minutes: updated.exam_time_limit_minutes,
        exam_question_count: updated.exam_question_count ?? settings.exam_question_count,
      });
      showModal({
        title: "Settings saved",
        message: "Exam settings updated successfully.",
      });
      refreshLogs();
    } catch (err) {
      const message =
        typeof err?.message === "string"
          ? err.message
          : "Failed to update settings";
      setError(message);
      showModal({
        title: "Save failed",
        message,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDisable = (user) => {
    showModal({
      title: user.active ? "Disable user?" : "Enable user?",
      message: user.active
        ? `Disable ${user.email}? They will not be able to log in.`
        : `Enable ${user.email}? They will regain access.`,
      type: "error",
      confirmText: user.active ? "Disable" : "Enable",
      cancelText: "Cancel",
      onConfirm: async () => {
        closeModal();
        try {
          await setUserStatusApi(user.id, !user.active);
          refreshUsers();
          refreshLogs();
          showModal({
            title: "User updated",
            message: `${user.email} is now ${user.active ? "inactive" : "active"}.`,
          });
        } catch (err) {
          showModal({
            title: "Update failed",
            message: err?.message || "Failed to update user status",
            type: "error",
          });
        }
      },
    });
  };

  const confirmResetExams = (user) => {
    showModal({
      title: "Reset exams?",
      message: `Delete all exam results for ${user.email}?`,
      type: "error",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        closeModal();
        try {
          await resetUserExamsApi(user.id);
          refreshLogs();
          showModal({
            title: "Exams reset",
            message: `Exam results cleared for ${user.email}.`,
          });
        } catch (err) {
          showModal({
            title: "Reset failed",
            message: err?.message || "Failed to reset exams",
            type: "error",
          });
        }
      },
    });
  };

  const confirmDelete = (user) => {
    showModal({
      title: "Delete user?",
      message: `Permanently delete ${user.email}? This cannot be undone.`,
      type: "error",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        closeModal();
        try {
          await deleteUserApi(user.id);
          refreshUsers();
          refreshLogs();
          showModal({
            title: "User deleted",
            message: `${user.email} has been removed.`,
          });
        } catch (err) {
          showModal({
            title: "Delete failed",
            message: err?.message || "Failed to delete user",
            type: "error",
          });
        }
      },
    });
  };

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    if (!resetModal.user) return;
    setResetModal((prev) => ({ ...prev, submitting: true, error: "" }));
    try {
      const data = await resetUserPasswordApi(resetModal.user.id);
      setResetModal((prev) => ({
        ...prev,
        submitting: false,
        temporaryPassword: data.temporary_password || "",
        expiresAt: data.expires_at || "",
      }));
      refreshLogs();
    } catch (err) {
      setResetModal((prev) => ({
        ...prev,
        submitting: false,
        error: err?.message || "Failed to reset password",
      }));
    }
  };



  const handleApproveRequest = async (request) => {
    try {
      await approveAccessRequestApi(request.id);
      setAccessRequests((prev) => prev.filter((item) => item.id !== request.id));
      showModal({
        title: "Access granted",
        message: `${request.email} can now access the dashboard.`,
      });
      refreshUsers();
      refreshLogs();
      listAccessStatusesApi()
        .then((data) => {
          const map = {};
          (Array.isArray(data) ? data : []).forEach((item) => {
            if (item && typeof item.id === "number") {
              map[item.id] = {
                status: item.status,
                detail: item.detail || "",
              };
            }
          });
          setAccessStatuses(map);
        })
        .catch(() => {});
    } catch (err) {
      showModal({
        title: "Approval failed",
        message: err?.message || "Unable to approve access.",
        type: "error",
      });
    }
  };

  const handleRejectRequest = async (request) => {
    try {
      await denyAccessRequestApi(request.id);
      setAccessRequests((prev) => prev.filter((item) => item.id !== request.id));
      showModal({
        title: "Access denied",
        message: `${request.email} is marked as inactive.`,
        type: "error",
      });
      refreshUsers();
      refreshLogs();
      listAccessStatusesApi()
        .then((data) => {
          const map = {};
          (Array.isArray(data) ? data : []).forEach((item) => {
            if (item && typeof item.id === "number") {
              map[item.id] = {
                status: item.status,
                detail: item.detail || "",
              };
            }
          });
          setAccessStatuses(map);
        })
        .catch(() => {});
    } catch (err) {
      showModal({
        title: "Rejection failed",
        message: err?.message || "Unable to deny access.",
        type: "error",
      });
    }
  };

  const filteredUsers = users.filter((user) => {
    const term = userFilter.trim().toLowerCase();
    if (!term) return true;
    return (
      user.email?.toLowerCase().includes(term) ||
      user.role?.toLowerCase().includes(term)
    );
  });

  const accessLabelFor = (user) => {
    const status = accessStatuses[user.id]?.status;
    if (status === "approved") return "Active";
    if (status === "denied") return "Denied";
    if (status === "expired") return "Expired";
    return "Pending";
  };


  const accessClassFor = (user) => {
    const status = accessStatuses[user.id]?.status;
    if (status === "approved") return "pass";
    if (status === "denied") return "fail";
    if (status === "expired") return "subtle";
    return "subtle";
  };

  const canApproveUser = (user) => {
    if (user.role === "admin") return false;
    const status = accessStatuses[user.id]?.status;
    return status !== "approved";
  };

  const filteredLogs = logs.filter((log) => {
    const query = logQuery.trim().toLowerCase();
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

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <div className="review-header">
          <div className="review-brand">
            <img src={logo} alt="System logo" className="review-logo" />
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
            <h3>Exam Timer</h3>
            <span className="status-note">Applies to all new exams</span>
          </div>
          <form onSubmit={handleSave} className="admin-form">
            <div className="admin-form-grid">
              <div className="admin-form-field">
                <label htmlFor="examTime">Time limit (minutes)</label>
                <input
                  id="examTime"
                  type="number"
                  min="10"
                  max="240"
                  value={settings.exam_time_limit_minutes}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      exam_time_limit_minutes: Number(event.target.value),
                    }))
                  }
                  required
                />
              </div>
              <div className="admin-form-field">
                <label htmlFor="examCount">Exam items</label>
                <input
                  id="examCount"
                  type="number"
                  min="10"
                  max="200"
                  value={settings.exam_question_count}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      exam_question_count: Number(event.target.value),
                    }))
                  }
                  required
                />
              </div>
              {error && <p className="error-text admin-form-error">{error}</p>}
              <div className="admin-form-actions">
                <button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </div>
          </form>
        </section>

        <section className="dashboard-card">
          <div className="card-header">
            <h3>Users</h3>
            <span className="status-note">{users.length} total</span>
          </div>
          <div className="admin-search">
            <input
              type="text"
              placeholder="Search users by email or role..."
              value={userFilter}
              onChange={(event) => setUserFilter(event.target.value)}
            />
          </div>
          {filteredUsers.length ? (
            <div className="admin-user-list">
              {filteredUsers.map((user) => (
                <div key={user.id} className="admin-user-row">
                  <div>
                    <p className="admin-user-email">{user.email}</p>
                    <p className="admin-user-meta">
                      {user.role} - {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="admin-user-actions">
                    <button
                      className={`admin-action-btn ${accessClassFor(user)}`}
                      onClick={() => confirmDisable(user)}
                      disabled={accessStatuses[user.id]?.status !== "approved"}
                    >
                      {accessLabelFor(user)}
                    </button>
                    {canApproveUser(user) && (
                      <>
                        <button
                          className="admin-action-btn warning"
                          onClick={() => handleApproveRequest(user)}
                        >
                          Approve
                        </button>
                        <button
                          className="admin-action-btn fail"
                          onClick={() => handleRejectRequest(user)}
                        >
                          Deny
                        </button>
                      </>
                    )}
                    <button
                      className="admin-action-btn subtle"
                      onClick={() => confirmResetExams(user)}
                    >
                      Reset Exams
                    </button>
                    <button
                      className="admin-action-btn warning"
                      onClick={() => openResetModal(user)}
                    >
                      Reset Password
                    </button>
                    <button
                      className="admin-action-btn subtle"
                      disabled={user.active}
                      onClick={() => confirmDelete(user)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="history-empty">No users yet.</p>
          )}
        </section>

        <section className="dashboard-card">
          <div className="card-header">
            <h3>Audit Logs</h3>
            <span className="status-note">Latest 100 events</span>
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
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="history-empty">No audit logs found.</p>
          )}
        </section>
      </div>
      <AlertModal
        isOpen={modal.open}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        onConfirm={modal.onConfirm || closeModal}
        onCancel={modal.onCancel || closeModal}
      />
      {resetModal.open && (
        <div className="alert-overlay">
          <div className="alert-modal reset-password-modal">
            <h3 className="alert-title">Reset password</h3>
            <p className="alert-message">
              Issue a temporary password for {resetModal.user?.email}.
            </p>
            <form onSubmit={handlePasswordReset} className="admin-form">
              <div className="admin-form-grid">
                <div className="admin-form-actions">
                  <button type="button" onClick={closeResetModal}>
                    Close
                  </button>
                  <button type="submit" disabled={resetModal.submitting}>
                    {resetModal.submitting ? "Resetting..." : "Issue reset"}
                  </button>
                </div>
                {resetModal.error && (
                  <p className="error-text admin-form-error">{resetModal.error}</p>
                )}
                {resetModal.temporaryPassword && (
                  <p className="status-note reset-password-result">
                    Temporary password:{" "}
                    <strong>{resetModal.temporaryPassword}</strong>
                    {resetModal.expiresAt
                      ? ` (expires ${new Date(resetModal.expiresAt).toLocaleString()})`
                      : ""}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
