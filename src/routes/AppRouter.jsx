import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

import ProtectedRoute  from "../components/ProtectedRoute.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";

// ── Auth pages (eager — user hits these before login) ────────────
import Login          from "../pages/auth/Login.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";

// ── Error pages ──────────────────────────────────────────────────
import Unauthorized from "../pages/auth/Unauthorized.jsx";
import NotFound     from "../pages/errors/NotFound.jsx";

// ── Super Admin ──────────────────────────────────────────────────
import SuperAdminDashboard from "../pages/super-admin/SuperAdminDashboard.jsx";
import ManageUsers         from "../pages/super-admin/ManageUsers.jsx";
import AuditTrail          from "../pages/super-admin/AuditTrail.jsx";

// ── Role Dashboards (lazy loaded for performance) ─────────────────
const {
  DirectorDashboard,
  OpsDashboard,
  FinanceDashboard,
  TrainingDashboard,
  WorkforceDashboard,
  ClinicianDashboard,
} = await import("../pages/RoleDashboards.jsx");

// ── Page-level spinner ────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

// ── Wrapper: ProtectedRoute + DashboardLayout ─────────────────────
const P = ({ roles, children }) => (
  <ProtectedRoute allowedRoles={roles}>
    <DashboardLayout>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </DashboardLayout>
  </ProtectedRoute>
);

// ── Router ────────────────────────────────────────────────────────
const AppRouter = () => (
  <Routes>
    {/* Public */}
    <Route path="/"                element={<Navigate to="/login" replace />} />
    <Route path="/login"           element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/unauthorized"    element={<Unauthorized />} />

    {/* Super Admin */}
    <Route path="/dashboard/super-admin"            element={<P roles={["super_admin"]}><SuperAdminDashboard /></P>} />
    <Route path="/dashboard/super-admin/users"      element={<P roles={["super_admin"]}><ManageUsers /></P>} />
    <Route path="/dashboard/super-admin/audit"      element={<P roles={["super_admin"]}><AuditTrail /></P>} />
    <Route path="/dashboard/super-admin/roles"      element={<P roles={["super_admin"]}><ManageUsers /></P>} />
    <Route path="/dashboard/super-admin/settings"   element={<P roles={["super_admin"]}><SuperAdminDashboard /></P>} />

    {/* Director */}
    <Route path="/dashboard/director" element={<P roles={["director","super_admin"]}><DirectorDashboard /></P>} />

    {/* Ops */}
    <Route path="/dashboard/ops-manager" element={<P roles={["ops_manager","super_admin"]}><OpsDashboard /></P>} />

    {/* Finance */}
    <Route path="/dashboard/finance" element={<P roles={["finance","super_admin","director"]}><FinanceDashboard /></P>} />

    {/* Training */}
    <Route path="/dashboard/training" element={<P roles={["training","super_admin"]}><TrainingDashboard /></P>} />

    {/* Workforce */}
    <Route path="/dashboard/workforce" element={<P roles={["workforce","super_admin"]}><WorkforceDashboard /></P>} />

    {/* Clinician portal */}
    <Route path="/portal/clinician" element={<P roles={["clinician","super_admin"]}><ClinicianDashboard /></P>} />

    {/* 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRouter;