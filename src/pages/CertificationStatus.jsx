import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAppSettingsApi, getExamHistoryApi, getProfileApi } from "../api";
import { getSystemLogo, getSystemSchoolName } from "../systemLogo";

function normalizeExamType(value) {
  return String(value || "").trim().toUpperCase();
}

function asNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function simpleHash(input) {
  let hash = 0;
  const text = String(input || "");
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16).toUpperCase().padStart(8, "0");
}

function formatDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const REQUIRED_CONSECUTIVE_PASSES = 3;

function statusFromMetrics(averageScore, threshold, attempts, consecutivePasses) {
  if (attempts === 0) {
    return { label: "In Progress", tone: "warning" };
  }
  if (
    averageScore >= threshold &&
    consecutivePasses >= REQUIRED_CONSECUTIVE_PASSES
  ) {
    return { label: "Eligible for Certification", tone: "success" };
  }
  if (averageScore < Math.max(40, threshold - 25)) {
    return { label: "Not Eligible", tone: "danger" };
  }
  return { label: "In Progress", tone: "warning" };
}

export default function CertificationStatus() {
  const navigate = useNavigate();
  const logoSrc = getSystemLogo();
  const schoolName = getSystemSchoolName();
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [appSettings, setAppSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProfileApi(), getExamHistoryApi(), getAppSettingsApi()])
      .then(([profileData, historyData, appSettings]) => {
        setAppSettings(appSettings || null);
        const safeProfile = profileData || null;
        if (
          safeProfile &&
          (safeProfile.required_passing_threshold == null ||
            Number.isNaN(Number(safeProfile.required_passing_threshold)))
        ) {
          safeProfile.required_passing_threshold =
            typeof appSettings?.passing_threshold_default === "number"
              ? appSettings.passing_threshold_default
              : 75;
        }
        setProfile(safeProfile);
        setHistory(Array.isArray(historyData) ? historyData : []);
      })
      .catch(() => {
        setProfile(null);
        setHistory([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const trackAttempts = useMemo(() => {
    if (!profile) return [];
    const target = normalizeExamType(profile.target_licensure);
    const matched = history.filter(
      (entry) => normalizeExamType(entry.exam_type) === target
    );
    const selected = matched.length ? matched : history;
    return [...selected].sort(
      (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)
    );
  }, [profile, history]);

  const metrics = useMemo(() => {
    if (!profile) {
      return {
        certificationName: "-",
        subjects: [],
        threshold: 75,
        averageScore: 0,
        completion: 0,
        attempts: 0,
      };
    }

    const attempts = trackAttempts.length;
    const averageScore = attempts
      ? Math.round(
          trackAttempts.reduce((sum, entry) => sum + asNumber(entry.percentage), 0) / attempts
        )
      : 0;
    const threshold =
      typeof profile.required_passing_threshold === "number"
        ? profile.required_passing_threshold
        : 75;
    const completion = Math.min(100, Math.round((averageScore / Math.max(1, threshold)) * 100));

    return {
      certificationName: `${profile.target_licensure} Reviewer Certificate`,
      subjects: Array.isArray(profile.assigned_review_subjects)
        ? profile.assigned_review_subjects
        : [],
      threshold,
      averageScore,
      completion,
      attempts,
    };
  }, [profile, trackAttempts]);

  const analytics = useMemo(() => {
    if (!profile) {
      return {
        predictedReadiness: 0,
        trendLabel: "Stable",
        recommendedFocusAreas: [],
        masteryPerSubject: [],
      };
    }

    const attempts = trackAttempts;

    const latest = attempts.length ? attempts[attempts.length - 1] : null;
    const prev = attempts.length > 1 ? attempts[attempts.length - 2] : latest;
    const latestScore = asNumber(latest?.percentage);
    const prevScore = asNumber(prev?.percentage || latestScore);
    const delta = latestScore - prevScore;
    const predictedReadiness = Math.max(
      0,
      Math.min(100, Math.round(latestScore + delta * 0.7))
    );

    let trendLabel = "Stable";
    if (delta > 2) trendLabel = "Improving";
    if (delta < -2) trendLabel = "Declining";

    const subjectTotals = {};
    attempts.forEach((attempt) => {
      const perf = attempt?.subject_performance || {};
      Object.entries(perf).forEach(([subject, stat]) => {
        if (!subjectTotals[subject]) {
          subjectTotals[subject] = { correct: 0, total: 0 };
        }
        subjectTotals[subject].correct += asNumber(stat?.correct);
        subjectTotals[subject].total += asNumber(stat?.total);
      });
    });

    const masteryPerSubject = Object.entries(subjectTotals)
      .map(([subject, stat]) => ({
        subject,
        percent: stat.total ? Math.round((stat.correct / stat.total) * 100) : 0,
      }))
      .sort((a, b) => b.percent - a.percent);

    const recommendedFocusAreas = [...masteryPerSubject]
      .sort((a, b) => a.percent - b.percent)
      .slice(0, 3)
      .map((item) => item.subject);

    return {
      predictedReadiness,
      trendLabel,
      recommendedFocusAreas,
      masteryPerSubject,
    };
  }, [profile, trackAttempts]);

  const consecutivePasses = useMemo(() => {
    if (!trackAttempts.length) return 0;
    let streak = 0;
    for (let i = trackAttempts.length - 1; i >= 0; i -= 1) {
      const score = asNumber(trackAttempts[i]?.percentage);
      if (score >= metrics.threshold) {
        streak += 1;
      } else {
        break;
      }
    }
    return streak;
  }, [trackAttempts, metrics.threshold]);

  const attemptSummary = useMemo(() => {
    const attempts = trackAttempts.length;
    const latestScore = attempts ? asNumber(trackAttempts[attempts - 1]?.percentage) : 0;
    const highestScore = attempts
      ? Math.max(...trackAttempts.map((item) => asNumber(item?.percentage)))
      : 0;
    const averageScore = attempts
      ? Math.round(
          trackAttempts.reduce((sum, item) => sum + asNumber(item?.percentage), 0) / attempts
        )
      : 0;
    const masteryThreshold =
      typeof appSettings?.mastery_threshold === "number"
        ? appSettings.mastery_threshold
        : 90;
    const progressionStatus =
      latestScore >= masteryThreshold
        ? "Mastery Level"
        : latestScore >= metrics.threshold
          ? "Passing Level"
          : latestScore >= Math.max(40, metrics.threshold - 25)
            ? "Developing Level"
            : "Foundation Level";
    const retakeEligible = attempts === 0 || latestScore < metrics.threshold;

    return {
      attempts,
      latestScore,
      highestScore,
      averageScore,
      progressionStatus,
      retakeEligible,
      consecutivePasses,
    };
  }, [trackAttempts, metrics.threshold, appSettings, consecutivePasses]);

  const status = statusFromMetrics(
    metrics.averageScore,
    metrics.threshold,
    metrics.attempts,
    consecutivePasses
  );
  const isEligible = status.label === "Eligible for Certification";

  const certificateInfo = useMemo(() => {
    if (!profile || !isEligible) return null;
    const latestAttempt = trackAttempts.length ? trackAttempts[trackAttempts.length - 1] : null;
    const issueDateRaw = latestAttempt?.created_at || new Date().toISOString();
    const fullName = [
      profile.first_name,
      profile.middle_name,
      profile.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    const certSeed = [
      profile.student_id_number,
      profile.username,
      profile.target_licensure,
      issueDateRaw,
      metrics.averageScore,
    ].join("|");
    const certificateId = `RUI-${simpleHash(certSeed).slice(0, 10)}`;
    const verificationCode = `VRF-${simpleHash(`${certSeed}|VERIFY`).slice(0, 12)}`;
    return {
      studentDisplayName: fullName || "Full Name Required",
      certificateName: `${profile.target_licensure} Reviewer Certificate`,
      certificateId,
      verificationCode,
      issueDateRaw,
      issueDate: formatDate(issueDateRaw),
    };
  }, [profile, isEligible, trackAttempts, metrics.averageScore]);

  const handleDownloadCertificate = () => {
    if (!certificateInfo) return;
    const logoForCertificate = getSystemLogo();
    const schoolNameForCertificate = getSystemSchoolName();
    const certHtml = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${certificateInfo.certificateName}</title>
        <style>
          body { margin: 0; background: #f5f7fb; font-family: Georgia, "Times New Roman", serif; color: #0f172a; }
          .sheet {
            width: 1120px; margin: 24px auto; background: #fff;
            border: 12px solid #1d4ed8; border-radius: 16px; padding: 38px 48px;
            box-shadow: 0 18px 38px rgba(15, 23, 42, 0.18);
          }
          .head { display:flex; align-items:center; justify-content:space-between; gap:16px; }
          .logo-wrap { display:flex; align-items:center; gap:14px; }
          .logo-wrap img { width: 72px; height: 72px; object-fit: contain; border-radius: 50%; border: 2px solid #cbd5e1; }
          .org { font-size: 13px; letter-spacing: 1px; text-transform: uppercase; color: #334155; font-family: Arial, sans-serif; }
          .title { margin: 18px 0 6px; font-size: 56px; font-weight: 700; color: #0b1f5e; text-align: center; }
          .subtitle { text-align:center; font-size: 22px; color:#1e293b; margin: 8px 0 24px; }
          .name { text-align:center; font-size: 42px; font-weight:700; color:#0f172a; border-bottom: 2px solid #1e3a8a; width: 78%; margin: 0 auto; padding-bottom: 8px; }
          .awarded { text-align:center; margin: 20px 0 4px; font-size: 18px; color:#334155; font-family: Arial, sans-serif; }
          .program { text-align:center; font-size: 30px; color:#1e3a8a; font-weight:700; margin: 10px 0 28px; }
          .meta {
            display:grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 10px;
            font-family: Arial, sans-serif;
          }
          .meta-box { border:1px solid #dbe3f1; border-radius:10px; padding:12px; background:#f8fbff; }
          .meta-k { font-size: 11px; color:#475569; text-transform: uppercase; letter-spacing: .8px; }
          .meta-v { font-size: 16px; font-weight: 700; color:#0f172a; margin-top: 6px; word-break: break-word; }
          .foot { margin-top: 28px; display:flex; justify-content:space-between; align-items:flex-end; gap:14px; }
          .sig { width: 280px; border-top: 1px solid #334155; text-align:center; padding-top: 8px; font-family: Arial, sans-serif; color:#334155; }
          .note { font-family: Arial, sans-serif; font-size: 12px; color:#475569; max-width: 560px; }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="head">
            <div class="logo-wrap">
              <img src="${logoForCertificate}" alt="logo" />
              <div class="org">${schoolNameForCertificate}</div>
            </div>
            <div class="org">Official Digital Certificate</div>
          </div>
          <div class="title">Certificate</div>
          <div class="subtitle">This certifies that</div>
          <div class="name">${certificateInfo.studentDisplayName}</div>
          <div class="awarded">has successfully met the certification eligibility requirements for</div>
          <div class="program">${certificateInfo.certificateName}</div>
          <div class="meta">
            <div class="meta-box"><div class="meta-k">Certificate ID</div><div class="meta-v">${certificateInfo.certificateId}</div></div>
            <div class="meta-box"><div class="meta-k">Issue Date</div><div class="meta-v">${certificateInfo.issueDate}</div></div>
            <div class="meta-box"><div class="meta-k">Verification Code</div><div class="meta-v">${certificateInfo.verificationCode}</div></div>
          </div>
          <div class="foot">
            <div class="note">Verification: keep this certificate ID and verification code for validation and tracking.</div>
            <div class="sig">Certification Administrator</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const popup = window.open("", "_blank", "width=1280,height=900");
    if (!popup) return;
    popup.document.open();
    popup.document.write(certHtml);
    popup.document.close();
    popup.focus();
    setTimeout(() => {
      popup.print();
    }, 350);
  };

  const statusStyles = {
    success: { dot: "#22c55e", text: "#166534", bg: "#dcfce7" },
    warning: { dot: "#eab308", text: "#854d0e", bg: "#fef9c3" },
    danger: { dot: "#ef4444", text: "#991b1b", bg: "#fee2e2" },
  };
  const tone = statusStyles[status.tone] || statusStyles.warning;

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <div className="review-header">
          <div className="review-brand">
            <img src={logoSrc} alt="System logo" className="review-logo" />
            <div className="admin-title-block">
              <p className="dashboard-kicker">Student</p>
              <h2 className="dashboard-title">Certification Status</h2>
              <p className="dashboard-email">Track your certification readiness.</p>
            </div>
          </div>
          <button className="review-back" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>

        <section className="dashboard-card">
          {loading ? (
            <p className="history-empty">Loading certification status...</p>
          ) : !profile ? (
            <p className="history-empty">
              Profile not found. Complete your profile setup first.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              <h3 style={{ margin: 0 }}>Certification Progress Overview</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "220px 1fr",
                  gap: "10px 14px",
                  alignItems: "center",
                }}
              >
                <strong>Certification Name</strong>
                <span>{metrics.certificationName}</span>

                <strong>Required Subjects</strong>
                <span>{metrics.subjects.length ? metrics.subjects.join(", ") : "-"}</span>

                <strong>Passing Threshold</strong>
                <span>{metrics.threshold}%</span>

                <strong>Current Average Score</strong>
                <span>{metrics.averageScore}%</span>

                <strong>Completion Percentage</strong>
                <span>{metrics.completion}%</span>

                <strong>Status</strong>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "fit-content",
                    padding: "4px 10px",
                    borderRadius: "999px",
                    background: tone.bg,
                    color: tone.text,
                    fontWeight: 700,
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: tone.dot,
                      display: "inline-block",
                    }}
                  />
                  {status.label}
                </span>

                <strong>Consecutive Passes</strong>
                <span>
                  {consecutivePasses} / {REQUIRED_CONSECUTIVE_PASSES}
                </span>
              </div>
            </div>
          )}
        </section>
        <section className="dashboard-card" style={{ marginTop: "18px" }}>
          <div style={{ display: "grid", gap: "14px" }}>
            <h3 style={{ margin: 0 }}>Readiness Analytics (AI-Based)</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "220px 1fr",
                gap: "10px 14px",
                alignItems: "center",
              }}
            >
              <strong>Predicted Readiness Score</strong>
              <span>{analytics.predictedReadiness}%</span>

              <strong>Performance Trend</strong>
              <span>{analytics.trendLabel}</span>

              <strong>Recommended Focus Areas</strong>
              <span>
                {analytics.recommendedFocusAreas.length
                  ? analytics.recommendedFocusAreas.join(", ")
                  : "-"}
              </span>

              <strong>Mastery per Subject</strong>
              <span>
                {analytics.masteryPerSubject.length
                  ? analytics.masteryPerSubject
                      .map((item) => `${item.subject} ${item.percent}%`)
                      .join(", ")
                  : "-"}
              </span>
            </div>
          </div>
        </section>
        <section className="dashboard-card" style={{ marginTop: "18px" }}>
          <div style={{ display: "grid", gap: "14px" }}>
            <h3 style={{ margin: 0 }}>Mock Board Attempt Summary</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "220px 1fr",
                gap: "10px 14px",
                alignItems: "center",
              }}
            >
              <strong>Number of Attempts</strong>
              <span>{attemptSummary.attempts}</span>

              <strong>Highest Score</strong>
              <span>{attemptSummary.highestScore}%</span>

              <strong>Latest Score</strong>
              <span>{attemptSummary.latestScore}%</span>

              <strong>Average Score</strong>
              <span>{attemptSummary.averageScore}%</span>

              <strong>Level Progression Status</strong>
              <span>{attemptSummary.progressionStatus}</span>

              <strong>Retake Eligibility</strong>
              <span>
                {attemptSummary.retakeEligible
                  ? "Eligible for Retake"
                  : "Not Eligible (already passing)"}
              </span>

              <strong>Certification Rule</strong>
              <span>
                Requires {REQUIRED_CONSECUTIVE_PASSES} consecutive passes and average score of{" "}
                {metrics.threshold}%+
              </span>
            </div>
          </div>
        </section>
        {isEligible && certificateInfo && (
          <section className="dashboard-card" style={{ marginTop: "18px" }}>
            <div style={{ display: "grid", gap: "14px" }}>
              <h3 style={{ margin: 0 }}>Digital Certificate</h3>
              <div
                style={{
                  border: "2px solid #dbe6ff",
                  borderRadius: "14px",
                  padding: "18px",
                  background:
                    "linear-gradient(135deg, rgba(239,246,255,0.95) 0%, rgba(255,255,255,1) 45%, rgba(239,246,255,0.95) 100%)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img
                      src={logoSrc}
                      alt="System logo"
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "999px",
                        objectFit: "cover",
                        border: "2px solid #c7d2fe",
                      }}
                    />
                    <div>
                      <div style={{ fontSize: "12px", color: "#475569", textTransform: "uppercase" }}>
                        ${schoolName}
                      </div>
                      <div style={{ fontSize: "26px", fontWeight: 800, color: "#1e3a8a" }}>
                        {certificateInfo.certificateName}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="review-back"
                    onClick={handleDownloadCertificate}
                    style={{ alignSelf: "start" }}
                  >
                    Download PDF
                  </button>
                </div>

                <div style={{ marginTop: "14px", fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
                  {certificateInfo.studentDisplayName}
                </div>

                <div
                  style={{
                    marginTop: "14px",
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(180px, 1fr))",
                    gap: "10px",
                  }}
                >
                  <div style={{ border: "1px solid #dbe3f1", borderRadius: "10px", padding: "10px" }}>
                    <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>
                      Certificate ID
                    </div>
                    <div style={{ fontWeight: 700 }}>{certificateInfo.certificateId}</div>
                  </div>
                  <div style={{ border: "1px solid #dbe3f1", borderRadius: "10px", padding: "10px" }}>
                    <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>
                      Issue Date
                    </div>
                    <div style={{ fontWeight: 700 }}>{certificateInfo.issueDate}</div>
                  </div>
                  <div style={{ border: "1px solid #dbe3f1", borderRadius: "10px", padding: "10px" }}>
                    <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>
                      Verification Code
                    </div>
                    <div style={{ fontWeight: 700 }}>{certificateInfo.verificationCode}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
