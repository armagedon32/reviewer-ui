import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { changePasswordApi } from "../api";
import { getUser, saveUser } from "../auth";
import logo from "../assets/logo.png";

export default function ChangePassword() {
  const user = getUser();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setLoading(true);
    try {
      const data = await changePasswordApi({
        current_password: currentPassword,
        new_password: newPassword,
      });
      saveUser(data, user?.email);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <div className="logo-container">
          <img src={logo} alt="System Logo" className="logo" />
        </div>

        <h1 className="system-title">Update your password</h1>
        <p className="system-subtitle">
          For security, you must set a new password before continuing.
        </p>

        <form onSubmit={handleSubmit}>
          <InputField
            label="Temporary Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <InputField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <InputField
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <p className="error-text">{error}</p>}

          <Button
            text={loading ? "Updating..." : "Update Password"}
            type="submit"
            disabled={loading}
          />
        </form>
      </div>
    </div>
  );
}
