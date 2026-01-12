import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { startExamApi, submitExamApi } from "../api";

export default function Exam() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    startExamApi().then(setQuestions);
  }, []);

  function handleChange(qid, value) {
    setAnswers({ ...answers, [qid]: value });
  }

  async function handleSubmit() {
    const res = await submitExamApi(answers);
    setResult(res);
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

  return (
    <div className="container">
      <div className="card">
        <h2>Mock Board Exam</h2>

        {questions.map((q, i) => (
          <div key={q.id} style={{ marginBottom: "20px" }}>
            <p><b>{i + 1}. {q.question}</b></p>

            <label>
              <input type="radio" name={q.id} onChange={() => handleChange(q.id, "A")} />
              A. {q.a}
            </label><br />

            <label>
              <input type="radio" name={q.id} onChange={() => handleChange(q.id, "B")} />
              B. {q.b}
            </label><br />

            <label>
              <input type="radio" name={q.id} onChange={() => handleChange(q.id, "C")} />
              C. {q.c}
            </label><br />

            <label>
              <input type="radio" name={q.id} onChange={() => handleChange(q.id, "D")} />
              D. {q.d}
            </label>
          </div>
        ))}

        <button
          onClick={handleSubmit}
          style={{
            marginTop: "30px",
            padding: "12px",
            width: "100%",
            backgroundColor: "#2563eb",
            color: "white",
            fontSize: "16px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer"
          }}
        >
          Submit Exam
        </button>
      </div>
    </div>
  );
}
