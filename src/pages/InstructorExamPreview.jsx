import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listQuestionsApi, updateQuestionApi } from "../api";
import { getSystemLogo } from "../systemLogo";

export default function InstructorExamPreview() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examType, setExamType] = useState("ALL");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [limit, setLimit] = useState(50);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState({
    question: "",
    a: "",
    b: "",
    c: "",
    d: "",
    answer: "A",
    difficulty: "Easy",
  });
  const [savingId, setSavingId] = useState(null);
  const logoSrc = getSystemLogo();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await listQuestionsApi();
        if (!cancelled) setQuestions(data || []);
      } catch {
        if (!cancelled) setQuestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const examTypes = useMemo(() => {
    const types = new Set(questions.map((q) => q.exam_type).filter(Boolean));
    return ["ALL", ...Array.from(types)];
  }, [questions]);

  const subjects = useMemo(() => {
    const list = questions
      .filter((q) => (examType === "ALL" ? true : q.exam_type === examType))
      .map((q) => q.subject)
      .filter(Boolean);
    return ["ALL", ...Array.from(new Set(list))];
  }, [questions, examType]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return questions.filter((q) => {
      if (examType !== "ALL" && q.exam_type !== examType) return false;
      if (subjectFilter && subjectFilter !== "ALL" && q.subject !== subjectFilter) {
        return false;
      }
      if (!term) return true;
      return (
        q.question?.toLowerCase().includes(term) ||
        q.topic?.toLowerCase().includes(term) ||
        q.subject?.toLowerCase().includes(term) ||
        q.a?.toLowerCase().includes(term) ||
        q.b?.toLowerCase().includes(term) ||
        q.c?.toLowerCase().includes(term) ||
        q.d?.toLowerCase().includes(term)
      );
    });
  }, [questions, examType, subjectFilter, search]);

  const previewItems = filtered.slice(0, limit);

  const downloadCsv = () => {
    const rows = filtered.length ? filtered : questions;
    const hasRationale = rows.some((q) => q.rationale);
    const headers = [
      "exam_type",
      "subject",
      "topic",
      "difficulty",
      "question",
      "a",
      "b",
      "c",
      "d",
      "answer",
    ];
    if (hasRationale) headers.push("rationale");
    const escapeCell = (value) => {
      const text = value == null ? "" : String(value);
      const escaped = text.replace(/"/g, '""');
      return `"${escaped}"`;
    };
    const lines = [
      headers.join(","),
      ...rows.map((q) => {
        const base = [
          q.exam_type,
          q.subject,
          q.topic,
          q.difficulty,
          q.question,
          q.a,
          q.b,
          q.c,
          q.d,
          q.answer,
        ];
        if (hasRationale) base.push(q.rationale || "");
        return base.map(escapeCell).join(",");
      }),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const suffix = examType === "ALL" ? "all" : examType.toLowerCase();
    link.href = url;
    link.download = `question-bank-${suffix}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const startEdit = (q) => {
    setEditingId(q.id);
    setDraft({
      question: q.question || "",
      a: q.a || "",
      b: q.b || "",
      c: q.c || "",
      d: q.d || "",
      answer: q.answer || "A",
      difficulty: q.difficulty || "Easy",
    });
    setEditOpen(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({ question: "", a: "", b: "", c: "", d: "", answer: "A", difficulty: "Easy" });
    setEditOpen(false);
  };

  const saveEdit = async (id) => {
    setSavingId(id);
    try {
      const updated = await updateQuestionApi(id, draft);
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, ...updated } : q))
      );
      cancelEdit();
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="exam-page">
        <div className="exam-shell">
          <div className="exam-card exam-loading">
            <h2 className="exam-title">Exam Preview</h2>
            <p className="exam-subtitle">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-page">
      <div className="exam-shell">
        <header className="exam-header">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img src={logoSrc} alt="System logo" className="dashboard-logo" />
            <div>
            <p className="exam-kicker">Instructor Preview</p>
            <h2 className="exam-title">Exam Sheet Preview</h2>
            <p className="exam-subtitle">
              Use this view to spot formatting errors. Click Edit to fix a question.
            </p>
            </div>
          </div>
          <div className="exam-meta">
            <span className="exam-pill">{filtered.length} Questions</span>
            <button type="button" className="exam-preview-back" onClick={downloadCsv}>
              Download CSV
            </button>
            <button
              type="button"
              className="exam-preview-back"
              onClick={() => navigate("/questions")}
            >
              Back to Question Bank
            </button>
          </div>
        </header>

        <div className="exam-grid">
          <section className="exam-card exam-questions">
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              <select value={examType} onChange={(e) => setExamType(e.target.value)}>
                {examTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                {subjects.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
              <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
                {[10, 25, 50, 100, 250, 500, 1000].map((n) => (
                  <option key={n} value={n}>
                    Show {n}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search question, topic, or subject..."
                style={{ minWidth: 220, flex: 1 }}
              />
            </div>

            {previewItems.length === 0 ? (
              <p>No questions matched your filters.</p>
            ) : (
              previewItems.map((q, i) => (
                <div key={q.id || i} className="exam-question">
                  <div className="exam-question-header">
                    <p className="exam-question-title">
                      {i + 1}. {q.question}
                    </p>
                    <span className="status-pill subtle">
                      {q.exam_type} - {q.subject} - {q.difficulty}
                    </span>
                  </div>
                  <div className="exam-options">
                    {[
                      { key: "A", value: q.a },
                      { key: "B", value: q.b },
                      { key: "C", value: q.c },
                      { key: "D", value: q.d },
                    ].map((option) => (
                      <label key={option.key} className="exam-option">
                        <input type="radio" disabled />
                        <span className="exam-option-label">{option.key}.</span>
                        <span>{option.value}</span>
                      </label>
                    ))}
                  </div>
                  <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button type="button" onClick={() => startEdit(q)}>
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>

          <aside className="exam-card exam-sidebar">
            <h3 className="exam-sidebar-title">Preview Notes</h3>
            <p className="exam-sidebar-text">
              This is a read-only preview. Use it to verify text formatting and
              answer options for errors.
            </p>
            <div className="exam-progress">
              <div>
                <span className="exam-progress-label">Showing</span>
                <span className="exam-progress-value">
                  {previewItems.length}/{filtered.length}
                </span>
              </div>
              <div>
                <span className="exam-progress-label">Total in bank</span>
                <span className="exam-progress-value">{questions.length}</span>
              </div>
            </div>
            <button
              className="exam-submit"
              type="button"
              onClick={() => navigate("/questions")}
            >
              Back to Question Bank
            </button>
          </aside>
        </div>
      </div>

      {editOpen && (
        <div className="alert-overlay">
          <div className="alert-modal admin-modal">
            <div className="admin-modal-header">
              <h3>Edit Question</h3>
              <button type="button" className="admin-modal-close" onClick={cancelEdit}>
                Close
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-grid">
                <div className="admin-form-field">
                  <label>Question</label>
                  <textarea
                    rows={3}
                    value={draft.question}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, question: e.target.value }))
                    }
                  />
                </div>
                <div className="admin-form-field">
                  <label>Option A</label>
                  <input
                    value={draft.a}
                    onChange={(e) => setDraft((prev) => ({ ...prev, a: e.target.value }))}
                  />
                </div>
                <div className="admin-form-field">
                  <label>Option B</label>
                  <input
                    value={draft.b}
                    onChange={(e) => setDraft((prev) => ({ ...prev, b: e.target.value }))}
                  />
                </div>
                <div className="admin-form-field">
                  <label>Option C</label>
                  <input
                    value={draft.c}
                    onChange={(e) => setDraft((prev) => ({ ...prev, c: e.target.value }))}
                  />
                </div>
                <div className="admin-form-field">
                  <label>Option D</label>
                  <input
                    value={draft.d}
                    onChange={(e) => setDraft((prev) => ({ ...prev, d: e.target.value }))}
                  />
                </div>
                <div className="admin-form-field">
                  <label>Difficulty</label>
                  <select
                    value={draft.difficulty}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, difficulty: e.target.value }))
                    }
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div className="admin-form-field">
                  <label>Answer</label>
                  <select
                    value={draft.answer}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, answer: e.target.value }))
                    }
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div className="admin-form-actions">
                  <button
                    type="button"
                    onClick={() => saveEdit(editingId)}
                    disabled={savingId === editingId}
                  >
                    {savingId === editingId ? "Saving..." : "Save changes"}
                  </button>
                  <button type="button" onClick={cancelEdit}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
