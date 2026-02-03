import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { login, saveUser } from "../auth";
import { getSystemLogo } from "../systemLogo";

export default function Login() {
  const logo = getSystemLogo();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);
      saveUser(data, email);
      if (data.must_change_password) {
        navigate("/change-password");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        {/* Logo */}
        <div className="logo-container">
          <img src={logo} alt="System Logo" className="logo" />
        </div>

        <h1 className="system-title">
          Personalized Certification &amp; Mock Board Reviewer
        </h1>

        <p className="system-subtitle">
          Kolehiyo ng Subic
        </p>

        <form onSubmit={handleLogin}>
          <InputField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <InputField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error-text">{error}</p>}

          <Button
            text={loading ? "Logging in..." : "Login"}
            type="submit"
            disabled={loading}
          />
        </form>

        <p className="auth-switch">
          Don't have an account? Contact your admin.
        </p>
      </div>
    </div>
  );
}
