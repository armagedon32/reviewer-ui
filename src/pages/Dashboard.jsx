import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getUser } from "../auth";
import {
  getAccessStatusApi,
  getAppSettingsApi,
  getExamHistoryApi,
  getExamStatsApi,
  getNextRecommendationApi,
  getProfileApi,
  getReadinessApi,
  listUsersApi,
  requestAccessApi,
} from "../api";
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
  const [activeUserCounts, setActiveUserCounts] = useState(null);
  const [appSettings, setAppSettings] = useState(null);
  const [rlRecommendation, setRlRecommendation] = useState(null);
  const [readinessPrediction, setReadinessPrediction] = useState(null);
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "success",
    confirmText: "OK",
    onConfirm: null,
  });
  const canEditStudentProfile = !profile || Boolean(profile?.can_edit_profile);

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
    if (user.role === "student" && !loadingProfile && canEditStudentProfile) {
      setEditingProfile(true);
    }
    if (user.role === "instructor" && !loadingInstructorProfile) {
      setEditingInstructorProfile(true);
    }
  }, [
    isForcedProfileSetup,
    user.role,
    loadingProfile,
    canEditStudentProfile,
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
    getReadinessApi()
      .then((data) => setReadinessPrediction(data))
      .catch(() => setReadinessPrediction(null));
  }, []);

  useEffect(() => {
    getAppSettingsApi()
      .then((data) => setAppSettings(data))
      .catch(() => setAppSettings(null));
  }, []);

  useEffect(() => {
    if (user.role !== "student") return;
    getNextRecommendationApi()
      .then((data) => {
        setRlRecommendation(data);
      })
      .catch(() => {
        setRlRecommendation(null);
      });
  }, [user.role, examHistory.length]);

  useEffect(() => {
    if (user.role !== "instructor") return;
    const program = instructorProfile?.program || null;
    getExamStatsApi(program)
      .then((data) => setClassStats(data))
      .catch(() => setClassStats(null));
  }, [user.role, instructorProfile?.program]);

  useEffect(() => {
    if (user.role !== "admin") return;
    listUsersApi()
      .then((users) => {
        const counts = {
          admin: 0,
          instructor: 0,
          student: 0,
        };
        users
          .filter((entry) => entry.active)
          .forEach((entry) => {
            if (counts[entry.role] !== undefined) {
              counts[entry.role] += 1;
            }
          });
        setActiveUserCounts(counts);
      })
      .catch(() => setActiveUserCounts(null));
  }, [user.role]);

  const latestExam = examHistory[0] || null;
  const latestSubjects = latestExam?.subject_performance || {};
  const subjectBreakdown = Object.keys(latestSubjects).length
    ? Object.entries(latestSubjects).map(([label, stat]) => ({
        label,
        value: stat.total > 1 ? Math.round((stat.correct / stat.total) * 100) : 0,
      }))
    : [];

  const totalAttempts = examHistory.length;
  const passCount = examHistory.filter((entry) => entry.result === "PASS").length;
  const passRate = totalAttempts ? Math.round((passCount / totalAttempts) * 100) : 0;
  const requiredThreshold =
    typeof profile?.required_passing_threshold === "number"
      ? profile.required_passing_threshold
      : typeof appSettings?.passing_threshold_default === "number"
        ? appSettings.passing_threshold_default
        : 75;
  const masteryThreshold =
    typeof appSettings?.mastery_threshold === "number" ? appSettings.mastery_threshold : 90;
  const developingThreshold = Math.max(0, masteryThreshold - 15);
  const guidedThreshold = Math.max(0, masteryThreshold - 30);
  const exploratoryThreshold = Math.max(0, masteryThreshold - 45);
  const passStreak = examHistory.length
    ? examHistory.findIndex((entry) => entry.result !== "PASS")
    : 0;
  const passStreakCount = passStreak === -1 ? examHistory.length : passStreak;
  const streakQualified = passStreakCount >= 5;
  const latestQualified =
    latestExam && typeof latestExam.percentage === "number"
      ? latestExam.percentage >= masteryThreshold
      : false;
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
    ? latestExam.total > 1
      ? `${latestExam.percentage}% (${latestExam.score}/${latestExam.total})`
      : `${latestExam.score}/${latestExam.total}`
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
  const instructorProgram = (instructorProfileSafe.program || "").trim().toUpperCase();
  const instructorRecentAttempts = (classStats?.recent_attempts || []).filter((attempt) => {
    if (!instructorProgram || instructorProgram === "-") return true;
    return String(attempt?.exam_type || "").trim().toUpperCase() === instructorProgram;
  });
  const instructorEnrollmentRows =
    instructorProgram === "LET" ? classStats?.let_major_counts || [] : [];
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
    if (percentage >= masteryThreshold) {
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
  const performanceTrendDelta = performanceTrend.length
    ? performanceTrend[performanceTrend.length - 1].percentage - performanceTrend[0].percentage
    : 0;
  const performanceTrendDirection =
    performanceTrendDelta > 0 ? "up" : performanceTrendDelta < 0 ? "down" : "flat";
  const performanceTrendLabel =
    performanceTrendDirection === "up"
      ? "Improving"
      : performanceTrendDirection === "down"
        ? "Declining"
        : "Steady";
  const classTrend = [...instructorRecentAttempts]
    .reverse()
    .slice(-7)
    .map((attempt, index, arr) => ({
      date: attempt?.created_at
        ? new Date(attempt.created_at)
        : new Date(Date.now() - (arr.length - index - 1) * 86400000),
      percentage: Math.round(Number(attempt?.percentage || 0)),
    }));
  const classTrendDelta = classTrend.length
    ? classTrend[classTrend.length - 1].percentage - classTrend[0].percentage
    : 0;
  const classTrendDirection =
    classTrendDelta > 0 ? "up" : classTrendDelta < 0 ? "down" : "flat";
  const classTrendLabel =
    classTrendDirection === "up"
      ? "Improving"
      : classTrendDirection === "down"
        ? "Declining"
        : "Steady";
  const instructorTotalScore = instructorRecentAttempts.reduce(
    (sum, attempt) => sum + Number(attempt?.score || 0),
    0
  );
  const instructorTotalItems = instructorRecentAttempts.reduce(
    (sum, attempt) => sum + Number(attempt?.total || 0),
    0
  );
  const instructorAvgScore = instructorRecentAttempts.length
    ? Math.round(
        instructorRecentAttempts.reduce(
          (sum, attempt) => sum + Number(attempt?.percentage || 0),
          0
        ) / instructorRecentAttempts.length
      )
    : null;
  const instructorCompletion = instructorTotalItems
    ? Math.round((instructorTotalScore / instructorTotalItems) * 100)
    : null;
  const instructorActiveExaminees = new Set(
    instructorRecentAttempts.map((attempt) => String(attempt?.email || "").trim()).filter(Boolean)
  ).size;

  const averageScore = examHistory.length
    ? Math.round(
        examHistory.reduce((sum, entry) => sum + entry.percentage, 0) / examHistory.length
      )
    : 0;
  const latestScore = latestExam?.percentage ?? 0;

  const readinessLow = readinessPrediction?.readiness_low ?? 0;
  const readinessHigh = readinessPrediction?.readiness_high ?? 0;

  // AI interpretation: map latest exam percentage to a mastery band.
  const badge =
    latestExam && typeof latestExam.percentage === "number"
      ? latestExam.percentage >= masteryThreshold
        ? {
            color: "green",
            label: "Mastery",
            note: "Ready for certification / mock board pass",
          }
        : latestExam.percentage >= developingThreshold
          ? { color: "yellow", label: "Developing", note: "Needs targeted review" }
          : latestExam.percentage >= guidedThreshold
            ? { color: "orange", label: "Guided", note: "Requires structured intervention" }
            : latestExam.percentage >= exploratoryThreshold
              ? { color: "blue", label: "Exploratory", note: "Early-stage learning" }
              : { color: "red", label: "Struggling", note: "Immediate remediation" }
      : null;

  useEffect(() => {
    if (user.role !== "student" || !profile || editingProfile) return;
    const params = new URLSearchParams(location.search);
    if (params.get("edit") === "1" && canEditStudentProfile) {
      setEditingProfile(true);
      navigate("/dashboard", { replace: true });
    }
  }, [user.role, profile, editingProfile, canEditStudentProfile, location.search, navigate]);


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
              <p className="dashboard-kicker">
                {user.role === "student" ? "Student" : user.role === "instructor" ? "Instructor" : "Administrator"}
              </p>
              <div className="dashboard-heading">
                <h2 className="dashboard-title">Dashboard</h2>
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
              <div className="dashboard-card" style={{ textAlign: "center", padding: 32 }}>Loading profile...</div>
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
              <div className="dashboard-card" style={{ textAlign: "center", padding: 32 }}>
                <h3 style={{ margin: 0 }}>Profile not set</h3>
                <p className="status-note" style={{ marginTop: 8 }}>
                  Your account is approved. Please complete your profile to access exams and analytics.
                </p>
                <button style={{ marginTop: 16 }} onClick={() => setEditingProfile(true)}>
                  Complete Profile
                </button>
              </div>
            ) : (
              <>
                {!studentProfileComplete && (
                  <div className="dashboard-card" style={{ borderColor: "var(--warning)", marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 15 }}>Profile incomplete</h3>
                        <p className="status-note" style={{ margin: "4px 0 0" }}>
                          Completing your profile improves exam setup and tracking.
                        </p>
                      </div>
                      <button onClick={() => setEditingProfile(true)} disabled={!canEditStudentProfile}>
                        Complete Profile
                      </button>
                    </div>
                    {!canEditStudentProfile && (
                      <p className="status-note" style={{ marginTop: 8 }}>Profile editing is locked. Ask admin to allow profile editing.</p>
                    )}
                  </div>
                )}

                {/* Summary metrics */}
                <div className="info-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 20 }}>
                  <div className="dashboard-card" style={{ textAlign: "center", padding: "18px 12px" }}>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>Exams Taken</p>
                    <p style={{ fontSize: 30, fontWeight: 700, margin: "4px 0", color: "var(--accent)" }}>{totalAttempts || 0}</p>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>Total attempts</p>
                  </div>
                  <div className="dashboard-card" style={{ textAlign: "center", padding: "18px 12px" }}>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>Average Score</p>
                    <p style={{ fontSize: 30, fontWeight: 700, margin: "4px 0", color: "var(--accent)" }}>{examHistory.length ? `${averageScore}%` : "-"}</p>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>Across all exams</p>
                  </div>
                  <div className="dashboard-card" style={{ textAlign: "center", padding: "18px 12px" }}>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>Pass Rate</p>
                    <p style={{
                      fontSize: 30, fontWeight: 700, margin: "4px 0",
                      color: totalAttempts ? (passRate >= 75 ? "var(--success)" : "var(--danger)") : "var(--accent)",
                    }}>{totalAttempts ? `${passRate}%` : "-"}</p>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>Target: {profile?.required_passing_threshold || appSettings?.passing_threshold_default || 75}%</p>
                  </div>
                  <div className="dashboard-card" style={{ textAlign: "center", padding: "18px 12px" }}>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>Current Badge</p>
                    <p style={{ fontSize: 30, fontWeight: 700, margin: "4px 0", color: badge ? `var(--${badge.color})` : "var(--text-secondary)" }}>{badge ? badge.label : "—"}</p>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>{badge ? badge.note : "No badge yet"}</p>
                  </div>
                </div>

                {(streakQualified || latestQualified) && (
                  <div className="dashboard-card" style={{ marginBottom: 20, borderColor: "var(--success)" }}>
                    <div className="card-header">
                      <h3 style={{ color: "var(--success)" }}>Performance Milestone</h3>
                      <span className="status-pill pass">Ready</span>
                    </div>
                    <p className="status-note" style={{ marginTop: 8 }}>
                      {streakQualified
                        ? `Congratulations! You passed ${passStreakCount} consecutive ${profile?.target_licensure || "licensure"} mock exams with ≥${requiredThreshold}%.`
                        : `Congratulations! You reached the target score of ${requiredThreshold}% in your latest mock exam.`}
                    </p>
                    <p className="status-note" style={{ marginTop: 6 }}>
                      You are now marked as READY to take the {profile?.target_licensure || "licensure"} examination.
                    </p>
                  </div>
                )}

                {/* First row: Quick Actions + Results Snapshot */}
                <div className="dashboard-grid" style={{ marginBottom: 20 }}>
                  <section className="dashboard-card actions-card">
                    <div className="card-header">
                      <h3>Quick Actions</h3>
                      <span className="status-note">Keep momentum</span>
                    </div>
                    <div className="action-grid">
                      <button onClick={() => navigate("/exam-preview")}>Start Mock Board Exam</button>
                      <button onClick={() => navigate("/review-missed")}>Review Missed Questions</button>
                      <button onClick={() => navigate("/analytics")}>View Analytics</button>
                      <button onClick={() => navigate("/certification-status")}>Certification Status</button>
                    </div>
                  </section>

                  <section className="dashboard-card results-card">
                    <div className="card-header">
                      <h3>Results Snapshot</h3>
                      <span className="status-note">Subject breakdown</span>
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
                            Your {weakestSubject?.label} accuracy ({weakestSubject?.value ?? 0}%) is below the {masteryThreshold}% threshold.
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="history-empty">No results yet.</p>
                    )}
                  </section>
                </div>

                {/* Second row: Readiness Forecast + Improvement Trend */}
                <div className="dashboard-grid" style={{ marginBottom: 20 }}>
                  <section className="dashboard-card" style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <div className="card-header">
                      <h3>Readiness Forecast</h3>
                      <span className="status-pill subtle">Long-term</span>
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "8px 0" }}>
                      {readinessLow != null && readinessHigh != null ? (
                        <>
                          <div style={{ textAlign: "center", marginBottom: 12 }}>
                            <p style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "var(--accent)" }}>
                              {readinessLow}%–{readinessHigh}%
                            </p>
                            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "2px 0 0" }}>Predicted Readiness</p>
                          </div>
                          <div className="forecast-card" style={{ border: "none", padding: 0, background: "none" }}>
                            <ul className="forecast-bullets" style={{ margin: 0, padding: 0 }}>
                              <li>Trend: {readinessPrediction?.trend || "stable"}</li>
                              <li>Attempts analyzed: {readinessPrediction?.attempts || 0}</li>
                              {readinessPrediction?.weak_subjects?.length ? (
                                <li style={{ wordBreak: "break-word" }}>Weak subjects: {readinessPrediction.weak_subjects.join(", ")}</li>
                              ) : null}
                            </ul>
                          </div>
                        </>
                      ) : (
                        <p className="history-empty" style={{ margin: 0 }}>Insufficient data</p>
                      )}
                    </div>
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
                        <div className={`trend-sparkline ${performanceTrendDirection}`}>
                          <svg viewBox="0 0 220 90" role="img" aria-label="Performance trend" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="studentTrendLine" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#0ea5e9" /><stop offset="100%" stopColor="#22c55e" />
                              </linearGradient>
                              <linearGradient id="studentTrendFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgba(14,165,233,0.35)" /><stop offset="100%" stopColor="rgba(34,197,94,0.05)" />
                              </linearGradient>
                            </defs>
                            <path className="trend-area" d={`M 0 85 ${performanceTrend.map((e, i) => { const x = (i / (performanceTrend.length - 1 || 1)) * 220; const y = 85 - (e.percentage / 100) * 70; return `L ${x} ${y}`; }).join(" ")} L 220 85 Z`} fill="url(#studentTrendFill)" />
                            <polyline className="trend-line" fill="none" stroke="url(#studentTrendLine)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={performanceTrend.map((e, i) => { const x = (i / (performanceTrend.length - 1 || 1)) * 220; const y = 85 - (e.percentage / 100) * 70; return `${x},${y}`; }).join(" ")} />
                            {performanceTrend.map((e, i) => { const x = (i / (performanceTrend.length - 1 || 1)) * 220; const y = 85 - (e.percentage / 100) * 70; return <circle key={`${e.date}-${i}`} cx={x} cy={y} r="3.5" className="trend-dot" />; })}
                          </svg>
                          <div className="trend-footer">
                            <span className="trend-label">{new Date(performanceTrend[0].date).toLocaleDateString()}</span>
                            <span className="trend-note">{performanceTrendLabel}<strong>{performanceTrendDelta > 0 ? "+" : ""}{performanceTrendDelta}%</strong></span>
                            <span className="trend-label">{new Date(performanceTrend[performanceTrend.length - 1].date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ) : (<div className="trend-empty">No exam data yet</div>)}
                    </div>
                    <div className="trend-metrics">
                      <div className="metric">
                        <span className="metric-label">Latest Exam</span>
                        <span className="metric-value">{latestExam ? `${latestExam.percentage}%` : "-"}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Average</span>
                        <span className="metric-value">{examHistory.length ? `${averageScore}%` : "-"}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Target</span>
                        <span className="metric-value">
                          {profile?.required_passing_threshold || (typeof appSettings?.passing_threshold_default === "number" ? `${appSettings.passing_threshold_default}%` : "75%")}
                        </span>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Third row: Exam History + combined section */}
                <div className="dashboard-grid" style={{ marginBottom: 20 }}>
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
                                {entry.result} • {entry.total > 1 ? `${entry.percentage}%` : `${entry.score}/${entry.total}`}
                              </p>
                              <p className="history-subtitle">{new Date(entry.date).toLocaleString()}</p>
                            </div>
                            <span className="history-score">{entry.score}/{entry.total}</span>
                          </div>
                        ))}
                      </div>
                    ) : (<p className="history-empty">No exam history yet.</p>)}
                  </section>

                  <section className="dashboard-card" style={{ display: "flex", flexDirection: "column" }}>
                    <div className="card-header">
                      <h3>Recommendations</h3>
                      <span className="status-note">AI-powered insights</span>
                    </div>
                    <ul className="recommendation-list" style={{ flex: 1 }}>
                      {rlRecommendation && (
                        <li><strong>{rlRecommendation.action_label}:</strong> {rlRecommendation.reason}{!!rlRecommendation.focus_subjects?.length && <> Focus: {rlRecommendation.focus_subjects.join(", ")}.</>}</li>
                      )}
                      {!latestExam && <li>Take your first mock exam to unlock analytics.</li>}
                      {latestExam && latestExam.result === "FAIL" && weakestSubject && <li>Focus on {weakestSubject.label} with targeted drills.</li>}
                      {latestExam && latestExam.result === "PASS" && <li>Maintain momentum with a full-length mock exam.</li>}
                      {latestExam && <li>Review missed questions from the last attempt.</li>}
                    </ul>
                    {examHistory.length ? (
                      <div className="analytics-split" style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: "auto" }}>
                        <div>
                          <p className="analytics-label">Best Subject</p>
                          <p className="analytics-value">{bestSubject ? `${bestSubject.label} · ${bestSubject.value}%` : "-"}</p>
                        </div>
                        <div>
                          <p className="analytics-label">Focus Subject</p>
                          <p className="analytics-value">{weakestSubject ? `${weakestSubject.label} · ${weakestSubject.value}%` : "-"}</p>
                        </div>
                      </div>
                    ) : null}
                  </section>
                </div>

                {/* Profile + Badge row (collapsible) */}
                <details className="dashboard-card" style={{ padding: 0, cursor: "pointer" }}>
                  <summary style={{ padding: "14px 16px", fontWeight: 600, fontSize: 15, userSelect: "none" }}>
                    Student Profile & Badge
                  </summary>
                  <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)" }}>
                    <div className="profile-grid" style={{ paddingTop: 16 }}>
                      <div className="profile-item">
                        <span className="profile-label">Student ID</span>
                        <span className="profile-value">{profile.student_id_number}</span>
                      </div>
                      <div className="profile-item">
                        <span className="profile-label">Full Name</span>
                        <span className="profile-value">{[profile.first_name, profile.middle_name, profile.last_name].filter(Boolean).join(" ")}</span>
                      </div>
                      <div className="profile-item">
                        <span className="profile-label">Email</span>
                        <span className="profile-value">{profile.email_address}</span>
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
                        <span className="profile-value">{profile.assigned_review_subjects?.join(", ")}</span>
                      </div>
                      <div className="profile-item">
                        <span className="profile-label">Passing Threshold</span>
                        <span className="profile-value">{profile.required_passing_threshold}%</span>
                      </div>
                    </div>
                    <div className="badge-card" style={{ marginTop: 16 }}>
                      <svg className={`badge-icon ${badge ? badge.color : "muted"}`} viewBox="0 0 32 32" aria-hidden="true">
                        <circle cx="16" cy="12" r="8" /><path d="M9 20l-1 9 8-5 8 5-1-9" />
                      </svg>
                      <div>
                        <p className="badge-title">{badge ? `${badge.label} Badge` : "Badge Pending"}</p>
                        <p className="badge-note">{badge ? badge.note : "Complete your first exam to earn a badge."}</p>
                        <p className="badge-explain">AI interprets your latest score into a mastery band to guide your next study steps.</p>
                      </div>
                    </div>
                    <button style={{ marginTop: 12 }} onClick={() => setEditingProfile(true)} disabled={!canEditStudentProfile}>
                      Edit Profile
                    </button>
                    {!canEditStudentProfile && (<p className="status-note" style={{ marginTop: 8 }}>Profile editing is locked. Ask admin to allow profile editing.</p>)}
                  </div>
                </details>
              </>
            )}
          </>
        )}

        {/* INSTRUCTOR */}
        {user.role === "instructor" && (
          <>
            {loadingInstructorProfile ? (
              <div className="dashboard-card" style={{ textAlign: "center", padding: 32 }}>Loading profile...</div>
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
                  <div className="dashboard-card" style={{ borderColor: "var(--warning)", marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 15 }}>Profile incomplete</h3>
                        <p className="status-note" style={{ margin: "4px 0 0" }}>
                          Completing your profile helps the admin verify your access.
                        </p>
                      </div>
                      <button onClick={() => setEditingInstructorProfile(true)}>
                        Complete Profile
                      </button>
                    </div>
                  </div>
                )}

                {/* Summary metrics */}
                <div className="info-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 20 }}>
                  <div className="dashboard-card" style={{ textAlign: "center", padding: "18px 12px" }}>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>Active Examinees</p>
                    <p style={{ fontSize: 30, fontWeight: 700, margin: "4px 0", color: "var(--accent)" }}>{instructorActiveExaminees}</p>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>Unique students</p>
                  </div>
                  <div className="dashboard-card" style={{ textAlign: "center", padding: "18px 12px" }}>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>Average Score</p>
                    <p style={{ fontSize: 30, fontWeight: 700, margin: "4px 0", color: "var(--accent)" }}>{instructorAvgScore != null ? `${instructorAvgScore}%` : "-"}</p>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>Across all attempts</p>
                  </div>
                  <div className="dashboard-card" style={{ textAlign: "center", padding: "18px 12px" }}>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>Completion Rate</p>
                    <p style={{ fontSize: 30, fontWeight: 700, margin: "4px 0", color: instructorCompletion != null ? "var(--success)" : "var(--accent)" }}>{instructorCompletion != null ? `${instructorCompletion}%` : "-"}</p>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>Score / Total items</p>
                  </div>
                  <div className="dashboard-card" style={{ textAlign: "center", padding: "18px 12px" }}>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>Program</p>
                    <p style={{ fontSize: 30, fontWeight: 700, margin: "4px 0", color: "var(--accent)" }}>{instructorProgram || "—"}</p>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>Assigned track</p>
                  </div>
                </div>

                {/* First row: Actions + Class Momentum */}
                <div className="dashboard-grid" style={{ marginBottom: 20 }}>
                  <section className="dashboard-card actions-card">
                    <div className="card-header">
                      <h3>Instructor Actions</h3>
                      <span className="status-pill subtle" style={{ cursor: "pointer" }} onClick={() => setEditingInstructorProfile(true)}>Edit Profile</span>
                    </div>
                    <div className="action-grid">
                      <button onClick={() => navigate("/instructor/exam-settings")}>
                        {instructorProgram} Exam Setup
                      </button>
                      <button onClick={() => navigate(`/questions?track=${instructorProgram}`)}>
                        {instructorProgram} Question Bank
                      </button>
                      <button onClick={() => navigate("/instructor-performance")}>
                        View Student Performance
                      </button>
                    </div>
                  </section>

                  <section className="dashboard-card progress-card">
                    <div className="card-header">
                      <h3>Class Momentum</h3>
                      <span className="trend-pill positive">
                        {classTrend.length ? `${classTrend[classTrend.length - 1].percentage}%` : "No data"}
                      </span>
                    </div>
                    <div className="trend-graph">
                      {classTrend.length ? (
                        <div className={`trend-sparkline ${classTrendDirection}`}>
                          <svg viewBox="0 0 220 90" role="img" aria-label="Class performance trend" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="trendLine" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#0ea5e9" /><stop offset="100%" stopColor="#22c55e" />
                              </linearGradient>
                              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgba(14,165,233,0.35)" /><stop offset="100%" stopColor="rgba(34,197,94,0.05)" />
                              </linearGradient>
                            </defs>
                            <path className="trend-area" d={`M 0 85 ${classTrend.map((e, i) => { const x = (i / (classTrend.length - 1 || 1)) * 220; const y = 85 - (e.percentage / 100) * 70; return `L ${x} ${y}`; }).join(" ")} L 220 85 Z`} fill="url(#trendFill)" />
                            <polyline className="trend-line" fill="none" stroke="url(#trendLine)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={classTrend.map((e, i) => { const x = (i / (classTrend.length - 1 || 1)) * 220; const y = 85 - (e.percentage / 100) * 70; return `${x},${y}`; }).join(" ")} />
                            {classTrend.map((e, i) => { const x = (i / (classTrend.length - 1 || 1)) * 220; const y = 85 - (e.percentage / 100) * 70; return <circle key={`${e.date}-${i}`} cx={x} cy={y} r="3.5" className="trend-dot" />; })}
                          </svg>
                          <div className="trend-footer">
                            <span className="trend-label">{classTrend[0].date.toLocaleDateString()}</span>
                            <span className="trend-note">{classTrendLabel}<strong>{classTrendDelta > 0 ? "+" : ""}{classTrendDelta}%</strong></span>
                            <span className="trend-label">{classTrend[classTrend.length - 1].date.toLocaleDateString()}</span>
                          </div>
                        </div>
                      ) : (<div className="trend-empty">No class data yet</div>)}
                    </div>
                    <div className="trend-metrics">
                      <div className="metric">
                        <span className="metric-label">Avg Score</span>
                        <span className="metric-value">{instructorAvgScore != null ? `${instructorAvgScore}%` : "-"}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Completion</span>
                        <span className="metric-value">{instructorCompletion != null ? `${instructorCompletion}%` : "-"}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Active Examinees</span>
                        <span className="metric-value">{instructorActiveExaminees}</span>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Second row: Enrollment + Recent Attempts */}
                <div className="dashboard-grid" style={{ marginBottom: 20 }}>
                  <section className="dashboard-card results-card">
                    <div className="card-header">
                      <h3>{instructorProgram === "LET" ? "LET Enrollment by Major" : `${instructorProgram || "Program"} Enrollment`}</h3>
                      <span className="status-note">Registered students</span>
                    </div>
                    {instructorEnrollmentRows.length ? (
                      <div className="results-list">
                        {instructorEnrollmentRows.map((entry) => (
                          <div key={entry.major} className="result-row">
                            <span className="result-label">{entry.major}</span>
                            <div className="result-bar">
                              <span style={{ width: `${Math.min(100, entry.count * 10)}%` }} />
                            </div>
                            <span className="result-score">{entry.count}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="history-empty">
                        {instructorProgram === "LET" ? "No LET student data yet." : `No ${instructorProgram || "program"} enrollment breakdown available.`}
                      </p>
                    )}
                  </section>
                  <section className="dashboard-card history-card">
                    <div className="card-header">
                      <h3>Recent Exam Attempts</h3>
                      <span className="status-note">Date & time</span>
                    </div>
                    {instructorRecentAttempts.length ? (
                      <div className="history-list">
                        {instructorRecentAttempts.map((attempt, index) => (
                          <div key={`${attempt.email}-${attempt.created_at}-${index}`} className="history-row">
                            <div>
                              <p className="history-title">{attempt.email} • {attempt.exam_type}</p>
                              <p className="history-subtitle">
                                {attempt.major} • {attempt.created_at ? new Date(attempt.created_at).toLocaleString() : "Unknown time"}
                              </p>
                            </div>
                            <span className="history-score">
                              {attempt.total > 1 ? `${attempt.percentage ?? "-"}% (${attempt.score ?? "-"}/${attempt.total ?? "-"})` : `${attempt.score ?? "-"}/${attempt.total ?? "-"}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (<p className="history-empty">No exam attempts yet.</p>)}
                  </section>
                </div>

                {/* Profile (collapsible) */}
                <details className="dashboard-card" style={{ padding: 0, cursor: "pointer" }}>
                  <summary style={{ padding: "14px 16px", fontWeight: 600, fontSize: 15, userSelect: "none" }}>
                    Instructor Profile
                  </summary>
                  <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)" }}>
                    <div className="profile-grid" style={{ paddingTop: 16 }}>
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
                  </div>
                </details>
              </>
            )}
          </>
        )}

        {/* ADMIN */}
        {user.role === "admin" && (
          <div className="dashboard-grid" style={{ maxWidth: 480 }}>
            <section className="dashboard-card actions-card">
              <div className="card-header">
                <h3>Admin Panel</h3>
                <span className="status-pill subtle" onClick={() => navigate("/admin")} style={{ cursor: "pointer" }}>Open</span>
              </div>
              <p className="status-note" style={{ margin: "8px 0 16px" }}>
                Manage system settings, users, question bank, audit logs, and certification configuration.
              </p>
              <div className="action-grid">
                <button onClick={() => navigate("/admin")}>Go to Admin Panel</button>
                <button onClick={() => navigate("/admin/certification-management")}>
                  Certification Management
                </button>
              </div>
            </section>
          </div>
        )}

      </div>
    </div>
  );
}
