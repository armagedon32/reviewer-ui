const ACCESS_REQUESTS_KEY = "access_requests";
const ACCESS_APPROVALS_KEY = "access_approvals";
const REQUEST_TTL_MS = 60 * 60 * 1000;

function safeParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function loadRequests() {
  const raw = localStorage.getItem(ACCESS_REQUESTS_KEY);
  const list = safeParse(raw, []);
  return Array.isArray(list) ? list : [];
}

function saveRequests(list) {
  localStorage.setItem(ACCESS_REQUESTS_KEY, JSON.stringify(list));
}

function loadApprovals() {
  const raw = localStorage.getItem(ACCESS_APPROVALS_KEY);
  const map = safeParse(raw, {});
  return map && typeof map === "object" ? map : {};
}

function saveApprovals(map) {
  localStorage.setItem(ACCESS_APPROVALS_KEY, JSON.stringify(map));
}

export function pruneAccessRequests() {
  const now = Date.now();
  const requests = loadRequests();
  const filtered = requests.filter(
    (req) => typeof req?.createdAt === "number" && now - req.createdAt <= REQUEST_TTL_MS
  );
  if (filtered.length !== requests.length) {
    saveRequests(filtered);
  }
  return filtered;
}

export function getAccessRequest(email) {
  if (!email) return null;
  const requests = pruneAccessRequests();
  return requests.find((req) => req.email === email) || null;
}

export function upsertAccessRequest(email, role) {
  if (!email) return null;
  const requests = pruneAccessRequests();
  const now = Date.now();
  const next = requests.filter((req) => req.email !== email);
  const payload = { email, role, createdAt: now };
  next.push(payload);
  saveRequests(next);
  return payload;
}

export function getAccessDecision(email) {
  if (!email) return null;
  const approvals = loadApprovals();
  return approvals[email]?.status || null;
}

export function setAccessDecision(email, status) {
  if (!email) return;
  const approvals = loadApprovals();
  approvals[email] = { status, updatedAt: Date.now() };
  saveApprovals(approvals);
}

export function clearAccessDecision(email) {
  if (!email) return;
  const approvals = loadApprovals();
  if (approvals[email]) {
    delete approvals[email];
    saveApprovals(approvals);
  }
}
