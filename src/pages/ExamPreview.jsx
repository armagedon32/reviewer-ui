import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../auth";
import { getAppSettingsApi } from "../api";

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

export default function ExamPreview() {
  const navigate = useNavigate();
  const user = getUser();

  const config = useMemo(() => {
    const historyKey = user?.email ? `exam_history_${user.email}` : "exam_history";
    const stored = localStorage.getItem(historyKey);
    if (!stored) return FALLBACK_CONFIG;
    try {
      const history = JSON.parse(stored);
      const latest = history?.[0];
      if (!latest || !latest.subject_performance) return FALLBACK_CONFIG;

      const subjects = Object.entries(latest.subject_performance).map(
        ([label, stat]) => ({
          label,
          value: Math.round((stat.correct / stat.total) * 100),
        })
      );
      if (!subjects.length) return FALLBACK_CONFIG;

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
        timeLimit: FALLBACK_CONFIG.timeLimit,
        questions: 50,
      };
    } catch {
      return FALLBACK_CONFIG;
    }
  }, [user?.email]);

  const [timeLimit, setTimeLimit] = useState(FALLBACK_CONFIG.timeLimit);
  const [questionCount, setQuestionCount] = useState(FALLBACK_CONFIG.questions);

  useEffect(() => {
    getAppSettingsApi()
      .then((data) => {
        if (data?.exam_time_limit_minutes) {
          setTimeLimit(data.exam_time_limit_minutes);
        }
        if (data?.exam_question_count) {
          setQuestionCount(data.exam_question_count);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="exam-page exam-preview-page">
      <div className="exam-shell">
        <header className="exam-preview-header">
          <div>
            <p className="exam-kicker">Adaptive Exam Preview</p>
            <h2 className="exam-title">Pre-Exam Confirmation</h2>
          </div>
          <button className="exam-preview-back" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </header>

        <section className="exam-card exam-preview-card">
          <h3 className="exam-preview-title">Next Mock Board Configuration</h3>
          <ul className="exam-preview-list">
            <li>
              <strong>Primary Focus:</strong> {config.primaryFocus} ({config.primaryShare}%)
            </li>
            <li>
              <strong>Secondary Focus:</strong> {config.secondaryFocus} ({config.secondaryShare}%)
            </li>
            <li>
              <strong>Difficulty Progression:</strong> {config.difficultyFrom} →{" "}
              {config.difficultyTo}
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
