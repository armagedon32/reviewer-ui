import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import InlineNotice from "../components/InlineNotice";
import {
  approveAccessRequestApi,
  bulkDeleteUsersApi,
  createUserApi,
  deleteUserApi,
  denyAccessRequestApi,
  importUsersCsvApi,
  importCredentialsApi,
  listAccessStatusesApi,
  listUsersApi,
  resetSelectedStudentExamsApi,
resetUserExamsApi,
  resetUserPasswordApi,
  setProfileEditPermissionApi,
  setUserRoleApi,
  setUserStatusApi,
} from "../api";
import { getSystemLogo } from "../systemLogo";
import { getUser } from "../auth";

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
  const [lastImport, setLastImport] = useState(null);

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

  const currentUserEmail = getUser()?.email || "";

  const handleChangeRole = async (user, newRole) => {
    if (user.role === newRole) return;
    if (!window.confirm(`Change role of ${user.email} from "${user.role}" to "${newRole}"?`)) return;
    try {
      await setUserRoleApi(user.id, newRole);
      refreshUsers();
      showNotice({
        type: "success",
        title: "Role updated",
        message: `${user.email} is now ${newRole}.`,
      });
    } catch (err) {
      showNotice({
        type: "error",
        title: "Update failed",
        message: err?.message || "Unable to change role.",
      });
    }
  };

  const filteredStudentIds = useMemo(
    () => filteredUsers.filter((u) => u.role === "student").map((u) => u.id),
    [filteredUsers]
  );

  const allStudentsSelected = useMemo(
    () => filteredStudentIds.length > 0 && filteredStudentIds.every((id) => selectedStudentIds.includes(id)),
    [filteredStudentIds, selectedStudentIds]
  );

  const toggleSelectAll = () => {
    if (allStudentsSelected) {
      setSelectedStudentIds((prev) => prev.filter((id) => !filteredStudentIds.includes(id)));
    } else {
      setSelectedStudentIds((prev) => {
        const set = new Set(prev);
        filteredStudentIds.forEach((id) => set.add(id));
        return [...set];
      });
    }
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

  const handleProfileEditPermission = async (user) => {
    try {
      const nextValue = !user.profile_edit_allowed;
      await setProfileEditPermissionApi(user.id, nextValue);
      refreshUsers();
      showNotice({
        type: "success",
        title: "Profile edit permission updated",
        message: nextValue
          ? `${user.email} can now edit their profile once.`
          : `${user.email} profile editing permission removed.`,
      });
    } catch (err) {
      showNotice({
        type: "error",
        title: "Update failed",
        message: err?.message || "Unable to update profile edit permission.",
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

  const handleBulkDelete = async () => {
    if (!selectedStudentIds.length) return;
    const confirmed = window.confirm(
      `Delete ${selectedStudentIds.length} selected student account(s)? This permanently removes their accounts, profiles, and exam records.`
    );
    if (!confirmed) return;
    try {
      const result = await bulkDeleteUsersApi(selectedStudentIds, false);
      setSelectedStudentIds([]);
      refreshUsers();
      showNotice({
        type: "success",
        title: "Selected students deleted",
        message: `${result.deleted} student account(s) removed.`,
      });
    } catch (err) {
      showNotice({
        type: "error",
        title: "Bulk delete failed",
        message: err?.message || "Unable to delete selected students.",
      });
    }
  };

  const handleDeleteAllStudents = async () => {
    const confirmed = window.confirm(
      "Delete ALL student accounts? This permanently removes every student account, profile, and exam record. This cannot be undone."
    );
    if (!confirmed) return;
    try {
      const result = await bulkDeleteUsersApi([], true);
      setSelectedStudentIds([]);
      refreshUsers();
      showNotice({
        type: "success",
        title: "All students deleted",
        message: `${result.deleted} student account(s) removed.`,
      });
    } catch (err) {
      showNotice({
        type: "error",
        title: "Bulk delete failed",
        message: err?.message || "Unable to delete all students.",
      });
    }
  };

  const downloadUsersCsv = () => {
    const header = "email,role";
    const rows = [
      header,
      ...filteredUsers.map((u) => `${u.email},${u.role}`),
    ];
    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "users_export.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadCsvTemplate = () => {
    const csv = "email,role,password\nstudent1@example.com,student,\ninstructor1@example.com,instructor,\nadmin1@example.com,admin,\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "users_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fileInputRef = useRef(null);

  const handleCsvUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const result = await importUsersCsvApi(file);
      refreshUsers();
      setLastImport(result.created?.length ? result : null);
      if (result.created?.length) {
        showNotice({
          type: "success",
          title: "Users imported",
          message: `${result.created_count} user(s) created, ${result.error_count} error(s). Download the CSV below to get their temporary passwords.`,
        });
      } else {
        showNotice({
          type: "warning",
          title: "Import completed",
          message: result.error_count
            ? `${result.error_count} row(s) failed (duplicates or missing email).`
            : "No new users created.",
        });
      }
    } catch (err) {
      showNotice({
        type: "error",
        title: "Import failed",
        message: err?.message || "Unable to import users.",
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleGetTempPasswords = async () => {
    try {
      const result = await importCredentialsApi();
      const issued = result?.created || [];
      if (!issued.length) {
        setNotice({
          type: "info",
          title: "No pending accounts",
          message: "All accounts have already logged in and changed their password.",
        });
        return;
      }
      const header = "email,role,temporary_password";
      const rows = [
        header,
        ...issued.map((item) =>
          [item.email, item.role, item.temporary_password || ""].join(",")
        ),
      ];
      const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "temp_passwords.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setNotice({
        type: "success",
        title: "Temp passwords generated",
        message: `${issued.length} temporary password(s) downloaded. These are valid for 24 hours.`,
      });
    } catch (err) {
      setNotice({
        type: "error",
        title: "Failed to get temp passwords",
        message: err?.message || "Unable to generate temporary passwords.",
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
          <div className="admin-csv-row">
            <span className="status-note">
              {lastImport?.created?.length
                ? `${lastImport.created.length} account(s) recently imported. Get temp passwords below.`
                : "Bulk registration via CSV. Get temp passwords for accounts still on temp credentials."}
            </span>
            <div className="admin-bulk-buttons">
              <button type="button" className="admin-action-btn subtle" onClick={downloadCsvTemplate}>
                Download Template
              </button>
              <button type="button" className="admin-action-btn subtle" onClick={downloadUsersCsv}>
                Export Users CSV
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                style={{ display: "none" }}
                onChange={handleCsvUpload}
              />
              <button type="button" className="admin-action-btn" onClick={() => fileInputRef.current?.click()}>
                Upload CSV
              </button>
              <button type="button" className="admin-action-btn pass" onClick={handleGetTempPasswords}>
                Download Temp Passwords
              </button>
            </div>
          </div>
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
                className="admin-action-btn danger"
                disabled={!selectedStudentIds.length}
                onClick={handleBulkDelete}
              >
                Delete Selected
              </button>
              <button
                type="button"
                className="admin-action-btn danger"
                onClick={handleDeleteAllStudents}
              >
                Delete All Students
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
                <label className="admin-user-check">
                  <input
                    type="checkbox"
                    checked={allStudentsSelected}
                    onChange={toggleSelectAll}
                    disabled={!filteredStudentIds.length}
                    title={filteredStudentIds.length ? "Select all students" : "No students to select"}
                  />
                </label>
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
                      <select
                        title="Change role"
                        value={user.role}
                        disabled={user.email === currentUserEmail}
                        onChange={(e) => handleChangeRole(user, e.target.value)}
                        style={{
                          padding: "5px 8px",
                          borderRadius: 6,
                          border: "1px solid var(--border)",
                          fontSize: 12,
                          background: "var(--surface)",
                          color: "var(--text)",
                        }}
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </select>
                      {accessStatuses[user.id]?.status === "pending" && (
                        <>
                          {user.profile_completed ? (
                            <button
                              className="admin-action-btn warning"
                              onClick={() => handleApproveRequest(user)}
                            >
                              Approve
                            </button>
                          ) : (
                            <span className="status-note">Profile not yet filled</span>
                          )}
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
                      {user.role === "student" && (
                        <button
                          className="admin-action-btn subtle"
                          onClick={() => handleProfileEditPermission(user)}
                        >
                          {user.profile_edit_allowed ? "Revoke Profile Edit" : "Allow Profile Edit"}
                        </button>
                      )}
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
