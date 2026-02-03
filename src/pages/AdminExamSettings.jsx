import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InlineNotice from "../components/InlineNotice";
import { getAdminSettingsApi, updateAdminSettingsApi } from "../api";
import { getSystemLogo } from "../systemLogo";

export default function AdminExamSettings() {
  const navigate = useNavigate();
  const logoSrc = getSystemLogo();
  const [settings, setSettings] = useState({
    exam_time_limit_minutes: 90,
    exam_question_count: 50,
    exam_major_question_count: 50,
  });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    getAdminSettingsApi()
      .then((data) => {
        if (data?.exam_time_limit_minutes) {
          setSettings({
            exam_time_limit_minutes: data.exam_time_limit_minutes,
            exam_question_count: data.exam_question_count ?? 50,
            exam_major_question_count: data.exam_major_question_count ?? 50,
          });
        }
      })
      .catch((err) => {
        setNotice({
          type: "error",
          title: "Failed to load settings",
          message: err?.message || "Please try again.",
        });
      });
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await updateAdminSettingsApi(settings);
      setSettings(updated);
      setNotice({
        type: "success",
        title: "Settings saved",
        message: "Exam settings updated successfully.",
      });
    } catch (err) {
      setNotice({
        type: "error",
        title: "Save failed",
        message: err?.message || "Unable to save settings.",
      });
    } finally {
      setSaving(false);
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
              <h2 className="dashboard-title">Exam Settings</h2>
              <p className="dashboard-email">Manage exam timers and item counts.</p>
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
              <div className="admin-form-field">
                <label htmlFor="majorCount">Major items (additional)</label>
                <input
                  id="majorCount"
                  type="number"
                  min="0"
                  max="200"
                  value={settings.exam_major_question_count}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      exam_major_question_count: Number(event.target.value),
                    }))
                  }
                  required
                />
              </div>
              <div className="admin-form-actions">
                <button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
