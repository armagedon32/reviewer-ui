import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createQuestionApi,
  listQuestionsApi,
  uploadQuestionsCsv,
  clearQuestionsApi,
  cleanupQuestionsApi,
} from "../api";
import Button from "../components/Button";
import InlineNotice from "../components/InlineNotice";

const defaultForm = {
  exam_type: "LET",
  subject: "",
  topic: "",
  difficulty: "Easy",
  question: "",
  a: "",
  b: "",
  c: "",
  d: "",
  answer: "A",
};

export default function QuestionBank() {
  const [form, setForm] = useState(defaultForm);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState("");
  const [notice, setNotice] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  const navigate = useNavigate();

  const showNotice = (next) => setNotice(next);
  const clearNotice = () => setNotice(null);

  const loadQuestions = async () => {
    setFetching(true);
    try {
      const data = await listQuestionsApi();
      setQuestions(data || []);
      clearNotice();
    } catch (err) {
      showNotice({
        type: "error",
        title: "Cannot load questions",
        message: err?.message || "Please try again later.",
        actions: [
          {
            label: "Back",
            onClick: () => navigate("/dashboard"),
          },
        ],
      });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createQuestionApi(form);
      setForm(defaultForm);
      showNotice({
        type: "success",
        title: "Question added",
        message: "The question has been saved to the bank.",
        actions: [
          {
            label: "Refresh list",
            onClick: () => loadQuestions(),
          },
        ],
      });
    } catch (err) {
      showNotice({
        type: "error",
        title: "Add failed",
        message: err?.message || "Please check the fields and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    let addedTotal = 0;
    let skippedTotal = 0;
    let failed = 0;
    for (const file of files) {
      try {
        const result = await uploadQuestionsCsv(file);
        addedTotal += result.added || 0;
        skippedTotal += result.skipped || 0;
      } catch {
        failed += 1;
      }
    }

    showNotice({
      type: failed ? "warning" : "success",
      title: failed ? "Upload completed with errors" : "Upload complete",
      message: failed
        ? `Added ${addedTotal} questions. Failed to upload ${failed} file(s).`
        : `Added ${addedTotal} questions from ${files.length} file(s).${skippedTotal ? ` Skipped ${skippedTotal} invalid row(s).` : ""}`,
      actions: [
        {
          label: "Refresh list",
          onClick: () => loadQuestions(),
        },
      ],
    });

    setUploading(false);
    e.target.value = "";
  };

  const handleClearAll = () => {
    showNotice({
      type: "warning",
      title: "Delete all questions?",
      message: "This will remove every question in the bank. This action cannot be undone.",
      actions: [
        {
          label: clearing ? "Deleting..." : "Delete all",
          onClick: async () => {
            try {
              setClearing(true);
              await clearQuestionsApi();
              showNotice({
                type: "success",
                title: "Questions deleted",
                message: "The question bank is now empty.",
              });
              await loadQuestions();
            } catch (err) {
              showNotice({
                type: "error",
                title: "Delete failed",
                message: err?.message || "Unable to delete questions.",
              });
            } finally {
              setClearing(false);
            }
          },
        },
        {
          label: "Cancel",
          onClick: () => clearNotice(),
        },
      ],
    });
  };

  const handleCleanup = () => {
    showNotice({
      type: "warning",
      title: "Clean question text?",
      message:
        "This will remove watermark text and truncate appended question numbers in all saved questions.",
      actions: [
        {
          label: cleaning ? "Cleaning..." : "Run cleanup",
          onClick: async () => {
            try {
              setCleaning(true);
              const result = await cleanupQuestionsApi();
              const updatedCount = result.updated || 0;
              const deletedCount = result.deleted || 0;
              showNotice({
                type: "success",
                title: "Cleanup complete",
                message: `Updated ${updatedCount} question(s). Removed ${deletedCount} invalid question(s).`,
                actions: [
                  {
                    label: "Refresh list",
                    onClick: () => loadQuestions(),
                  },
                ],
              });
            } catch (err) {
              showNotice({
                type: "error",
                title: "Cleanup failed",
                message: err?.message || "Unable to clean questions.",
              });
            } finally {
              setCleaning(false);
            }
          },
        },
        {
          label: "Cancel",
          onClick: () => clearNotice(),
        },
      ],
    });
  };

  return (
    <div className="container">
      <div className="card question-card">
        <div className="question-header">
          <div>
            <h2>Question Bank</h2>
            <p style={{ marginTop: -6 }}>
              For instructors/admins to add exam items.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              onClick={() => navigate("/instructor-exam-preview")}
              style={{
                width: "auto",
                background: "#1e293b",
                padding: "10px 14px",
                borderRadius: "999px",
              }}
            >
              Preview Exam Sheet
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              style={{
                width: "auto",
                background: "#0f172a",
                padding: "10px 14px",
                borderRadius: "999px",
              }}
            >
              Back to Dashboard
            </button>
            <div className="count-pill">Total: {questions.length}</div>
          </div>
        </div>

        <div className="question-grid">
          <div className="question-panel">
            <div className="panel-box">
              <div className="panel-title">Bulk upload (CSV)</div>
              <p className="panel-hint">
                Upload a CSV with headers: exam_type,subject,topic,difficulty,question,a,b,c,d,answer
              </p>
              <div style={{ marginBottom: "10px" }}>
                <a href="/question-template.csv" download className="link-cta">
                  Download template
                </a>
              </div>
              <input
                type="file"
                accept=".csv"
                multiple
                onChange={handleUpload}
                disabled={uploading}
              />
              <p className="panel-helper">
                Difficulty must be Easy, Medium, or Hard. Answer must be A, B, C, or D.
              </p>
            </div>

            <div className="panel-box" style={{ marginTop: "14px" }}>
              <div className="panel-title">
                Existing Questions ({questions.length})
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Search by subject, topic, or text..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleCleanup}
                  disabled={cleaning || fetching || questions.length === 0}
                  style={{
                    width: "auto",
                    background: "#f59e0b",
                    color: "white",
                    padding: "10px 14px",
                    borderRadius: "6px",
                  }}
                >
                  {cleaning ? "Cleaning..." : "Clean text"}
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={clearing || fetching || questions.length === 0}
                  style={{
                    width: "auto",
                    background: "#ef4444",
                    color: "white",
                    padding: "10px 14px",
                    borderRadius: "6px",
                  }}
                >
                  {clearing ? "Deleting..." : "Delete all"}
                </button>
              </div>
              {fetching ? (
                <p>Loading questions...</p>
              ) : questions.length === 0 ? (
                <p>No questions yet.</p>
              ) : (
                <div className="question-list">
                  {questions
                    .filter((q) => {
                      const term = filter.trim().toLowerCase();
                      if (!term) return true;
                      return (
                        q.subject?.toLowerCase().includes(term) ||
                        q.topic?.toLowerCase().includes(term) ||
                        q.question?.toLowerCase().includes(term) ||
                        q.exam_type?.toLowerCase().includes(term)
                      );
                    })
                    .map((q) => (
                      <div key={q.id} className="question-row">
                        <strong>
                          [{q.exam_type}] {q.subject} ({q.difficulty})
                        </strong>
                        <p style={{ margin: "4px 0" }}>{q.question}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="question-panel">
            <div className="panel-box panel-box--relative">
              <div className="panel-title">Add question</div>
              <InlineNotice
                type={notice?.type}
                title={notice?.title}
                message={notice?.message}
                actions={notice?.actions || []}
                onClose={notice ? clearNotice : null}
              />
              <form onSubmit={handleSubmit}>
                <label>Exam Type</label>
                <select
                  value={form.exam_type}
                  onChange={(e) => handleChange("exam_type", e.target.value)}
                  required
                >
                  <option value="LET">LET</option>
                  <option value="CPA">CPA</option>
                </select>

                <label>Subject</label>
                <input
                  value={form.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  required
                />

                <label>Topic</label>
                <input
                  value={form.topic}
                  onChange={(e) => handleChange("topic", e.target.value)}
                  required
                />

                <label>Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={(e) => handleChange("difficulty", e.target.value)}
                  required
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>

                <label>Question</label>
                <textarea
                  value={form.question}
                  onChange={(e) => handleChange("question", e.target.value)}
                  required
                  rows={3}
                  style={{ width: "100%", padding: "10px", marginBottom: "12px" }}
                />

                {["a", "b", "c", "d"].map((opt) => (
                  <div key={opt}>
                    <label>Option {opt.toUpperCase()}</label>
                    <input
                      value={form[opt]}
                      onChange={(e) => handleChange(opt, e.target.value)}
                      required
                    />
                  </div>
                ))}

                <label>Correct Answer</label>
                <select
                  value={form.answer}
                  onChange={(e) => handleChange("answer", e.target.value)}
                  required
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>

                <Button
                  type="submit"
                  text={loading ? "Saving..." : "Add Question"}
                  disabled={loading}
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
