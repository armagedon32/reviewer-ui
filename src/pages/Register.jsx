import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { register as registerUser } from "../auth";
import AlertModal from "../components/AlertModal";
import logo from "../assets/logo.png";


export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "success",
    confirmText: "OK",
    onConfirm: null,
  });

  const navigate = useNavigate();

  const closeModal = () =>
    setModal((prev) => ({
      ...prev,
      open: false,
    }));

  async function handleRegister() {
    setError("");
    setLoading(true);
    try {
      await registerUser(email, password, role);
      setModal({
        open: true,
        title: "Registered!",
        message: `Account created as ${role}. You can now log in.`,
        type: "success",
        confirmText: "Go to login",
        onConfirm: () => {
          closeModal();
          navigate("/");
        },
      });
    } catch (err) {
      setError("Registration failed. Please try again.");
      setModal({
        open: true,
        title: "Registration failed",
        message: "Please check your details and try again.",
        type: "error",
        confirmText: "Close",
        onConfirm: closeModal,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Register</h2>
        <div className="logo-container">
            <img src={logo} alt="System Logo" className="logo" />
            </div>

            <h1 className="system-title">
            Personalized Certification & Mock Board Reviewer
            </h1>

            <p className="system-subtitle">
            Kolehiyo ng Subic
            </p>


        <InputField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
        </select>

        <Button
          text={loading ? "Registering..." : "Register"}
          onClick={handleRegister}
          disabled={loading}
        />

        {error && <p className="error-text">{error}</p>}

        <p className="auth-switch">
          Already registered? <Link to="/">Back to login</Link>
        </p>
      </div>
      <AlertModal
        isOpen={modal.open}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmText={modal.confirmText}
        onConfirm={modal.onConfirm || closeModal}
      />
    </div>
  );
}
