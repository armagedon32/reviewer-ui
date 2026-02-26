import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InlineNotice from "../components/InlineNotice";
import {
  downloadBackupApi,
  restoreDatabaseApi,
  restoreSystemApi,
} from "../api";
import {
  getSystemLogo,
  getSystemSchoolName,
  resetSystemSchoolName,
  saveSystemLogo,
  saveSystemSchoolName,
} from "../systemLogo";

export default function AdminSystemSettings() {
  const navigate = useNavigate();
  const [logoSrc, setLogoSrc] = useState(getSystemLogo());
  const [logoPreview, setLogoPreview] = useState("");
  const [logoError, setLogoError] = useState("");
  const [schoolName, setSchoolName] = useState(getSystemSchoolName());
  const [schoolNameInput, setSchoolNameInput] = useState(getSystemSchoolName());
  const [dbRestoreFile, setDbRestoreFile] = useState(null);
  const [systemRestoreFile, setSystemRestoreFile] = useState(null);
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleLogoFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLogoError("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(String(reader.result || ""));
      setLogoError("");
    };
    reader.onerror = () => setLogoError("Unable to read the image file.");
    reader.readAsDataURL(file);
  };

  const saveLogo = () => {
    if (!logoPreview) {
      setLogoError("Choose an image first.");
      return;
    }
    saveSystemLogo(logoPreview);
    setLogoSrc(getSystemLogo());
    setLogoPreview("");
    setLogoError("");
    setNotice({
      type: "success",
      title: "Logo updated",
      message: "System logo updated. Refresh other pages to see the change.",
    });
  };

  const resetLogo = () => {
    saveSystemLogo("");
    setLogoSrc(getSystemLogo());
    setLogoPreview("");
    setLogoError("");
    setNotice({
      type: "success",
      title: "Logo reset",
      message: "System logo reset to default.",
    });
  };

  const saveSchoolName = () => {
    const cleaned = String(schoolNameInput || "").trim();
    if (!cleaned) {
      setNotice({
        type: "error",
        title: "School name required",
        message: "Enter a school name before saving.",
      });
      return;
    }
    saveSystemSchoolName(cleaned);
    setSchoolName(getSystemSchoolName());
    setSchoolNameInput(getSystemSchoolName());
    setNotice({
      type: "success",
      title: "School name updated",
      message: "School name updated. Refresh other pages to see changes.",
    });
  };

  const handleResetSchoolName = () => {
    resetSystemSchoolName();
    setSchoolName(getSystemSchoolName());
    setSchoolNameInput(getSystemSchoolName());
    setNotice({
      type: "success",
      title: "School name reset",
      message: "School name reset to default.",
    });
  };

  const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleBackupDownload = async (kind) => {
    setWorking(true);
    try {
      const { blob, filename } = await downloadBackupApi(kind);
      triggerDownload(blob, filename);
      setNotice({
        type: "success",
        title: "Backup downloaded",
        message: `${kind === "database" ? "Database" : "System"} backup downloaded.`,
      });
    } catch (err) {
      setNotice({
        type: "error",
        title: "Backup failed",
        message: err?.message || "Unable to create backup.",
      });
    } finally {
      setWorking(false);
    }
  };

  const handleRestoreDatabase = async () => {
    if (!dbRestoreFile) {
      setNotice({
        type: "error",
        title: "No file selected",
        message: "Choose a database backup (.zip) first.",
      });
      return;
    }
    setWorking(true);
    try {
      await restoreDatabaseApi(dbRestoreFile);
      setDbRestoreFile(null);
      setNotice({
        type: "success",
        title: "Database restored",
        message: "Database restore completed successfully.",
      });
    } catch (err) {
      setNotice({
        type: "error",
        title: "Restore failed",
        message: err?.message || "Unable to restore database.",
      });
    } finally {
      setWorking(false);
    }
  };

  const handleRestoreSystem = async () => {
    if (!systemRestoreFile) {
      setNotice({
        type: "error",
        title: "No file selected",
        message: "Choose a system backup (.zip) first.",
      });
      return;
    }
    setWorking(true);
    try {
      await restoreSystemApi(systemRestoreFile);
      setSystemRestoreFile(null);
      setNotice({
        type: "success",
        title: "System restored",
        message: "System restore completed. Restart backend/frontend to apply all changes.",
      });
    } catch (err) {
      setNotice({
        type: "error",
        title: "Restore failed",
        message: err?.message || "Unable to restore system backup.",
      });
    } finally {
      setWorking(false);
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
              <h2 className="dashboard-title">System Settings</h2>
              <p className="dashboard-email">Update the system branding.</p>
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
            <h3>Logo</h3>
            <span className="status-note">Applies on page refresh</span>
          </div>
          <div className="admin-form">
            <div className="admin-form-grid">
              <div className="admin-form-field">
                <label htmlFor="logoFile">Logo image</label>
                <input id="logoFile" type="file" accept="image/*" onChange={handleLogoFile} />
                {logoError && <p className="error-text admin-form-error">{logoError}</p>}
              </div>
              <div className="admin-form-field">
                <label>Preview</label>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <img
                    src={logoPreview || logoSrc}
                    alt="Logo preview"
                    style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover" }}
                  />
                  <span className="status-note">Upload a square image for best results.</span>
                </div>
              </div>
              <div className="admin-form-actions">
                <button type="button" onClick={saveLogo}>
                  Save Logo
                </button>
                <button type="button" className="admin-action-btn subtle" onClick={resetLogo}>
                  Reset to Default
                </button>
              </div>
              <div className="admin-form-field" style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="schoolName">School name</label>
                <input
                  id="schoolName"
                  type="text"
                  value={schoolNameInput}
                  onChange={(event) => setSchoolNameInput(event.target.value)}
                  placeholder="Enter school name"
                />
                <p className="status-note" style={{ marginTop: "8px" }}>
                  Current: {schoolName}
                </p>
              </div>
              <div className="admin-form-actions">
                <button type="button" onClick={saveSchoolName}>
                  Save School Name
                </button>
                <button
                  type="button"
                  className="admin-action-btn subtle"
                  onClick={handleResetSchoolName}
                >
                  Reset School Name
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-card">
          <div className="card-header">
            <h3>Database Backup & Restore</h3>
            <span className="status-note">MongoDB backup package (.zip)</span>
          </div>
          <div className="admin-form">
            <div className="admin-form-grid">
              <div className="admin-form-actions">
                <button
                  type="button"
                  onClick={() => handleBackupDownload("database")}
                  disabled={working}
                >
                  {working ? "Processing..." : "Download Database Backup"}
                </button>
              </div>
              <div className="admin-form-field" style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="dbRestoreZip">Restore database from backup (.zip)</label>
                <input
                  id="dbRestoreZip"
                  type="file"
                  accept=".zip"
                  onChange={(event) => setDbRestoreFile(event.target.files?.[0] || null)}
                />
              </div>
              <div className="admin-form-actions">
                <button type="button" onClick={handleRestoreDatabase} disabled={working}>
                  {working ? "Processing..." : "Restore Database"}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-card">
          <div className="card-header">
            <h3>Whole System Backup & Restore</h3>
            <span className="status-note">Frontend + backend package (.zip)</span>
          </div>
          <div className="admin-form">
            <div className="admin-form-grid">
              <div className="admin-form-actions">
                <button
                  type="button"
                  onClick={() => handleBackupDownload("system")}
                  disabled={working}
                >
                  {working ? "Processing..." : "Download System Backup"}
                </button>
              </div>
              <div className="admin-form-field" style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="systemRestoreZip">Restore whole system from backup (.zip)</label>
                <input
                  id="systemRestoreZip"
                  type="file"
                  accept=".zip"
                  onChange={(event) => setSystemRestoreFile(event.target.files?.[0] || null)}
                />
              </div>
              <div className="admin-form-actions">
                <button type="button" onClick={handleRestoreSystem} disabled={working}>
                  {working ? "Processing..." : "Restore System"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
