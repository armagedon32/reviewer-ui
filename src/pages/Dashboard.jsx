import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getUser } from "../auth";
import { getAccessStatusApi, getExamHistoryApi, getExamStatsApi, getProfileApi, requestAccessApi } from "../api";
import ProfileSetup from "./ProfileSetup";
import InstructorProfileSetup from "./InstructorProfileSetup";
import AlertModal from "../components/AlertModal";
import { getSystemLogo } from "../systemLogo";

export default function Dashboard() {
  const user = getUser();
  const logo = getSystemLogo();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [instructorProfile, setInstructorProfile] = useState(null);
  const [loadingInstructorProfile, setLoadingInstructorProfile] = useState(true);
  const [editingInstructorProfile, setEditingInstructorProfile] = useState(false);
  const [accessDecision, setAccessDecision] = useState(null);
  const [accessRequest, setAccessRequest] = useState(null);
  const [examHistory, setExamHistory] = useState([]);
  const [classStats, setClassStats] = useState(null);
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "success",
    confirmText: "OK",
    onConfirm: null,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const forceProfileKey = user?.email ? `force_profile_setup_${user.email}` : "force_profile_setup";
  const isForcedProfileSetup = localStorage.getItem(forceProfileKey) === "1";

  const closeModal = () =>
    setModal((prev) => ({
      ...prev,
      open: false,
    }));

  const handleProfileSaved = (savedProfile) => {
    setProfile(savedProfile);
    setEditingProfile(false);
    const wasForced = localStorage.getItem(forceProfileKey) === "1";
    if (wasForced) {
      localStorage.removeItem(forceProfileKey);
    }
    const wasEditing = editingProfile;
    const isApproved = accessDecision === "approved";
    if (user?.email) {
      getAccessStatusApi()
        .then((data) => {
          setAccessDecision(data.status || null);
          setAccessRequest(data.requested_at ? { requested_at: data.requested_at } : null);
        })
        .catch(() => {});
    }
    if (wasForced && !isApproved) {
      navigate("/approval-pending", { replace: true });
      return;
    }
    setModal({
      open: true,
      title: "Profile already saved",
      message: wasEditing
        ? "Your profile updates are saved."
        : isApproved
          ? "You can now proceed to the exam."
          : "Your profile is saved and pending admin approval.",
      type: "success",
      confirmText: wasEditing ? "OK" : isApproved ? "Take exam" : "OK",
      onConfirm: () => {
        closeModal();
        if (!wasEditing && isApproved) {
          navigate("/exam");
        }
      },
    });
  };

  const handleInstructorProfileSaved = (savedProfile) => {
    setInstructorProfile(savedProfile);
    setEditingInstructorProfile(false);
    const wasForced = localStorage.getItem(forceProfileKey) === "1";
    if (wasForced) {
      localStorage.removeItem(forceProfileKey);
    }
    const isApproved = accessDecision === "approved";
    if (user?.email) {
      getAccessStatusApi()
        .then((data) => {
          setAccessDecision(data.status || null);
          setAccessRequest(data.requested_at ? { requested_at: data.requested_at } : null);
        })
        .catch(() => {});
    }
    if (wasForced && !isApproved) {
      navigate("/approval-pending", { replace: true });
      return;
    }
    setModal({
      open: true,
      title: "Profile saved",
      message: isApproved
        ? "Your instructor profile is ready."
        : "Your instructor profile is pending admin approval.",
      type: "success",
      confirmText: "OK",
      onConfirm: closeModal,
    });
  };

  useEffect(() => {
    if (user.role === "student") {
      getProfileApi()
        .then((data) => {
          setProfile(data);
          if (!data) {
            const storageKey = user?.email
              ? `profile_avatar_${user.email}`
              : "profile_avatar";
            localStorage.removeItem(storageKey);
          }
        })
        .catch(() => setProfile(null))
        .finally(() => setLoadingProfile(false));
    }
  }, [user.role]);

  useEffect(() => {
    if (!isForcedProfileSetup) return;
    if (user.role === "student" && !loadingProfile) {
      setEditingProfile(true);
    }
    if (user.role === "instructor" && !loadingInstructorProfile) {
      setEditingInstructorProfile(true);
    }
  }, [
    isForcedProfileSetup,
    user.role,
    loadingProfile,
    loadingInstructorProfile,
  ]);

  useEffect(() => {
    if (user.role !== "instructor") return;
    const storageKey = user?.email
      ? `instructor_profile_${user.email}`
      : "instructor_profile";
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setInstructorProfile(JSON.parse(stored));
      } catch {
        setInstructorProfile(null);
      }
    } else {
      setInstructorProfile(null);
    }
    setLoadingInstructorProfile(false);
  }, [user.role, user?.email]);

  useEffect(() => {
    if (!user?.email || (user.role !== "student" && user.role !== "instructor")) {
      return;
    }
    if (editingProfile || editingInstructorProfile) {
      return;
    }
    const refreshAccessState = async () => {
      try {
        const data = await getAccessStatusApi();
        setAccessDecision(data.status || null);
        setAccessRequest(data.requested_at ? { requested_at: data.requested_at } : null);
        if (data.status === "pending" && !data.requested_at) {
          requestAccessApi()
            .then((requestData) => {
              setAccessDecision(requestData.status || "pending");
              setAccessRequest(
                requestData.requested_at
                  ? { requested_at: requestData.requested_at }
                  : null
              );
            })
            .catch(() => {});
        }
      } catch {
        setAccessDecision("pending");
        setAccessRequest(null);
      }
    };
    refreshAccessState();
    const interval = setInterval(refreshAccessState, 10000);
    return () => clearInterval(interval);
  }, [user?.email, user?.role, editingProfile, editingInstructorProfile]);

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
        if (stored) {
          try {
            setExamHistory(JSON.parse(stored));
          } catch {
            setExamHistory([]);
          }
        }
      });
  }, []);

  useEffect(() => {
    if (user.role !== "instructor") return;
    const program = instructorProfile?.program || null;
    getExamStatsApi(program)
      .then((data) => setClassStats(data))
      .catch(() => setClassStats(null));
  }, [user.role, instructorProfile?.program]);

  const latestExam = examHistory[0] || null;
  const latestSubjects = latestExam?.subject_performance || {};
  const subjectBreakdown = Object.keys(latestSubjects).length
    ? Object.entries(latestSubjects).map(([label, stat]) => ({
        label,
        value: Math.round((stat.correct / stat.total) * 100),
      }))
    : [];

  const totalAttempts = examHistory.length;
  const passCount = examHistory.filter((entry) => entry.result === "PASS").length;
  const passRate = totalAttempts ? Math.round((passCount / totalAttempts) * 100) : 0;
  const bestSubject = subjectBreakdown.length
    ? subjectBreakdown.reduce(
        (best, item) => (item.value > best.value ? item : best),
        subjectBreakdown[0]
      )
    : null;
  const weakestSubject = subjectBreakdown.length
    ? subjectBreakdown.reduce(
        (weakest, item) => (item.value < weakest.value ? item : weakest),
        subjectBreakdown[0]
      )
    : null;
  const latestResultText = latestExam
    ? `${latestExam.percentage}% (${latestExam.score}/${latestExam.total})`
    : "-";
  const effectiveAccessDecision =
    user.role === "admin" ? "approved" : accessDecision || "pending";
  const isApproved = effectiveAccessDecision === "approved";
  const instructorProfileSafe = instructorProfile || {
    name: "-",
    employee_id: "-",
    department: "-",
    position: "-",
    program: "-",
  };
  const studentProfileComplete =
    !!profile &&
    !!profile.student_id_number &&
    !!profile.first_name &&
    !!profile.last_name &&
    !!profile.email_address &&
    !!profile.username &&
    !!profile.program_degree &&
    !!profile.status &&
    !!profile.target_licensure &&
    (profile.target_licensure !== "LET" ||
      profile.let_track === "Elementary" ||
      !!profile.major_specialization) &&
    Array.isArray(profile.assigned_review_subjects) &&
    profile.assigned_review_subjects.length > 0 &&
    typeof profile.required_passing_threshold === "number";
  const instructorProfileComplete =
    !!instructorProfile &&
    !!instructorProfile.name &&
    !!instructorProfile.employee_id &&
    !!instructorProfile.department &&
    !!instructorProfile.position &&
    !!instructorProfile.program;
  const isProfileComplete =
    user.role === "student"
      ? studentProfileComplete
      : user.role === "instructor"
        ? instructorProfileComplete
        : true;
  let statusLabel = latestExam ? latestExam.result : "Active";
  let statusClass =
    latestExam?.result === "PASS"
      ? "status-pill pass"
      : latestExam?.result === "FAIL"
        ? "status-pill fail"
        : "status-pill";
  if (user.role !== "admin" && (effectiveAccessDecision !== "approved" || !isProfileComplete)) {
    if (effectiveAccessDecision === "denied") {
      statusLabel = "Inactive";
      statusClass = "status-pill fail";
    } else {
      statusLabel = "Pending";
      statusClass = "status-pill subtle";
    }
  }
  const trendStyleFor = (percentage) => {
    if (percentage >= 90) {
      return {
        background: "linear-gradient(180deg, #16a34a, #4ade80)",
        boxShadow: "0 8px 18px rgba(22, 163, 74, 0.25)",
      };
    }
    if (percentage >= 75) {
      return {
        background: "linear-gradient(180deg, #0ea5e9, #7dd3fc)",
        boxShadow: "0 8px 18px rgba(14, 165, 233, 0.25)",
      };
    }
    if (percentage >= 60) {
      return {
        background: "linear-gradient(180deg, #f59e0b, #fcd34d)",
        boxShadow: "0 8px 18px rgba(245, 158, 11, 0.25)",
      };
    }
    if (percentage >= 40) {
      return {
        background: "linear-gradient(180deg, #f97316, #fdba74)",
        boxShadow: "0 8px 18px rgba(249, 115, 22, 0.25)",
      };
    }
    return {
      background: "linear-gradient(180deg, #ef4444, #fca5a5)",
      boxShadow: "0 8px 18px rgba(239, 68, 68, 0.25)",
    };
  };

  const performanceTrend = examHistory
    .slice(0, 7)
    .reverse();
  const classTrend = (classStats?.recent_scores || []).map((score, index) => ({
    date: new Date(Date.now() - (classStats.recent_scores.length - index - 1) * 86400000),
    percentage: Math.round(score),
  }));

  const averageScore = examHistory.length
    ? Math.round(
        examHistory.reduce((sum, entry) => sum + entry.percentage, 0) / examHistory.length
      )
    : 0;
  const readinessSteps = 2;
  const latestScore = latestExam?.percentage ?? 0;
  const prevScore = examHistory.length > 1 ? examHistory[1].percentage : latestScore;
  const baseDelta = latestScore - prevScore;
  const projectedScores = [];
  let projected = latestScore;
  let delta = baseDelta;
  for (let i = 0; i < readinessSteps; i += 1) {
    delta *= 0.7; // diminishing returns
    projected += delta;
    projectedScores.push(Math.max(0, Math.min(100, Math.round(projected))));
  }
  const readinessLow = projectedScores.length ? Math.min(...projectedScores) : latestScore;
  const readinessHigh = projectedScores.length ? Math.max(...projectedScores) : latestScore;

  // AI interpretation: map latest exam percentage to a mastery band.
  const badge =
    latestExam && typeof latestExam.percentage === "number"
      ? latestExam.percentage >= 90
        ? {
            color: "green",
            label: "Mastery",
            note: "Ready for certification / mock board pass",
          }
        : latestExam.percentage >= 75
          ? { color: "yellow", label: "Developing", note: "Needs targeted review" }
          : latestExam.percentage >= 60
            ? { color: "orange", label: "Guided", note: "Requires structured intervention" }
            : latestExam.percentage >= 40
              ? { color: "blue", label: "Exploratory", note: "Early-stage learning" }
              : { color: "red", label: "Struggling", note: "Immediate remediation" }
      : null;

  useEffect(() => {
    if (user.role !== "student" || !profile || editingProfile) return;
    const params = new URLSearchParams(location.search);
    if (params.get("edit") === "1") {
      setEditingProfile(true);
      navigate("/dashboard", { replace: true });
    }
  }, [user.role, profile, editingProfile, location.search, navigate]);


  const requestAccess = () => {
    if (!user?.email) return;
    requestAccessApi()
      .then((data) => {
        setAccessDecision(data.status || "pending");
        setAccessRequest(data.requested_at ? { requested_at: data.requested_at } : null);
      })
      .catch(() => {});
  };

  const renderAccessGate = () => {
    const status = effectiveAccessDecision;
    if (isApproved) return null;
    const requestExpired = status === "expired";
    const title =
      status === "denied"
        ? "Access denied"
        : requestExpired
          ? "Approval request expired"
          : "Awaiting admin approval";
    const message =
      status === "denied"
        ? "Your account is inactive. Please contact the administrator or resend a request."
        : requestExpired || status === "expired"
          ? "Your request timed out after 7 days. Please resend to notify the admin."
          : "Your request is pending. Please wait for instructor/admin approval.";
    const showResendButton = status === "denied" || requestExpired || status === "expired";
    return (
      <div className="dashboard-card">
        <h3>{title}</h3>
        <p className="status-note" style={{ marginTop: 8 }}>
          {message}
        </p>
        {showResendButton && (
          <button style={{ marginTop: 12 }} onClick={() => requestAccess()}>
            Resend approval request
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div className="dashboard-intro">
            <img src={logo} alt="System logo" className="dashboard-logo" />
            <div className="dashboard-text">
              <p className="dashboard-kicker">Welcome back</p>
              <div className="dashboard-heading">
                <h2 className="dashboard-title">{user.role.toUpperCase()} DASHBOARD</h2>
                <div className="dashboard-status">
                  <span className={statusClass}>{statusLabel}</span>
                  <span className="status-note">
                    {latestExam
                      ? `Last exam: ${latestExam.percentage}%`
                      : "Last sync: just now"}
                  </span>
                </div>
              </div>
              <p className="dashboard-email">{user.email}</p>
            </div>
          </div>
        </header>
        <AlertModal
          isOpen={modal.open}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          confirmText={modal.confirmText}
          onConfirm={modal.onConfirm || closeModal}
        />

        {/* STUDENT */}
        {user.role === "student" && (
          <>
            {loadingProfile ? (
              <div className="dashboard-card">Loading profile...</div>
            ) : !isApproved && !editingProfile ? (
              renderAccessGate()
            ) : editingProfile ? (
              <div className="dashboard-card">
                <ProfileSetup
                  onSaved={handleProfileSaved}
                  onCancel={() => setEditingProfile(false)}
                />
              </div>
            ) : !profile ? (
              <div className="dashboard-card">
                <h3>Profile not set</h3>
                <p className="status-note" style={{ marginTop: 8 }}>
                  Your account is approved. Please complete your profile to access exams
                  and analytics.
                </p>
                <button style={{ marginTop: 12 }} onClick={() => setEditingProfile(true)}>
                  Complete Profile
                </button>
              </div>
            ) : (
              <>
                {!studentProfileComplete && (
                  <div className="dashboard-card">
                    <h3>Profile incomplete</h3>
                    <p className="status-note" style={{ marginTop: 8 }}>
                      Your account is approved. You can continue using the dashboard,
                      but completing your profile improves exam setup and tracking.
                    </p>
                    <button style={{ marginTop: 12 }} onClick={() => setEditingProfile(true)}>
                      Complete Profile
                    </button>
                  </div>
                )}
                <div className="dashboard-grid">
                  <section className="dashboard-card profile-card">
                    <div className="card-header">
                      <h3>Student Profile</h3>
                      <span className="status-pill subtle">Verified</span>
                    </div>
                    <div className="profile-grid">
                      <div className="profile-item">
                        <span className="profile-label">Student ID</span>
                        <span className="profile-value">{profile.student_id_number}</span>
                      </div>
                      <div className="profile-item">
                        <span className="profile-label">Full Name</span>
                        <span className="profile-value">
                          {[profile.first_name, profile.middle_name, profile.last_name]
                            .filter(Boolean)
                            .join(" ")}
                        </span>
                      </div>
                      <div className="profile-item">
                        <span className="profile-label">Email</span>
                        <span className="profile-value">{profile.email_address}</span>
                      </div>
                      <div className="profile-item">
                        <span className="profile-label">Username</span>
                        <span className="profile-value">{profile.username}</span>
                      </div>
                      <div className="profile-item">
                        <span className="profile-label">Program / Degree</span>
                        <span className="profile-value">{profile.program_degree}</span>
                      </div>
                      <div className="profile-item">
                        <span className="profile-label">Year Level</span>
                        <span className="profile-value">{profile.year_level}</span>
                      </div>
                      {profile.section_class && (
                        <div className="profile-item">
                          <span className="profile-label">Section / Class</span>
                          <span className="profile-value">{profile.section_class}</span>
                        </div>
                      )}
                      <div className="profile-item">
                        <span className="profile-label">Status</span>
                        <span className="profile-value">{profile.status}</span>
                      </div>
                      <div className="profile-item">
                        <span className="profile-label">Target Licensure</span>
                        <span className="profile-value">{profile.target_licensure}</span>
                      </div>
                      {profile.target_licensure === "LET" && (
                        <div className="profile-item">
                          <span className="profile-label">LET Track</span>
                          <span className="profile-value">{profile.let_track}</span>
                        </div>
                      )}
                      <div className="profile-item">
                        <span className="profile-label">Specialization</span>
                        <span className="profile-value">{profile.major_specialization}</span>
                      </div>
                      <div className="profile-item">
                        <span className="profile-label">Review Subjects</span>
                        <span className="profile-value">
                          {profile.assigned_review_subjects?.join(", ")}
                        </span>
                      </div>
                      <div className="profile-item">
                        <span className="profile-label">Passing Threshold</span>
                        <span className="profile-value">
                          {profile.required_passing_threshold}%
                        </span>
                      </div>
                    </div>
                    <div className="badge-card">
                      <svg
                        className={`badge-icon ${badge ? badge.color : "muted"}`}
                        viewBox="0 0 32 32"
                        aria-hidden="true"
                      >
                        <circle cx="16" cy="12" r="8" />
                        <path d="M9 20l-1 9 8-5 8 5-1-9" />
                      </svg>
                      <div>
                        <p className="badge-title">
                          {badge ? `${badge.label} Badge` : "Badge Pending"}
                        </p>
                        <p className="badge-note">
                          {badge ? badge.note : "Complete your first exam to earn a badge."}
                        </p>
                        <p className="badge-explain">
                          AI interprets your latest score into a mastery band to guide
                          your next study steps.
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setEditingProfile(true)}>
                      Edit Profile
                    </button>
                  </section>

                  <section className="dashboard-card progress-card">
                    <div className="card-header">
                      <h3>Improvement Trend</h3>
                      <span className="trend-pill positive">
                        {latestExam ? `${latestExam.percentage}%` : "No data"}
                      </span>
                    </div>
                    <div className="trend-graph">
                      {performanceTrend.length ? (
                        performanceTrend.map((entry, index) => (
                          <div key={`${entry.date}-${index}`} className="trend-column">
                            <div
                              className="trend-bar"
                              style={{
                                height: `${entry.percentage}%`,
                                ...trendStyleFor(entry.percentage),
                              }}
                              title={`${entry.percentage}%`}
                            />
                            <span className="trend-label">
                              {new Date(entry.date).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="trend-empty">No exam data yet</div>
                      )}
                    </div>
                    <div className="trend-metrics">
                      <div className="metric">
                        <span className="metric-label">Latest Exam</span>
                        <span className="metric-value">
                          {latestExam ? `${latestExam.percentage}%` : "-"}
                        </span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Average</span>
                        <span className="metric-value">
                          {examHistory.length ? `${averageScore}%` : "-"}
                        </span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Target</span>
                        <span className="metric-value">
                          {profile?.required_passing_threshold
                            ? `${profile.required_passing_threshold}%`
                            : "90%"}
                        </span>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="dashboard-grid">
                  <section className="dashboard-card actions-card">
                    <div className="card-header">
                      <h3>Quick Actions</h3>
                      <span className="status-note">Keep momentum</span>
                    </div>
                    <div className="action-grid">
                      <button onClick={() => navigate("/exam-preview")}>
                        Start Mock Board Exam
                      </button>
                      <button onClick={() => navigate("/review-missed")}>
                        Review Missed Questions
                      </button>
                      <button onClick={() => navigate("/analytics")}>
                        View Analytics
                      </button>
                      <button>Certification Status</button>
                    </div>
                  </section>

                  <section className="dashboard-card results-card">
                    <div className="card-header">
                      <h3>Results Snapshot</h3>
                      <span className="status-note">Last 7 days</span>
                    </div>
                    {subjectBreakdown.length ? (
                      <>
                        <div className="results-list">
                          {subjectBreakdown.map((item) => (
                            <div key={item.label} className="result-row">
                              <span className="result-label">{item.label}</span>
                              <div className="result-bar">
                                <span style={{ width: `${item.value}%` }} />
                              </div>
                              <span className="result-score">{item.value}%</span>
                            </div>
                          ))}
                        </div>
                        <div className="highlight-card">
                          <p className="highlight-title">Focus Area</p>
                          <p className="highlight-text">
                            Because your {weakestSubject?.label} accuracy (
                            {weakestSubject?.value ?? 0}%) is below the 90% mastery threshold,
                            the system recommends focused remediation in this area.
                          </p>
                        </div>
                        <div className="forecast-card">
                          <div className="forecast-header">
                            <span className="forecast-step">LT</span>
                            <div>
                              <p className="forecast-title">Long-Term Readiness Forecast</p>
                              <p className="forecast-subtitle">
                                Based on current policy trajectory
                              </p>
                            </div>
                          </div>
                          <div className="forecast-score">
                            Predicted Readiness: {readinessLow}%–{readinessHigh}%
                          </div>
                          <ul className="forecast-bullets">
                            <li>Recent performance: {latestScore}% (latest exam)</li>
                            <li>Improvement velocity: {Math.round(baseDelta)}% per attempt</li>
                            <li>Diminishing gains assumed across {readinessSteps} future attempts</li>
                          </ul>
                        </div>
                      </>
                    ) : (
                      <p className="history-empty">No results yet.</p>
                    )}
                  </section>
                </div>

                <div className="dashboard-grid">
                  <section className="dashboard-card history-card">
                    <div className="card-header">
                      <h3>Exam History</h3>
                      <span className="status-note">Most recent results</span>
                    </div>
                    {examHistory.length ? (
                      <div className="history-list">
                        {examHistory.map((entry, index) => (
                          <div key={`${entry.date}-${index}`} className="history-row">
                            <div>
                              <p className="history-title">
                                {entry.result} • {entry.percentage}%
                              </p>
                              <p className="history-subtitle">
                                {new Date(entry.date).toLocaleString()}
                              </p>
                            </div>
                            <span className="history-score">
                              {entry.score}/{entry.total}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="history-empty">No exam history yet.</p>
                    )}
                  </section>
                </div>

                <div className="dashboard-grid">
                  <section className="dashboard-card analytics-card">
                    <div className="card-header">
                      <h3>Analytics</h3>
                      <span className="status-note">Based on exam history</span>
                    </div>
                    <div className="analytics-grid">
                      <div className="metric">
                        <span className="metric-label">Attempts</span>
                        <span className="metric-value">{totalAttempts || "-"}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Pass Rate</span>
                        <span className="metric-value">
                          {totalAttempts ? `${passRate}%` : "-"}
                        </span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Latest Result</span>
                        <span className="metric-value">{latestResultText}</span>
                      </div>
                    </div>
                    <div className="analytics-split">
                      <div>
                        <p className="analytics-label">Best Subject</p>
                        <p className="analytics-value">
                          {bestSubject ? `${bestSubject.label} ? ${bestSubject.value}%` : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="analytics-label">Focus Subject</p>
                        <p className="analytics-value">
                          {weakestSubject ? `${weakestSubject.label} ? ${weakestSubject.value}%` : "-"}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="dashboard-card recommendations-card">
                    <div className="card-header">
                      <h3>Recommendations</h3>
                      <span className="status-note">Next best actions</span>
                    </div>
                    <ul className="recommendation-list">
                      {!latestExam && (
                        <li>Take your first mock exam to unlock analytics.</li>
                      )}
                      {latestExam && latestExam.result === "FAIL" && weakestSubject && (
                        <li>Focus on {weakestSubject.label} with targeted drills.</li>
                      )}
                      {latestExam && latestExam.result === "PASS" && (
                        <li>Maintain momentum with a full-length mock exam.</li>
                      )}
                      {latestExam && (
                        <li>Review missed questions from the last attempt.</li>
                      )}
                    </ul>
                  </section>
                </div>
              </>
            )}
          </>
        )}

        {/* INSTRUCTOR */}
        {user.role === "instructor" && (
          <>
            {loadingInstructorProfile ? (
              <div className="dashboard-card">Loading profile...</div>
            ) : accessDecision && accessDecision !== "approved" && !editingInstructorProfile ? (
              renderAccessGate()
            ) : editingInstructorProfile ? (
              <div className="dashboard-card">
                <InstructorProfileSetup
                  onSaved={handleInstructorProfileSaved}
                  onCancel={() => setEditingInstructorProfile(false)}
                />
              </div>
            ) : (
              <>
                {!instructorProfileComplete && (
                  <div className="dashboard-card">
                    <h3>Profile incomplete</h3>
                    <p className="status-note" style={{ marginTop: 8 }}>
                      You can continue using the dashboard, but completing your profile
                      helps the admin verify your access.
                    </p>
                    <button
                      style={{ marginTop: 12 }}
                      onClick={() => setEditingInstructorProfile(true)}
                    >
                      Complete Profile
                    </button>
                  </div>
                )}
              <div className="dashboard-grid">
                <section className="dashboard-card actions-card">
                  <div className="card-header">
                    <h3>Instructor Actions</h3>
                    <button
                      type="button"
                      className="status-pill subtle"
                      style={{ border: "none", cursor: "pointer" }}
                      onClick={() => setEditingInstructorProfile(true)}
                    >
                      Edit Profile
                    </button>
                  </div>
                  <div className="profile-grid">
                  <div className="profile-item">
                    <span className="profile-label">Name</span>
                    <span className="profile-value">{instructorProfileSafe.name}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Employee ID</span>
                    <span className="profile-value">{instructorProfileSafe.employee_id}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Department</span>
                    <span className="profile-value">{instructorProfileSafe.department}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Position</span>
                    <span className="profile-value">{instructorProfileSafe.position}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Program</span>
                    <span className="profile-value">{instructorProfileSafe.program}</span>
                  </div>
                </div>
                  <div className="action-grid">
                    <button onClick={() => navigate("/questions")}>Manage Question Bank</button>
                   <button onClick={() => navigate("/instructor-performance")}>
                      View Student Performance
                   </button>

                  </div>
                </section>
                <section className="dashboard-card progress-card">
                  <div className="card-header">
                    <h3>Class Momentum</h3>
                    <span className="trend-pill positive">
                      {classTrend.length
                        ? `${classTrend[classTrend.length - 1].percentage}%`
                        : "No data"}
                    </span>
                  </div>
                  <div className="trend-graph">
                    {classTrend.length ? (
                      classTrend.map((entry, index) => (
                        <div
                          key={`${entry.date}-${index}`}
                          className="trend-column"
                        >
                          <div
                            className="trend-bar"
                            style={{
                              height: `${entry.percentage}%`,
                              ...trendStyleFor(entry.percentage),
                            }}
                            title={`${entry.percentage}%`}
                          />
                          <span className="trend-label">
                            {entry.date.toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="trend-empty">No class data yet</div>
                    )}
                  </div>
                  <div className="trend-metrics">
                    <div className="metric">
                      <span className="metric-label">Avg Score</span>
                      <span className="metric-value">
                        {classStats ? `${classStats.avg_score}%` : "-"}
                      </span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Completion</span>
                      <span className="metric-value">
                        {classStats ? `${classStats.completion_rate}%` : "-"}
                      </span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Active Students</span>
                      <span className="metric-value">
                        {classStats ? classStats.active_students : "-"}
                      </span>
                    </div>
                  </div>
                </section>
              </div>
              <div className="dashboard-grid">
                <section className="dashboard-card results-card">
                  <div className="card-header">
                    <h3>LET Enrollment by Major</h3>
                    <span className="status-note">Registered students</span>
                  </div>
                  {classStats?.let_major_counts?.length ? (
                    <div className="results-list">
                      {classStats.let_major_counts.map((entry) => (
                        <div key={entry.major} className="result-row">
                          <span className="result-label">{entry.major}</span>
                          <div className="result-bar">
                            <span
                              style={{
                                width: `${Math.min(100, entry.count * 10)}%`,
                              }}
                            />
                          </div>
                          <span className="result-score">{entry.count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="history-empty">No LET student data yet.</p>
                  )}
                </section>
                <section className="dashboard-card history-card">
                  <div className="card-header">
                    <h3>Recent Exam Attempts</h3>
                    <span className="status-note">Date & time</span>
                  </div>
                  {classStats?.recent_attempts?.length ? (
                    <div className="history-list">
                      {classStats.recent_attempts.map((attempt, index) => (
                        <div
                          key={`${attempt.email}-${attempt.created_at}-${index}`}
                          className="history-row"
                        >
                          <div>
                            <p className="history-title">
                              {attempt.email} • {attempt.exam_type}
                            </p>
                            <p className="history-subtitle">
                              {attempt.major} •{" "}
                              {attempt.created_at
                                ? new Date(attempt.created_at).toLocaleString()
                                : "Unknown time"}
                            </p>
                          </div>
                          <span className="history-score">
                            {attempt.percentage ?? "-"}% ({attempt.score ?? "-"}/
                            {attempt.total ?? "-"})
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="history-empty">No exam attempts yet.</p>
                  )}
                </section>
              </div>
              </>
            )}
          </>
        )}

        {/* ADMIN */}
        {user.role === "admin" && (
          <div className="dashboard-grid">
            <section className="dashboard-card actions-card">
              <div className="card-header">
                <h3>Admin Controls</h3>
                <span className="status-note">System overview</span>
              </div>
              <div className="action-grid">
                <button onClick={() => navigate("/admin")}>Admin Settings</button>
                <button>Certification Management</button>
                <button>System Reports</button>
              </div>
            </section>
            <section className="dashboard-card results-card">
              <div className="card-header">
                <h3>Platform Health</h3>
                <span className="trend-pill positive">Stable</span>
              </div>
              <div className="results-list">
                {subjectBreakdown.map((item) => (
                  <div key={item.label} className="result-row">
                    <span className="result-label">{item.label}</span>
                    <div className="result-bar">
                      <span style={{ width: `${item.value}%` }} />
                    </div>
                    <span className="result-score">{item.value}%</span>
                  </div>
                ))}
              </div>
              <div className="highlight-card">
                <p className="highlight-title">Update</p>
                <p className="highlight-text">
                  System uptime at 99.9% with steady exam submissions.
                </p>
              </div>
            </section>
          </div>
        )}

      </div>
    </div>
  );
}
