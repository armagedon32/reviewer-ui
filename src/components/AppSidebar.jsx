import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { getUser, logout } from "../auth";
import { getSystemLogo, getSystemSchoolName } from "../systemLogo";

const LINK_GROUPS = {
  student: [
    {
      label: "Main",
      links: [
        { to: "/dashboard", label: "Dashboard", icon: "▦", end: true },
        { to: "/exam-preview", label: "Start Mock Exam", icon: "✎" },
        { to: "/review-missed", label: "Review Missed", icon: "↺" },
      ],
    },
    {
      label: "Progress",
      links: [
        { to: "/analytics", label: "Analytics", icon: "◔" },
        { to: "/certification-status", label: "Certification Status", icon: "✓" },
      ],
    },
  ],
  instructor: [
    {
      label: "Main",
      links: [
        { to: "/dashboard", label: "Dashboard", icon: "▦", end: true },
        { to: "/instructor/exam-settings", label: "Exam Setup", icon: "✎" },
        { to: "/question-bank", label: "Question Bank", icon: "☰" },
      ],
    },
    {
      label: "Monitoring",
      links: [
        { to: "/instructor-performance", label: "Student Performance", icon: "◔" },
        { to: "/instructor/class-analytics", label: "Class Analytics", icon: "▤" },
        { to: "/instructor/recommendation-engine", label: "Recommendation Engine (RL)", icon: "🧠" },
      ],
    },
  ],
  admin: [
    {
      label: "Main",
      links: [
        { to: "/dashboard", label: "Dashboard", icon: "▦", end: true },
        { to: "/admin", label: "Admin Panel", icon: "⚙", end: true },
      ],
    },
    {
      label: "Administration",
      links: [
        { to: "/admin/system-settings", label: "System Settings", icon: "◧" },
        { to: "/admin/exam-settings", label: "Exam Settings", icon: "✎" },
        { to: "/admin/users", label: "User Management", icon: "☰" },
        { to: "/admin/audit-logs", label: "Audit Logs", icon: "≡" },
      ],
    },
    {
      label: "Content",
      links: [
        { to: "/question-bank", label: "Question Bank", icon: "◫" },
        { to: "/admin/recommendation-engine", label: "Recommendation Engine (RL)", icon: "🧠" },
        { to: "/admin/certification-management", label: "Certification", icon: "✓" },
      ],
    },
  ],
};

export default function AppSidebar() {
  const user = getUser();
  const navigate = useNavigate();
  const location = useLocation();
  const logo = getSystemLogo();
  const schoolName = getSystemSchoolName();
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef(null);

  const groups = user ? LINK_GROUPS[user.role] || LINK_GROUPS.student : [];

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const roleLabel =
    user.role === "admin" ? "Administrator" : user.role === "instructor" ? "Instructor" : "Student";

  return (
    <>
      <button
        type="button"
        className={`sidebar-toggle ${open ? "open" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle navigation"
      >
        <span />
        <span />
        <span />
      </button>
      <div className={`sidebar-backdrop ${open ? "visible" : ""}`} onClick={() => setOpen(false)} />

      <aside className={`app-sidebar ${open ? "open" : ""}`} ref={sidebarRef}>
        <div className="sidebar-brand" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
          <img src={logo} alt="System logo" className="sidebar-logo" />
          <div>
            <p className="sidebar-school">{schoolName}</p>
            <p className="sidebar-tagline">Certification & Mock Board Reviewer</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {groups.map((group) => (
            <div key={group.label} className="sidebar-group">
              <p className="sidebar-group-label">{group.label}</p>
              {group.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <span className="sidebar-link-icon">{link.icon}</span>
                  <span className="sidebar-link-label">{link.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-avatar">{user.email?.charAt(0)?.toUpperCase() || "U"}</span>
            <div>
              <p className="sidebar-user-name">{user.email}</p>
              <p className="sidebar-user-role">{roleLabel}</p>
            </div>
          </div>
          <div className="sidebar-actions">
            <button type="button" className="sidebar-action" onClick={() => navigate("/change-password")}>
              Change Password
            </button>
            <button type="button" className="sidebar-action danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
