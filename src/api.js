import { getUser } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function loginApi(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Login failed");
  }

  return data;
}

/* ============================
   ADD THIS BELOW loginApi
   ============================ */


function authHeaders() {
  const user = getUser();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${user?.token || ""}`,
  };
}

// GET student profile
export async function getProfileApi() {
  const res = await fetch(`${API_URL}/profile`, {
    headers: authHeaders(),
  });

  if (!res.ok) return null;
  return res.json();
}

// SAVE student profile
export async function saveProfileApi(profile) {
  const res = await fetch(`${API_URL}/profile`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(profile),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Failed to save profile");
  }

  return data;
}

export async function startExamApi() {
  const user = getUser();

  const res = await fetch(`${API_URL}/exam/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to start exam");
  }

  return res.json();
}

export async function getExamStatsApi() {
  const res = await fetch(`${API_URL}/exam/stats`, {
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Failed to load stats");
  }
  return data;
}


export async function getAdminSettingsApi() {
  const res = await fetch(`${API_URL}/admin/settings`, {
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Failed to load settings");
  }
  return data;
}

export async function getAppSettingsApi() {
  const res = await fetch(`${API_URL}/admin/settings/public`, {
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Failed to load settings");
  }
  return data;
}

export async function requestAccessApi(detail) {
  const res = await fetch(`${API_URL}/access/request`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ detail }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Failed to request access");
  }
  return data;
}

export async function getAccessStatusApi() {
  const res = await fetch(`${API_URL}/access/status`, {
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Failed to load access status");
  }
  return data;
}

export async function listAccessRequestsApi() {
  const res = await fetch(`${API_URL}/admin/access-requests`, {
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Failed to load access requests");
  }
  return data;
}

export async function listAccessStatusesApi() {
  const res = await fetch(`${API_URL}/admin/access-statuses`, {
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Failed to load access statuses");
  }
  return data;
}

export async function approveAccessRequestApi(userId) {
  const res = await fetch(`${API_URL}/admin/access-requests/${userId}/approve`, {
    method: "POST",
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Failed to approve access");
  }
  return data;
}

export async function denyAccessRequestApi(userId) {
  const res = await fetch(`${API_URL}/admin/access-requests/${userId}/deny`, {
    method: "POST",
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Failed to deny access");
  }
  return data;
}

export async function updateAdminSettingsApi(payload) {
  const res = await fetch(`${API_URL}/admin/settings`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Failed to update settings");
  }
  return data;
}

export async function listUsersApi() {
  const res = await fetch(`${API_URL}/admin/users`, {
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Failed to load users");
  }
  return data;
}

export async function setUserStatusApi(userId, active) {
  const res = await fetch(`${API_URL}/admin/users/${userId}/status?active=${active}`, {
    method: "PUT",
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Failed to update user status");
  }
  return data;
}

export async function deleteUserApi(userId) {
  const res = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Failed to delete user");
  }
  return data;
}

export async function resetUserExamsApi(userId) {
  const res = await fetch(`${API_URL}/admin/users/${userId}/exams`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Failed to reset exams");
  }
  return data;
}

export async function resetUserPasswordApi(userId) {
  const res = await fetch(`${API_URL}/admin/users/${userId}/password-reset`, {
    method: "POST",
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Failed to reset password");
  }
  return data;
}

export async function changePasswordApi(payload) {
  const res = await fetch(`${API_URL}/auth/change-password`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Failed to change password");
  }
  return data;
}



export async function listAuditLogsApi() {
  const res = await fetch(`${API_URL}/admin/audit-logs`, {
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Failed to load audit logs");
  }
  return data;
}


export async function submitExamApi(answers) {
  const user = getUser();

  const res = await fetch(`${API_URL}/exam/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    },
    body: JSON.stringify({ answers }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Submit failed");
  }

  return res.json();
}

// ============================
// Question management (admin/instructor)
// ============================

export async function listQuestionsApi() {
  const res = await fetch(`${API_URL}/questions`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to load questions");
  }
  return res.json();
}

export async function createQuestionApi(question) {
  const res = await fetch(`${API_URL}/questions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(question),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Failed to add question");
  }
  return data;
}

export async function uploadQuestionsCsv(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/questions/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getUser()?.token || ""}`,
    },
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Failed to upload CSV");
  }
  return data;
}

export async function clearQuestionsApi() {
  const res = await fetch(`${API_URL}/questions`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Failed to delete questions");
  }
  return data;
}

