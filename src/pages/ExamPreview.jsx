import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../auth";
import { getAppSettingsApi, getExamHistoryApi, getProfileApi } from "../api";
import { DEFAULT_TARGET_LICENSURE_OPTIONS } from "../licensureDefaults";

const FALLBACK_CONFIG = {
  primaryFocus: "General Education",
  primaryShare: 60,
  secondaryFocus: "Professional Education",
  secondaryShare: 40,
  difficultyFrom: "Easy",
  difficultyTo: "Medium",
  strategy: "Balanced Coverage",
  timeLimit: 90,
  questions: 50,
};

function buildFallbackConfig(targetLicensure, subjects) {
  if (targetLicensure === "CPA") {
    return {
      primaryFocus: subjects[0] || "FAR",
      primaryShare: 35,
      secondaryFocus: subjects[1] || "AFAR",
      secondaryShare: 25,
      difficultyFrom: "Easy",
      difficultyTo: "Medium",
      strategy: "Balanced CPA Coverage",
      timeLimit: 90,
      questions: 50,
    };
  }

  return {
    ...FALLBACK_CONFIG,
    primaryFocus: subjects[0] || FALLBACK_CONFIG.primaryFocus,
    secondaryFocus: subjects[1] || subjects[0] || FALLBACK_CONFIG.secondaryFocus,
  };
}

