const API_URL = "http://127.0.0.1:8000";
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Invalid login");
  }

  return data;
}

export function saveUser(data, email) {
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("role", data.role);
  localStorage.setItem(
    "must_change_password",
    data.must_change_password ? "1" : "0"
  );
  if (email) {
    localStorage.setItem("email", email);
  }
  localStorage.setItem("login_time", String(Date.now()));
}

export async function register(email, password, role) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });

  if (!res.ok) {
    throw new Error("Registration failed");
  }

  return res.json();
}

export async function registerAdmin(email, password, admin_key) {
  const res = await fetch(`${API_URL}/auth/register-admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, admin_key }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Admin registration failed");
  }

  return data;
}

export function getUser() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");
  const mustChangePassword = localStorage.getItem("must_change_password") === "1";
  if (!token) return null;

  const loginTimeRaw = localStorage.getItem("login_time");
  const loginTime = loginTimeRaw ? Number(loginTimeRaw) : 0;
  const now = Date.now();

  if (!loginTime) {
    localStorage.setItem("login_time", String(now));
  } else if (now - loginTime > SESSION_TTL_MS) {
    logout();
    return null;
  }

  return { token, role, email, mustChangePassword };
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
  localStorage.removeItem("must_change_password");
  localStorage.removeItem("edit_profile");
  localStorage.removeItem("login_time");
}
