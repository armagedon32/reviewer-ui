import { Navigate, useLocation } from "react-router-dom";
import { getUser } from "../auth";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const user = getUser();
  const location = useLocation();

  // Not logged in
  if (!user) return <Navigate to="/" replace />;

  if (user.mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  // Role check (because App.jsx already passes allowedRoles)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
