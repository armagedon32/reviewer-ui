import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InlineNotice from "../components/InlineNotice";
import { getAdminSettingsApi, updateAdminSettingsApi } from "../api";
import { getSystemLogo } from "../systemLogo";
import { getUser } from "../auth";

export default function InstructorExamSettings() {
  const navigate = useNavigate();
  const user = getUser();
  const logoSrc = getSystemLogo();
  const [settings, setSettings] = useState({
    exam_time_limit_minutes: 90,
    exam_question_count: 50,
    exam_major_question_count: 50,
    passing_threshold_default: 75,
    mastery_threshold: 90,
    target_licensure_options: [],
  });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [instructorTrack, setInstructorTrack] = useState("LET");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storageKey = user?.email ? `instructor_profile_${user.email}` : "instructor_profile";
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const track = String(parsed.program || "LET").toUpperCase();
        setInstructorTrack(track);
      } catch {}
    }

    setLoading(false);

    getAdminSettingsApi()
      .then((data) => {
        if (data?.exam_time_limit_minutes) {
          setSettings({
            exam_time_limit_minutes: data.exam_time_limit_minutes,
            exam_question_count: data.exam_question_count ?? 50,
            exam_major_question_count: data.exam_major_question_count ?? 50,
            passing_threshold_default: data.passing_threshold_default ?? 75,
            mastery_threshold: data.mastery_threshold ?? 90,
            target_licensure_options:
              Array.isArray(data.target_licensure_options) && data.target_licensure_options.length
                ? data.target_licensure_options
                : [],
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
      const payload = {
        exam_time_limit_minutes: settings.exam_time_limit_minutes,
        exam_question_count: settings.exam_question_count,
        exam_major_question_count: settings.exam_major_question_count,
        passing_threshold_default: settings.passing_threshold_default,
        mastery_threshold: settings.mastery_threshold,
      };
      const updated = await updateAdminSettingsApi(payload);
      setSettings((prev) => ({ ...prev, ...updated }));
      setNotice({
        type: "success",
        title: "Settings saved",
        message: `${instructorTrack} exam settings updated successfully.`,
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

  const isLET = instructorTrack === "LET";

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <div className="review-header">
          <div className="review-brand">
            <img src={logoSrc} alt="System logo" className="review-logo" />
            <div className="admin-title-block">
              <p className="dashboard-kicker">Instructor</p>
              <h2 className="dashboard-title">{instructorTrack} Exam Setup</h2>
              <p className="dashboard-email">
                Configure exam settings for {instructorTrack} exams only.
              </p>
            </div>
          </div>
          <button className="review-back" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
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
            <h3>{instructorTrack} Exam Settings</h3>
            <span className="status-note">
              Changes apply to {instructorTrack} exams only
            </span>
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
              {isLET && (
                <div className="admin-form-field">
                  <label htmlFor="majorCount">
                    Major items (additional) — Secondary LET only
                  </label>
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
              )}
              <div className="admin-form-field">
                <label htmlFor="passingThreshold">
                  {instructorTrack} Passing threshold (%)
                </label>
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
              <div className="admin-form-field">
                <label htmlFor="masteryThreshold">
                  Mastery threshold (%)
                </label>
                <input
                  id="masteryThreshold"
                  type="number"
                  min="50"
                  max="100"
                  value={settings.mastery_threshold}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      mastery_threshold: Number(event.target.value),
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
