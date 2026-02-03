import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import InlineNotice from "../components/InlineNotice";
import {
  approveAccessRequestApi,
  createUserApi,
  deleteUserApi,
  denyAccessRequestApi,
  listAccessStatusesApi,
  listUsersApi,
  resetSelectedStudentExamsApi,
  resetUserExamsApi,
  resetUserPasswordApi,
  setUserStatusApi,
} from "../api";
import { getSystemLogo } from "../systemLogo";

export default function AdminUserManagement() {
  const navigate = useNavigate();
  const logoSrc = getSystemLogo();
  const [users, setUsers] = useState([]);
  const [accessStatuses, setAccessStatuses] = useState({});
  const [userFilter, setUserFilter] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [notice, setNotice] = useState(null);

  const [createForm, setCreateForm] = useState({
    email: "",
    role: "student",
    password: "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const refreshUsers = () => {
    listUsersApi()
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));
    listAccessStatusesApi()
      .then((data) => {
        const map = {};
        (Array.isArray(data) ? data : []).forEach((item) => {
          if (item?.id != null) {
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

  useEffect(() => {
    refreshUsers();
    const timer = setInterval(refreshUsers, 5000);
    return () => clearInterval(timer);
  }, []);

  const filteredUsers = useMemo(() => {
    const term = userFilter.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (user) =>
        user.email?.toLowerCase().includes(term) ||
        user.role?.toLowerCase().includes(term)
    );
  }, [users, userFilter]);

  const showNotice = (payload) => setNotice(payload);

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      const payload = {
        email: createForm.email,
        role: createForm.role,
      };
      if (createForm.password) {
        payload.password = createForm.password;
      }
      const created = await createUserApi(payload);
      setCreateForm({ email: "", role: "student", password: "" });
      refreshUsers();
      showNotice({
        type: "success",
        title: "User created",
        message: created?.temporary_password
          ? `Temporary password: ${created.temporary_password}`
          : "User account created successfully.",
      });
    } catch (err) {
      setCreateError(err?.message || "Unable to create user.");
    } finally {
      setCreating(false);
    }
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let output = "";
    for (let i = 0; i < 12; i += 1) {
      output += chars[Math.floor(Math.random() * chars.length)];
    }
    setCreateForm((prev) => ({ ...prev, password: output }));
  };

  const toggleStudentSelection = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    );
  };

  const resetSelectedExams = async () => {
    if (!selectedStudentIds.length) return;
    try {
      await resetSelectedStudentExamsApi(selectedStudentIds);
      setSelectedStudentIds([]);
      showNotice({
        type: "success",
        title: "Selected exams reset",
        message: "Exam history reset for selected students.",
      });
    } catch (err) {
      showNotice({
        type: "error",
        title: "Reset failed",
        message: err?.message || "Unable to reset selected exams.",
      });
    }
  };

  const handleApproveRequest = async (user) => {
    try {
      await approveAccessRequestApi(user.id);
      refreshUsers();
      showNotice({
        type: "success",
        title: "Access granted",
        message: `${user.email} can now access the dashboard.`,
      });
    } catch (err) {
      showNotice({
        type: "error",
        title: "Approve failed",
        message: err?.message || "Unable to approve access.",
      });
    }
  };

  const handleRejectRequest = async (user) => {
    try {
      await denyAccessRequestApi(user.id);
      refreshUsers();
      showNotice({
        type: "warning",
        title: "Access denied",
        message: `${user.email} access was denied.`,
      });
    } catch (err) {
      showNotice({
        type: "error",
        title: "Deny failed",
        message: err?.message || "Unable to deny access.",
      });
    }
  };

  const handleResetExams = async (user) => {
    try {
      await resetUserExamsApi(user.id);
      showNotice({
        type: "success",
        title: "Exams reset",
        message: `Exam history reset for ${user.email}.`,
      });
    } catch (err) {
      showNotice({
        type: "error",
        title: "Reset failed",
        message: err?.message || "Unable to reset exams.",
      });
    }
  };

  const handleResetPassword = async (user) => {
    try {
      const data = await resetUserPasswordApi(user.id);
      showNotice({
        type: "success",
        title: "Password reset",
        message: data?.temporary_password
          ? `Temporary password: ${data.temporary_password}`
          : "Temporary password issued.",
      });
      refreshUsers();
    } catch (err) {
      showNotice({
        type: "error",
        title: "Reset failed",
        message: err?.message || "Unable to reset password.",
      });
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await setUserStatusApi(user.id, !user.active);
      refreshUsers();
    } catch (err) {
      showNotice({
        type: "error",
        title: "Update failed",
        message: err?.message || "Unable to update user status.",
      });
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      await deleteUserApi(user.id);
      refreshUsers();
      showNotice({
        type: "success",
        title: "User deleted",
        message: `${user.email} removed.`,
      });
    } catch (err) {
      showNotice({
        type: "error",
        title: "Delete failed",
        message: err?.message || "Unable to delete user.",
      });
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <div className="review-header">
          <div className="review-brand">
            <img src={logoSrc} alt="System logo" className="review-logo" />
            <div className="admin-title-block">
              <p className="dashboard-kicker">Admin</p>
              <h2 className="dashboard-title">User Management</h2>
              <p className="dashboard-email">Create, approve, and manage users.</p>
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
            <h3>Create User</h3>
            <span className="status-note">{users.length} total</span>
          </div>
          <form onSubmit={handleCreateUser} className="admin-form">
            <div className="admin-form-grid">
              <div className="admin-form-field">
                <label htmlFor="createEmail">Email</label>
                <input
                  id="createEmail"
                  type="email"
                  value={createForm.email}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="admin-form-field">
                <label htmlFor="createRole">Role</label>
                <select
                  id="createRole"
                  value={createForm.role}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, role: event.target.value }))
                  }
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="admin-form-field">
                <label htmlFor="createPassword">Password (optional, auto-generated if blank)</label>
                <div className="admin-inline">
                  <input
                    id="createPassword"
                    type="text"
                    value={createForm.password}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, password: event.target.value }))
                    }
                    placeholder="Leave blank to auto-generate"
                  />
                  <button type="button" className="admin-inline-btn" onClick={generatePassword}>
                    Generate
                  </button>
                </div>
              </div>
              {createError && <p className="error-text admin-form-error">{createError}</p>}
              <div className="admin-form-actions">
                <button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create User"}
                </button>
              </div>
            </div>
          </form>
        </section>

        <section className="dashboard-card">
          <div className="card-header">
            <h3>Users ({filteredUsers.length})</h3>
            <span className="status-note">Manage user accounts and access</span>
          </div>
          <div className="admin-search">
            <input
              type="text"
              placeholder="Search users by email or role..."
              value={userFilter}
              onChange={(event) => setUserFilter(event.target.value)}
            />
          </div>
          <div className="admin-bulk-actions">
            <p className="status-note">Selected students: {selectedStudentIds.length}</p>
            <div className="admin-bulk-buttons">
              <button
                type="button"
                className="admin-action-btn warning"
                disabled={!selectedStudentIds.length}
                onClick={resetSelectedExams}
              >
                Reset Selected Exams
              </button>
              <button
                type="button"
                className="admin-action-btn subtle"
                disabled={!selectedStudentIds.length}
                onClick={() => setSelectedStudentIds([])}
              >
                Clear Selection
              </button>
            </div>
          </div>

          {filteredUsers.length ? (
            <>
              <div className="admin-user-header">
                <span>Select</span>
                <span>User Details</span>
                <span>Actions</span>
              </div>
              <div className="admin-user-list">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="admin-user-row">
                    <label className="admin-user-check">
                      <input
                        type="checkbox"
                        disabled={user.role !== "student"}
                        checked={selectedStudentIds.includes(user.id)}
                        onChange={() => toggleStudentSelection(user.id)}
                      />
                    </label>
                    <div className="admin-user-details">
                      <p className="admin-user-email">{user.email}</p>
                      <p className="admin-user-meta">
                        {user.role} -{" "}
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                    <div className="admin-user-actions">
                      {accessStatuses[user.id]?.status === "pending" && (
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
                        onClick={() => handleToggleActive(user)}
                      >
                        {user.active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        className="admin-action-btn subtle"
                        onClick={() => handleResetExams(user)}
                      >
                        Reset Exams
                      </button>
                      <button
                        className="admin-action-btn warning"
                        onClick={() => handleResetPassword(user)}
                      >
                        Reset Password
                      </button>
                      <button
                        className="admin-action-btn subtle"
                        onClick={() => handleDeleteUser(user)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="history-empty">No users yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
