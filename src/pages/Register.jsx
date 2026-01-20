import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Register() {
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
          Kolehiyo ng Subic
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
