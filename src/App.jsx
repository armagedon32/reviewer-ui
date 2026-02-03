import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles.css";
import Exam from "./pages/Exam";
import QuestionBank from "./pages/QuestionBank";
import UserAvatar from "./components/UserAvatar";
import ReviewMissed from "./pages/ReviewMissed";
import ExamPreview from "./pages/ExamPreview";
import AdminPanel from "./pages/AdminPanel";
import AdminSystemSettings from "./pages/AdminSystemSettings";
import AdminExamSettings from "./pages/AdminExamSettings";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminAuditLogs from "./pages/AdminAuditLogs";
import AdminRegister from "./pages/AdminRegister";
import Analytics from "./pages/Analytics";
import ChangePassword from "./pages/ChangePassword";
import InstructorPerformance from "./pages/InstructorPerformance";
import InstructorExamPreview from "./pages/InstructorExamPreview";
import ApprovalPending from "./pages/ApprovalPending";


export default function App() {
  return (
    <BrowserRouter>
      <UserAvatar />
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Login />} />
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
          path="/approval-pending"
          element={
            <ProtectedRoute allowedRoles={["student", "instructor"]}>
              <ApprovalPending />
            </ProtectedRoute>
          }
        />

        <Route
          path="/questions"
          element={
            <ProtectedRoute allowedRoles={["instructor"]}>
              <QuestionBank />
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor-performance"
          element={
            <ProtectedRoute allowedRoles={["instructor"]}>
              <InstructorPerformance />
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
        <Route
          path="/admin/system-settings"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminSystemSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/exam-settings"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminExamSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminAuditLogs />
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
            <ProtectedRoute allowedRoles={["student", "instructor"]}>
              <ExamPreview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor-exam-preview"
          element={
            <ProtectedRoute allowedRoles={["instructor", "admin"]}>
              <InstructorExamPreview />
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
