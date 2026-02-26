import { Link } from "react-router-dom";
import { getSystemLogo, getSystemSchoolName } from "../systemLogo";

export default function Register() {
  const logo = getSystemLogo();
  const schoolName = getSystemSchoolName();
  return (
    <div className="container">
      <div className="card">
        <h2>Registration Disabled</h2>
        <div className="logo-container">
          <img src={logo} alt="System Logo" className="logo" />
        </div>

        <h1 className="system-title">
          Personalized Certification &amp; Mock Board Reviewer
        </h1>

        <p className="system-subtitle">
          {schoolName}
        </p>

        <p className="status-note">
          Accounts are created by administrators. Please contact your admin to get access.
        </p>

        <p className="auth-switch">
          <Link to="/">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
