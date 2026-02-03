import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InlineNotice from "../components/InlineNotice";
import { getSystemLogo, saveSystemLogo } from "../systemLogo";

export default function AdminSystemSettings() {
  const navigate = useNavigate();
  const [logoSrc, setLogoSrc] = useState(getSystemLogo());
  const [logoPreview, setLogoPreview] = useState("");
  const [logoError, setLogoError] = useState("");
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
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
