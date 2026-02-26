import defaultLogo from "./assets/logo.png";

const LOGO_KEY = "system_logo";
const SCHOOL_NAME_KEY = "system_school_name";
const DEFAULT_SCHOOL_NAME = "Kolehiyo ng Subic";

export const getSystemLogo = () => {
  try {
    return localStorage.getItem(LOGO_KEY) || defaultLogo;
  } catch {
    return defaultLogo;
  }
};

export const saveSystemLogo = (dataUrl) => {
  try {
    if (dataUrl) {
      localStorage.setItem(LOGO_KEY, dataUrl);
    } else {
      localStorage.removeItem(LOGO_KEY);
    }
  } catch {
    // ignore storage errors
  }
};

export const getSystemSchoolName = () => {
  try {
    const value = localStorage.getItem(SCHOOL_NAME_KEY);
    return value && value.trim() ? value : DEFAULT_SCHOOL_NAME;
  } catch {
    return DEFAULT_SCHOOL_NAME;
  }
};

export const saveSystemSchoolName = (value) => {
  try {
    const cleaned = String(value || "").trim();
    if (cleaned) {
      localStorage.setItem(SCHOOL_NAME_KEY, cleaned);
    }
  } catch {
    // ignore storage errors
  }
};

export const resetSystemSchoolName = () => {
  try {
    localStorage.removeItem(SCHOOL_NAME_KEY);
  } catch {
    // ignore storage errors
  }
};
