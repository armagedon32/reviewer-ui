import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../auth";

export default function ReviewMissed() {
  const navigate = useNavigate();
  const user = getUser();
  const data = useMemo(() => {
    const missedKey = user?.email ? `missed_questions_${user.email}` : "missed_questions";
    const stored = localStorage.getItem(missedKey);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }, []);

  const items = data?.items || [];

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <div className="review-header">
          <div>
            <p className="dashboard-kicker">Review</p>
            <h2 className="dashboard-title">Missed Questions</h2>
            {data?.date && (
              <p className="dashboard-email">
                Latest exam: {new Date(data.date).toLocaleString()}
              </p>
            )}
          </div>
          <button className="review-back" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>

        <section className="dashboard-card review-card">
          {items.length ? (
            <div className="review-table">
              <div className="review-row review-head">
                <div>#</div>
                <div>Question</div>
                <div>Topic / Competency</div>
                <div>Correct vs Student</div>
                <div>Difficulty</div>
                <div>Reference</div>
              </div>
              {items.map((item, index) => (
                <div key={`${item.id}-${index}`} className="review-row">
                  <div>{item.question_number || index + 1}</div>
                  <div className="review-question">{item.question}</div>
                  <div>{item.topic || "-"}</div>
                  <div>
                    {item.correct_answer} vs {item.student_answer}
                  </div>
                  <div>{item.difficulty || "-"}</div>
                  <div>{item.reference || "-"}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="review-empty">
              No missed questions yet. Complete an exam to see your review list.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
