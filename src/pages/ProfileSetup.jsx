import { useEffect, useRef, useState } from "react";
import { getProfileApi, requestAccessApi, saveProfileApi } from "../api";
import { getUser } from "../auth";

export default function ProfileSetup({ onSaved, onCancel }) {
  const [student_id, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");

  const [exam_type, setExamType] = useState("LET");
  const [let_track, setLetTrack] = useState("Elementary");
  const [let_major, setLetMajor] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const user = getUser();
  const initialProfileRef = useRef(null);

  useEffect(() => {
    // If profile exists, fill it
    (async () => {
      const existing = await getProfileApi();
      if (existing) {
        setStudentId(existing.student_id || "");
        setName(existing.name || "");
        setCourse(existing.course || "");
        setExamType(existing.exam_type || "LET");
        setLetTrack(existing.let_track || "Elementary");
        setLetMajor(existing.let_major || "");
        initialProfileRef.current = existing;
      } else {
        initialProfileRef.current = null;
      }
    })();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        student_id,
        name,
        course,
        exam_type,
        let_track: exam_type === "LET" ? let_track : null,
        let_major: exam_type === "LET" && let_track === "Secondary" ? let_major : null,
      };

      const saved = await saveProfileApi(payload);
      if (user?.email) {
        const previous = initialProfileRef.current;
        let detail = "New account: profile submitted.";
        if (previous) {
          const changes = [];
          if ((previous.student_id || "") !== student_id) {
            changes.push(`Student ID: ${previous.student_id || "-"} -> ${student_id}`);
          }
          if ((previous.name || "") !== name) {
            changes.push(`Name: ${previous.name || "-"} -> ${name}`);
          }
          if ((previous.course || "") !== course) {
            changes.push(`Course: ${previous.course || "-"} -> ${course}`);
          }
          if ((previous.exam_type || "") !== exam_type) {
            changes.push(`Exam Type: ${previous.exam_type || "-"} -> ${exam_type}`);
          }
          if ((previous.let_track || "") !== (payload.let_track || "")) {
            changes.push(
              `LET Track: ${previous.let_track || "-"} -> ${payload.let_track || "-"}`
            );
          }
          if ((previous.let_major || "") !== (payload.let_major || "")) {
            changes.push(
              `LET Major: ${previous.let_major || "-"} -> ${payload.let_major || "-"}`
            );
          }
          detail = changes.length
            ? `Profile updated: ${changes.join("; ")}`
            : "Profile updated with no field changes.";
        }
        await requestAccessApi(detail);
      }
      onSaved?.(saved || payload); // tell Dashboard to refresh
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: "100%" }}>
      <h3>Student Profile & Exam Setup</h3>

      <form onSubmit={handleSave}>
        <label>Student ID</label>
        <input value={student_id} onChange={(e) => setStudentId(e.target.value)} required />

        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Course</label>
        <input value={course} onChange={(e) => setCourse(e.target.value)} required />

        <label>Exam Type</label>
        <select value={exam_type} onChange={(e) => setExamType(e.target.value)}>
          <option value="LET">LET</option>
          <option value="CPA">CPA</option>
        </select>

        {exam_type === "LET" && (
          <>
            <label>LET Track</label>
            <select value={let_track} onChange={(e) => setLetTrack(e.target.value)}>
              <option value="Elementary">Elementary</option>
              <option value="Secondary">Secondary / High School</option>
            </select>

            {let_track === "Secondary" && (
              <>
                <label>Major</label>
                <select value={let_major} onChange={(e) => setLetMajor(e.target.value)} required>
                  <option value="">Select major...</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Social Studies">Social Studies</option>
                  <option value="Filipino">Filipino</option>
                  <option value="English">English</option>
                </select>
              </>
            )}
          </>
        )}

        {exam_type === "CPA" && (
          <p style={{ marginTop: 10 }}>
            CPA scope: FAR, AFAR, Auditing, MAS, RFBT, Taxation (auto-mixed)
          </p>
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div style={{ display: "flex", gap: "10px", marginTop: 10 }}>
          <button type="submit" disabled={loading} style={{ flex: 1 }}>
            {loading ? "Saving..." : "Save Profile"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              style={{ flex: 1, background: "#e2e8f0", color: "#0f172a" }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
