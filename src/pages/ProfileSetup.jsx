import { useEffect, useRef, useState } from "react";
import { getProfileApi, requestAccessApi, saveProfileApi } from "../api";
import { getUser } from "../auth";

const LICENSURE_RULES = {
  LET: {
    subjects: ["GenEd", "ProfEd", "Specialization"],
    passingThreshold: 75,
  },
  CPA: {
    subjects: ["FAR", "AFAR", "Auditing", "MAS", "RFBT", "Taxation"],
    passingThreshold: 75,
  },
  "Internal Certification": {
    subjects: ["Core", "Applied", "Practicum"],
    passingThreshold: 80,
  },
};

export default function ProfileSetup({ onSaved, onCancel }) {
  const user = getUser();
  const [studentIdNumber, setStudentIdNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState(user?.email || "");
  const [username, setUsername] = useState("");
  const [programDegree, setProgramDegree] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [sectionClass, setSectionClass] = useState("");
  const [status, setStatus] = useState("Active");
  const [targetLicensure, setTargetLicensure] = useState("LET");
  const [letTrack, setLetTrack] = useState("Elementary");
  const [majorSpecialization, setMajorSpecialization] = useState("");
  const [assignedReviewSubjects, setAssignedReviewSubjects] = useState([]);
  const [requiredPassingThreshold, setRequiredPassingThreshold] = useState(
    LICENSURE_RULES.LET.passingThreshold
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const initialProfileRef = useRef(null);

  useEffect(() => {
    if (user?.email && !emailAddress) {
      setEmailAddress(user.email);
    }
  }, [user?.email, emailAddress]);

  useEffect(() => {
    const rule = LICENSURE_RULES[targetLicensure];
    if (!rule) return;
    const baseSubjects = rule.subjects;
    let subjects = baseSubjects;
    if (targetLicensure === "LET" && letTrack === "Elementary") {
      subjects = baseSubjects.filter((subject) => subject !== "Specialization");
    }
    setRequiredPassingThreshold(rule.passingThreshold);
    setAssignedReviewSubjects((prev) => {
      const filtered = prev.filter((subject) => subjects.includes(subject));
      return filtered.length ? filtered : subjects;
    });
  }, [targetLicensure, letTrack]);

  useEffect(() => {
    (async () => {
      const existing = await getProfileApi();
      if (existing) {
        setStudentIdNumber(existing.student_id_number || "");
        setFirstName(existing.first_name || "");
        setMiddleName(existing.middle_name || "");
        setLastName(existing.last_name || "");
        setEmailAddress(existing.email_address || user?.email || "");
        setUsername(existing.username || "");
        setProgramDegree(existing.program_degree || "");
        setYearLevel(existing.year_level ?? "");
        setSectionClass(existing.section_class || "");
        setStatus(existing.status || "Active");
        setTargetLicensure(existing.target_licensure || "LET");
        setLetTrack(existing.let_track || "Elementary");
        setMajorSpecialization(existing.major_specialization || "");
        setAssignedReviewSubjects(existing.assigned_review_subjects || []);
        setRequiredPassingThreshold(
          existing.required_passing_threshold ||
            LICENSURE_RULES[existing.target_licensure || "LET"].passingThreshold
        );
        initialProfileRef.current = existing;
      } else {
        initialProfileRef.current = null;
      }
    })();
  }, [user?.email]);

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        student_id_number: studentIdNumber,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        email_address: emailAddress || user?.email || "",
        username,
        program_degree: programDegree,
        year_level: yearLevel === "" ? null : Number(yearLevel),
        section_class: sectionClass || null,
        status,
        target_licensure: targetLicensure,
        let_track: targetLicensure === "LET" ? letTrack : null,
        major_specialization: majorSpecialization,
        assigned_review_subjects: availableSubjects,
        required_passing_threshold: requiredPassingThreshold,
      };

      const saved = await saveProfileApi(payload);
      if (user?.email) {
        const previous = initialProfileRef.current;
        const fullName = `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, " ").trim();
        let detail = "New account: profile submitted.";
        if (previous) {
          const changes = [];
          if ((previous.student_id_number || "") !== studentIdNumber) {
            changes.push(
              `Student ID: ${previous.student_id_number || "-"} -> ${studentIdNumber}`
            );
          }
          if (
            `${previous.first_name || ""} ${previous.middle_name || ""} ${previous.last_name || ""}`
              .replace(/\s+/g, " ")
              .trim() !== fullName
          ) {
            changes.push(`Name: ${fullName}`);
          }
          if ((previous.program_degree || "") !== programDegree) {
            changes.push(
              `Program: ${previous.program_degree || "-"} -> ${programDegree}`
            );
          }
          if ((previous.year_level || "") !== Number(yearLevel)) {
            changes.push(
              `Year Level: ${previous.year_level || "-"} -> ${yearLevel}`
            );
          }
          if ((previous.target_licensure || "") !== targetLicensure) {
            changes.push(
              `Licensure: ${previous.target_licensure || "-"} -> ${targetLicensure}`
            );
          }
          if ((previous.major_specialization || "") !== majorSpecialization) {
            changes.push(
              `Specialization: ${previous.major_specialization || "-"} -> ${majorSpecialization}`
            );
          }
          detail = changes.length
            ? `Profile updated: ${changes.join("; ")}`
            : "Profile updated with no field changes.";
        }
        await requestAccessApi(detail);
      }
      onSaved?.(saved || payload);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const rule = LICENSURE_RULES[targetLicensure];
  const availableSubjects =
    targetLicensure === "LET" && letTrack === "Elementary"
      ? rule.subjects.filter((subject) => subject !== "Specialization")
      : rule.subjects;

  return (
    <div style={{ width: "100%" }}>
      <h3>Student Profile & Exam Setup</h3>

      <form onSubmit={handleSave}>
        <label>Student ID Number</label>
        <input
          value={studentIdNumber}
          onChange={(e) => setStudentIdNumber(e.target.value)}
          required
        />

        <label>First Name</label>
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />

        <label>Middle Name (optional)</label>
        <input value={middleName} onChange={(e) => setMiddleName(e.target.value)} />

        <label>Last Name</label>
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />

        <label>Email Address (institutional)</label>
        <input value={emailAddress} readOnly required />

        <label>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} required />

        <label>Program / Degree</label>
        <input
          value={programDegree}
          onChange={(e) => setProgramDegree(e.target.value)}
          required
        />

        <label>Year Level (optional)</label>
        <input
          type="number"
          min="1"
          max="6"
          value={yearLevel}
          onChange={(e) => setYearLevel(e.target.value)}
        />

        <label>Section / Class (optional)</label>
        <input
          value={sectionClass}
          onChange={(e) => setSectionClass(e.target.value)}
        />

        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Graduated">Graduated</option>
        </select>

        <label>Target Licensure / Certification</label>
        <select value={targetLicensure} onChange={(e) => setTargetLicensure(e.target.value)}>
          <option value="LET">LET</option>
          <option value="CPA">CPA</option>
          <option value="Internal Certification">Internal Certification</option>
        </select>

        {targetLicensure === "LET" && (
          <>
            <label>LET Track</label>
            <select value={letTrack} onChange={(e) => setLetTrack(e.target.value)}>
              <option value="Elementary">Elementary</option>
              <option value="Secondary">Secondary</option>
            </select>
          </>
        )}

        {(targetLicensure !== "LET" || letTrack === "Secondary") && (
          <>
            <label>Major / Specialization</label>
            {targetLicensure === "LET" ? (
              <select
                value={majorSpecialization}
                onChange={(e) => setMajorSpecialization(e.target.value)}
                required
              >
                <option value="">Select major...</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Filipino">Filipino</option>
                <option value="Social Studies">Social Studies</option>
                <option value="English">English</option>
              </select>
            ) : (
              <input
                value={majorSpecialization}
                onChange={(e) => setMajorSpecialization(e.target.value)}
                required
              />
            )}
          </>
        )}

        <label>Assigned Review Subjects</label>
        <div className="subject-chip-list">
          {availableSubjects.map((subject) => (
            <span key={subject} className="subject-chip">
              {subject}
            </span>
          ))}
        </div>

        <label>Required Passing Threshold</label>
        <input value={`${requiredPassingThreshold}%`} readOnly />

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
