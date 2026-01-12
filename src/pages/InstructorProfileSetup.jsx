import { useEffect, useRef, useState } from "react";
import { requestAccessApi } from "../api";
import { getUser } from "../auth";

export default function InstructorProfileSetup({ onSaved, onCancel }) {
  const user = getUser();
  const email = user?.email || "";

  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("Instructor");
  const [program, setProgram] = useState("LET");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const initialProfileRef = useRef(null);

  useEffect(() => {
    const storageKey = email ? `instructor_profile_${email}` : "instructor_profile";
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      initialProfileRef.current = null;
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setName(parsed.name || "");
      setEmployeeId(parsed.employee_id || "");
      setDepartment(parsed.department || "");
      setPosition(parsed.position || "Instructor");
      setProgram(parsed.program || "LET");
      initialProfileRef.current = parsed;
    } catch {
      setEmployeeId("");
      initialProfileRef.current = null;
    }
  }, [email]);

  async function handleSave(e) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !employeeId.trim() || !department.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        employee_id: employeeId.trim(),
        department: department.trim(),
        position,
        program,
      };
      if (email) {
        const previous = initialProfileRef.current;
        let detail = "New account: profile submitted.";
        if (previous) {
          const changes = [];
          if ((previous.name || "") !== payload.name) {
            changes.push(`Name: ${previous.name || "-"} -> ${payload.name}`);
          }
          if ((previous.employee_id || "") !== payload.employee_id) {
            changes.push(
              `Employee ID: ${previous.employee_id || "-"} -> ${payload.employee_id}`
            );
          }
          if ((previous.department || "") !== payload.department) {
            changes.push(
              `Department: ${previous.department || "-"} -> ${payload.department}`
            );
          }
          if ((previous.position || "") !== payload.position) {
            changes.push(
              `Position: ${previous.position || "-"} -> ${payload.position}`
            );
          }
          if ((previous.program || "") !== payload.program) {
            changes.push(`Program: ${previous.program || "-"} -> ${payload.program}`);
          }
          detail = changes.length
            ? `Profile updated: ${changes.join("; ")}`
            : "Profile updated with no field changes.";
        }
        await requestAccessApi(detail);
      }
      const storageKey = email ? `instructor_profile_${email}` : "instructor_profile";
      localStorage.setItem(storageKey, JSON.stringify(payload));
      onSaved?.(payload);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: "100%" }}>
      <h3>Instructor Profile Setup</h3>

      <form onSubmit={handleSave}>
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Employee ID</label>
        <input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required />

        <label>Department</label>
        <input value={department} onChange={(e) => setDepartment(e.target.value)} required />

        <label>Position</label>
        <input value={position} onChange={(e) => setPosition(e.target.value)} required />

        <label>Program</label>
        <select value={program} onChange={(e) => setProgram(e.target.value)}>
          <option value="LET">LET</option>
          <option value="CPA">CPA</option>
        </select>

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
