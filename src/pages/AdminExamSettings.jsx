import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InlineNotice from "../components/InlineNotice";
import { getAdminSettingsApi, updateAdminSettingsApi } from "../api";
import { getSystemLogo } from "../systemLogo";
import { DEFAULT_TARGET_LICENSURE_OPTIONS } from "../licensureDefaults";

export default function AdminExamSettings() {
  const navigate = useNavigate();
  const logoSrc = getSystemLogo();
  const [settings, setSettings] = useState({
    exam_time_limit_minutes: 90,
    exam_question_count: 50,
    exam_major_question_count: 50,
    passing_threshold_default: 75,
    mastery_threshold: 90,
    rl_enabled: false,
    target_licensure_options: DEFAULT_TARGET_LICENSURE_OPTIONS,
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
            passing_threshold_default: data.passing_threshold_default ?? 75,
            mastery_threshold: data.mastery_threshold ?? 90,
            rl_enabled: !!data.rl_enabled,
            target_licensure_options:
              Array.isArray(data.target_licensure_options) && data.target_licensure_options.length
                ? data.target_licensure_options
                : DEFAULT_TARGET_LICENSURE_OPTIONS,
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
    const normalizedOptions = (settings.target_licensure_options || [])
      .map((option) => ({
        name: String(option.name || "").trim(),
        subjects: String(option.subjects_csv || "")
          .split(",")
          .map((subject) => subject.trim())
          .filter(Boolean),
        passing_threshold: Number(option.passing_threshold),
      }))
      .filter((option) => option.name && option.subjects.length);
    if (!normalizedOptions.length) {
      setNotice({
        type: "error",
        title: "Invalid categories",
        message: "Add at least one valid licensure/certification category.",
      });
      setSaving(false);
      return;
    }

    try {
      const payload = {
        ...settings,
        target_licensure_options: normalizedOptions,
      };
      const updated = await updateAdminSettingsApi(payload);
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

  const licensureOptions = (settings.target_licensure_options || []).map((option) => ({
    ...option,
    subjects_csv: option.subjects_csv || (Array.isArray(option.subjects) ? option.subjects.join(", ") : ""),
  }));

  const updateLicensureOption = (index, field, value) => {
    setSettings((prev) => {
      const updated = [...licensureOptions];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, target_licensure_options: updated };
    });
  };

  const addLicensureOption = () => {
    setSettings((prev) => ({
      ...prev,
      target_licensure_options: [
        ...licensureOptions,
        {
          name: "",
          subjects_csv: "",
          passing_threshold: prev.passing_threshold_default || 75,
        },
      ],
    }));
  };

  const removeLicensureOption = (index) => {
    setSettings((prev) => ({
      ...prev,
      target_licensure_options: licensureOptions.filter((_, idx) => idx !== index),
    }));
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
              <div className="admin-form-field">
                <label htmlFor="passingThreshold">Passing threshold default (%)</label>
                <input
                  id="passingThreshold"
                  type="number"
                  min="50"
                  max="100"
                  value={settings.passing_threshold_default}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      passing_threshold_default: Number(event.target.value),
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
              <div className="admin-form-field" style={{ gridColumn: "1 / -1" }}>
                <label>Target Licensure / Certification Categories</label>
                <p className="status-note" style={{ marginBottom: "10px" }}>
                  These options will appear in student profile setup.
                </p>
                <div
                  style={{
                    overflowX: "auto",
                    border: "1px solid #d7deea",
                    borderRadius: "10px",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: "720px",
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "10px" }}>Category</th>
                        <th style={{ textAlign: "left", padding: "10px" }}>Subjects (comma-separated)</th>
                        <th style={{ textAlign: "left", padding: "10px" }}>Passing Threshold (%)</th>
                        <th style={{ textAlign: "left", padding: "10px" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {licensureOptions.map((option, index) => (
                        <tr key={`${option.name || "new"}-${index}`}>
                          <td style={{ padding: "10px", borderTop: "1px solid #e5eaf2" }}>
                            <input
                              type="text"
                              placeholder="e.g. LET, CPA, Civil Service"
                              value={option.name || ""}
                              onChange={(event) =>
                                updateLicensureOption(index, "name", event.target.value)
                              }
                            />
                          </td>
                          <td style={{ padding: "10px", borderTop: "1px solid #e5eaf2" }}>
                            <input
                              type="text"
                              placeholder="GenEd, ProfEd, Specialization"
                              value={option.subjects_csv || ""}
                              onChange={(event) =>
                                updateLicensureOption(index, "subjects_csv", event.target.value)
                              }
                            />
                          </td>
                          <td style={{ padding: "10px", borderTop: "1px solid #e5eaf2" }}>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              placeholder="75"
                              value={option.passing_threshold ?? settings.passing_threshold_default}
                              onChange={(event) =>
                                updateLicensureOption(
                                  index,
                                  "passing_threshold",
                                  Number(event.target.value)
                                )
                              }
                            />
                          </td>
                          <td style={{ padding: "10px", borderTop: "1px solid #e5eaf2" }}>
                            <button
                              type="button"
                              className="admin-action-btn subtle"
                              onClick={() => removeLicensureOption(index)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  className="admin-action-btn warning"
                  onClick={addLicensureOption}
                  style={{ marginTop: "10px" }}
                >
                  Add Category
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