export default function ExamPreview() {
  const navigate = useNavigate();
  const user = getUser();
  const [examHistory, setExamHistory] = useState([]);
  const [profile, setProfile] = useState(null);
  const [licensureOptions, setLicensureOptions] = useState(
    DEFAULT_TARGET_LICENSURE_OPTIONS
  );
  const [timeLimit, setTimeLimit] = useState(FALLBACK_CONFIG.timeLimit);
  const [questionCount, setQuestionCount] = useState(FALLBACK_CONFIG.questions);

  useEffect(() => {
    const historyKey = user?.email ? `exam_history_${user.email}` : "exam_history";
    getExamHistoryApi()
      .then((data) => {
        setExamHistory(data);
        localStorage.setItem(historyKey, JSON.stringify(data));
        if (data.length === 0) {
          localStorage.removeItem(historyKey);
        }
      })
      .catch(() => {
        const stored = localStorage.getItem(historyKey);
        if (!stored) return;
        try {
          setExamHistory(JSON.parse(stored));
        } catch {
          setExamHistory([]);
        }
      });
  }, [user?.email]);

  useEffect(() => {
    getProfileApi()
      .then((data) => setProfile(data))
      .catch(() => setProfile(null));
  }, []);

  useEffect(() => {
    getAppSettingsApi()
      .then((data) => {
        if (Array.isArray(data?.target_licensure_options) && data.target_licensure_options.length) {
          setLicensureOptions(data.target_licensure_options);
        }
        if (data?.exam_time_limit_minutes) {
          setTimeLimit(data.exam_time_limit_minutes);
        }
        if (data?.exam_question_count) {
          setQuestionCount(data.exam_question_count);
        }
      })
      .catch(() => {});
  }, []);

  const targetLicensure = profile?.target_licensure || "LET";
  const isLET = targetLicensure === "LET";
  const specialization =
    isLET &&
    profile?.let_track === "Secondary" &&
    profile?.major_specialization
      ? profile.major_specialization
      : "";
  const specializationShare = specialization ? 30 : 0;
  const specializationItems = specialization
    ? Math.max(1, Math.round(questionCount * (specializationShare / 100)))
    : 0;
  const coreShare = specialization ? 100 - specializationShare : 100;
  const coreItems = specialization ? questionCount - specializationItems : questionCount;

  const targetOption =
    licensureOptions.find((option) => option.name === targetLicensure) ||
    DEFAULT_TARGET_LICENSURE_OPTIONS.find((option) => option.name === targetLicensure) ||
    DEFAULT_TARGET_LICENSURE_OPTIONS[0];
  const licensureSubjects = Array.isArray(targetOption?.subjects)
    ? targetOption.subjects
    : [];
  const filteredHistory = useMemo(() => {
    return examHistory.filter(
      (entry) =>
        String(entry?.exam_type || "").trim().toUpperCase() ===
        String(targetLicensure).trim().toUpperCase()
    );
  }, [examHistory, targetLicensure]);
  const config = useMemo(() => {
    const fallback = buildFallbackConfig(targetLicensure, licensureSubjects);
    if (!filteredHistory.length) return fallback;
    try {
      const latest = filteredHistory[0];
      if (!latest || !latest.subject_performance) return fallback;

      const subjects = Object.entries(latest.subject_performance)
        .map(([label, stat]) => ({
          label,
          value: Math.round((stat.correct / stat.total) * 100),
        }))
        .filter((item) =>
          licensureSubjects.length
            ? licensureSubjects.some(
                (subject) => subject.trim().toUpperCase() === item.label.trim().toUpperCase()
              )
            : true
        );

      if (!subjects.length) return fallback;

      const weakest = subjects.reduce((min, item) =>
        item.value < min.value ? item : min
      );
      const strongest = subjects.reduce((max, item) =>
        item.value > max.value ? item : max
      );

      return {
        primaryFocus: weakest.label,
        primaryShare: 70,
        secondaryFocus: strongest.label,
        secondaryShare: 30,
        difficultyFrom: "Easy",
        difficultyTo: "Medium",
        strategy: "Remedial Reinforcement",
        timeLimit: fallback.timeLimit,
        questions: fallback.questions,
      };
    } catch {
      return fallback;
    }
  }, [filteredHistory, licensureSubjects, targetLicensure]);
  const perSubjectItems = licensureSubjects.length
    ? Math.floor(questionCount / licensureSubjects.length)
    : 0;
  const remainderItems = licensureSubjects.length
    ? questionCount % licensureSubjects.length
    : 0;
  const subjectCoverage = licensureSubjects
    .map((subject, index) => {
      const count = perSubjectItems + (index < remainderItems ? 1 : 0);
      return `${subject} (${count} items)`;
    })
    .join(", ");

  return (
    <div className="exam-page exam-preview-page">
      <div className="exam-shell">
        <header className="exam-preview-header">
          <div>
            <p className="exam-kicker">Adaptive Exam Preview</p>
            <h2 className="exam-title">{targetLicensure} Pre-Exam Confirmation</h2>
          </div>
          <button className="exam-preview-back" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </header>

        <section className="exam-card exam-preview-card">
          <h3 className="exam-preview-title">
            {targetLicensure} Mock Board Configuration
          </h3>
          <ul className="exam-preview-list">
            <li>
              <strong>Licensure Track:</strong> {targetLicensure}
            </li>
            {!isLET && licensureSubjects.length > 0 && (
              <li>
                <strong>Subject Coverage:</strong> {subjectCoverage}
              </li>
            )}
            <li>
              <strong>Primary Focus:</strong> {config.primaryFocus} ({config.primaryShare}%)
            </li>
            <li>
              <strong>Secondary Focus:</strong> {config.secondaryFocus} ({config.secondaryShare}%)
            </li>
            {specialization && (
              <>
                <li>
                  <strong>Specialization Focus:</strong> {specialization} (
                  {specializationShare}% / {specializationItems} items)
                </li>
                <li>
                  <strong>Core Coverage:</strong> GenEd + ProfEd ({coreShare}% / {coreItems} items)
                </li>
              </>
            )}
            {!isLET && (
              <li>
                <strong>Coverage Mode:</strong> Balanced board distribution with adaptive
                reinforcement on weaker CPA subjects
              </li>
            )}
            <li>
              <strong>Difficulty Progression:</strong> {config.difficultyFrom} to {config.difficultyTo}
            </li>
            <li>
              <strong>Exam Strategy:</strong> {config.strategy}
            </li>
            <li>
              <strong>Time Limit:</strong> {timeLimit} minutes
            </li>
            <li>
              <strong>Number of Questions:</strong> {questionCount} items
            </li>
            {!isLET && (
              <li>
                <strong>CPA Reminder:</strong> Expect computational and concept-based items
                from accounting, auditing, taxation, business law, and related subjects.
              </li>
            )}
          </ul>

          <div className="exam-preview-actions">
            <button className="exam-submit" onClick={() => navigate("/exam")}>
              Confirm &amp; Start Exam
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
