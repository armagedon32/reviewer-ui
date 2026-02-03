import defaultLogo from "./assets/logo.png";

const LOGO_KEY = "system_logo";

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
