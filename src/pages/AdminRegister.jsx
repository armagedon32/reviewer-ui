import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { registerAdmin } from "../auth";
import AlertModal from "../components/AlertModal";
import { getSystemLogo } from "../systemLogo";

export default function AdminRegister() {
  const logo = getSystemLogo();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
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
    setLoading(true);
    try {
      await registerAdmin(email, password, adminKey);
      setModal({
        open: true,
        title: "Admin created",
        message: "Admin account created successfully.",
        type: "success",
        confirmText: "Back to login",
        onConfirm: () => {
          closeModal();
          navigate("/");
        },
      });
    } catch (err) {
      setModal({
        open: true,
        title: "Registration failed",
        message: err?.message || "Admin registration failed.",
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
        <h2>Admin Registration</h2>
        <div className="logo-container">
          <img src={logo} alt="System Logo" className="logo" />
        </div>

        <h1 className="system-title">
          Personalized Certification & Mock Board Reviewer
        </h1>

        <p className="system-subtitle">Kolehiyo ng Subic</p>
        <AlertModal
          isOpen={modal.open}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          confirmText={modal.confirmText}
          onConfirm={modal.onConfirm || closeModal}
        />

        <InputField
          label="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <InputField
          label="Admin Key"
          type="password"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
        />

        <Button
          text={loading ? "Registering..." : "Create Admin"}
          onClick={handleRegister}
          disabled={loading}
        />

        <p className="auth-switch">
          Back to <Link to="/">login</Link>
        </p>
      </div>
    </div>
  );
}
