import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../auth";
import avatarDefault from "../assets/avatar-default.svg";

export default function UserAvatar() {
  const [avatar, setAvatar] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const user = getUser();
  const navigate = useNavigate();
  const storageKey = user?.email ? `profile_avatar_${user.email}` : "profile_avatar";
  const initKey = user?.email
    ? `profile_avatar_initialized_${user.email}`
    : "profile_avatar_initialized";

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    const initialized = localStorage.getItem(initKey);
    if (!initialized) {
      if (saved) {
        localStorage.removeItem(storageKey);
      }
      setAvatar("");
      return;
    }
    if (saved) {
      setAvatar(saved);
    }
  }, [storageKey, initKey]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  if (!user) return null;

  const handlePick = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  const handleFile = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        localStorage.setItem(storageKey, reader.result);
        localStorage.setItem(initKey, "1");
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditProfile = () => {
    setMenuOpen(false);
    navigate("/dashboard?edit=1");
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    window.location.href = "/";
  };

  return (
    <div className="user-avatar" ref={menuRef}>
      <div className="avatar-main">
        <button type="button" className="avatar-btn" onClick={handlePick}>
          <img
            src={avatar || avatarDefault}
            alt="Profile"
            className="avatar-img"
          />
        </button>
        <button
          type="button"
          className="avatar-menu-toggle"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-label="Open profile menu"
        >
          ▼
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="avatar-input"
          onChange={handleFile}
        />
      </div>
      <div className={`avatar-menu ${menuOpen ? "open" : ""}`}>
        <button type="button" onClick={handleEditProfile}>
          Edit Profile
        </button>
        <button type="button" className="danger" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
