import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAppSettingsApi, startExamApi, submitExamApi } from "../api";
import { getUser } from "../auth";
import AlertModal from "../components/AlertModal";

export default function Exam() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(90);
  const [timeLeft, setTimeLeft] = useState(null);
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "error",
    confirmText: "Close",
    onConfirm: null,
  });
  const navigate = useNavigate();
  const answeredCount = Object.keys(answers).length;
  const user = getUser();
  const minutesLeft =
    timeLeft !== null ? Math.floor(timeLeft / 60) : timeLimitMinutes;
  const secondsLeft = timeLeft !== null ? timeLeft % 60 : 0;

  const closeModal = () =>
    setModal((prev) => ({
      ...prev,
      open: false,
    }));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const fetched = await startExamApi();
        if (!cancelled) {
          if (fetched && fetched.length > 0) {
            setQuestions(fetched);
          } else {
            setModal({
              open: true,
              title: "No questions available",
              message:
                "There are no questions available for your profile yet. Please contact your instructor or try another track.",
              type: "error",
              confirmText: "Back to dashboard",
              onConfirm: () => {
                closeModal();
                navigate("/dashboard");
              },
            });
          }
        }
      } catch (err) {
        setModal({
          open: true,
          title: "Unable to start exam",
          message: err?.message || "Please try again later.",
          type: "error",
          confirmText: "Back to dashboard",
          onConfirm: () => {
            closeModal();
            navigate("/dashboard");
          },
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    getAppSettingsApi()
      .then((data) => {
        if (data?.exam_time_limit_minutes) {
          setTimeLimitMinutes(data.exam_time_limit_minutes);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (loading || !questions.length) return;
    setTimeLeft(timeLimitMinutes * 60);
  }, [loading, questions.length, timeLimitMinutes]);

  useEffect(() => {
    if (timeLeft === null || result) return;
    if (timeLeft <= 0) {
      if (!submitting) {
        handleSubmit();
      }
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : prev));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitting, result]);

  function handleChange(qid, value) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  async function handleSubmit() {
    if (!questions.length) {
      setModal({
        open: true,
        title: "No questions",
        message: "Cannot submit an empty exam. Please start again when questions are available.",
        type: "error",
        confirmText: "Back to dashboard",
        onConfirm: () => {
          closeModal();
          navigate("/dashboard");
        },
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitExamApi(answers);
      setResult(res);
      const questionOrder = questions.reduce((acc, question, index) => {
        acc[question.id] = index + 1;
        return acc;
      }, {});
      const missedPayload = (res.incorrect_questions || []).map((item) => ({
        ...item,
        question_number: questionOrder[item.id] || null,
      }));
      const historyKey = user?.email ? `exam_history_${user.email}` : "exam_history";
      const missedKey = user?.email ? `missed_questions_${user.email}` : "missed_questions";
      const stored = localStorage.getItem(historyKey);
      const history = stored ? JSON.parse(stored) : [];
      const entry = {
        date: new Date().toISOString(),
        score: res.score,
        total: res.total,
        percentage: res.percentage,
        result: res.result,
        subject_performance: res.subject_performance || {},
      };
      history.unshift(entry);
      localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 8)));
      localStorage.setItem(
        missedKey,
        JSON.stringify({
          date: entry.date,
          items: missedPayload,
        })
      );
    } catch (err) {
      const message = err?.message || "Failed to submit exam";
      setModal({
        open: true,
        title: "Submission error",
        message,
        type: "error",
        confirmText: "Try again",
        onConfirm: closeModal,
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="container">
        <div className="card">
          <h2>Exam Result</h2>
          <p><b>Score:</b> {result.score} / {result.total}</p>
          <p><b>Percentage:</b> {result.percentage}%</p>
          <p><b>Result:</b> {result.result}</p>

          <h3>Subject Performance</h3>
          {Object.entries(result.subject_performance).map(([subject, stat]) => (
            <p key={subject}>
              {subject}: {stat.correct}/{stat.total}
            </p>
          ))}

          <button
            onClick={() => navigate("/dashboard")}
            style={{ marginTop: "16px" }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="exam-page">
        <div className="exam-shell">
          <div className="exam-card exam-loading">
            <h2 className="exam-title">Mock Board Exam</h2>
            <p className="exam-subtitle">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  const sectionRank = (section) => {
    const label = (section || "").toLowerCase();
    if (label.includes("general education")) return 0;
    if (label.includes("professional education")) return 1;
    if (label.startsWith("major:") && !label.includes("(additional")) return 2;
    if (label.includes("(additional")) return 3;
    if (label.includes("gened")) return 0;
    if (label.includes("professional")) return 1;
    if (label.startsWith("major:")) return 2;
    return 4;
  };

  const groupedBySection = questions.reduce((acc, question) => {
    const key = question.section || "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(question);
    return acc;
  }, {});

  const orderedSections = Object.keys(groupedBySection).sort(
    (a, b) => sectionRank(a) - sectionRank(b)
  );

  const sortedQuestions = orderedSections.flatMap((section) => groupedBySection[section]);

  return (
    <div className="exam-page">
      <div className="exam-shell">
        <header className="exam-header">
          <div className="exam-title-block">
            <div>
              <p className="exam-kicker">Mock Board Exam</p>
              <h2 className="exam-title">Answer all items</h2>
              <p className="exam-subtitle">
                Choose the best answer for each question before submitting.
              </p>
            </div>
          </div>
          <div className="exam-meta">
            <span className="exam-pill">{questions.length} Questions</span>
            <span className="exam-pill subtle">
              {answeredCount}/{questions.length} answered
            </span>
          </div>
        </header>

        <div className="exam-inline-row">
          <div className="exam-notice-slot">
            <AlertModal
              isOpen={modal.open}
              title={modal.title}
              message={modal.message}
              type={modal.type}
              confirmText={modal.confirmText}
              onConfirm={modal.onConfirm || closeModal}
            />
          </div>
          <div />
        </div>

        <div className="exam-grid">
          <section className="exam-card exam-questions">
            {sortedQuestions.map((q, i) => {
              const prev = sortedQuestions[i - 1];
              const showSection = q.section && (!prev || prev.section !== q.section);
              return (
              <div key={q.id} className="exam-question">
                {showSection && (
                  <div className="exam-section">
                    <span className="exam-section-label">{q.section}</span>
                  </div>
                )}
                <div className="exam-question-header">
                  <p className="exam-question-title">
                    {i + 1}. {q.question}
                  </p>
                </div>
                <div className="exam-options">
                  {[
                    { key: "A", value: q.a },
                    { key: "B", value: q.b },
                    { key: "C", value: q.c },
                    { key: "D", value: q.d },
                  ].map((option) => (
                    <label key={option.key} className="exam-option">
                      <input
                        type="radio"
                        name={q.id}
                        onChange={() => handleChange(q.id, option.key)}
                        checked={answers[q.id] === option.key}
                      />
                      <span className="exam-option-label">{option.key}.</span>
                      <span>{option.value}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
            })}
          </section>

          <aside className="exam-card exam-sidebar">
            <h3 className="exam-sidebar-title">Submission</h3>
            <p className="exam-sidebar-text">
              You can submit when you are ready. Unanswered items count as incorrect.
            </p>
            <div className="exam-timer">
              <span className="exam-timer-label">Time Remaining</span>
              <span className="exam-timer-value">
                {minutesLeft}:{String(secondsLeft).padStart(2, "0")}
              </span>
            </div>
            <div className="exam-progress">
              <div>
                <span className="exam-progress-label">Answered</span>
                <span className="exam-progress-value">
                  {answeredCount}/{questions.length}
                </span>
              </div>
              <div>
                <span className="exam-progress-label">Remaining</span>
                <span className="exam-progress-value">
                  {Math.max(questions.length - answeredCount, 0)}
                </span>
              </div>
            </div>
            <div className="exam-progress-bar" aria-hidden="true">
              <span
                style={{
                  width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%`,
                }}
              />
            </div>
            <button
              className="exam-submit"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Exam"}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
