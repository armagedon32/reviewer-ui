import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles.css";
import Exam from "./pages/Exam";
import QuestionBank from "./pages/QuestionBank";
import UserAvatar from "./components/UserAvatar";
import ReviewMissed from "./pages/ReviewMissed";
import ExamPreview from "./pages/ExamPreview";
import AdminPanel from "./pages/AdminPanel";
import AdminRegister from "./pages/AdminRegister";
import Analytics from "./pages/Analytics";
import ChangePassword from "./pages/ChangePassword";

export default function App() {
  return (
    <BrowserRouter>
      <UserAvatar />
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute allowedRoles={["admin", "instructor", "student"]}>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        {/* PROTECTED ROUTE */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "instructor", "student"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/questions"
          element={
            <ProtectedRoute allowedRoles={["admin", "instructor"]}>
              <QuestionBank />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        
        {/* EXAM ROUTE (STUDENT ONLY) */}
        <Route
          path="/exam"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Exam />
            </ProtectedRoute>
          }
        />

        <Route
          path="/exam-preview"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <ExamPreview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/review-missed"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <ReviewMissed />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Analytics />
            </ProtectedRoute>
          }
        />


        {/* FALLBACK (optional but recommended) */}
        <Route path="*" element={<Login />} />

      </Routes>
    </BrowserRouter>
  );
}
