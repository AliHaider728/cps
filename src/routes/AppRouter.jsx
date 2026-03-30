import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute  from "../components/ProtectedRoute.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";

// ── Eager (small, needed immediately)  
import Login          from "../pages/auth/Login.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";
import Unauthorized   from "../pages/errors/Unauthorized.jsx"; 
import NotFound       from "../pages/errors/NotFound.jsx";

// ── Lazy (loaded only when visited)  
const SuperAdminDashboard = lazy(() => import("../pages/super-admin/SuperAdminDashboard.jsx"));
const ManageUsers         = lazy(() => import("../pages/super-admin/ManageUsers.jsx"));
const AuditTrail          = lazy(() => import("../pages/super-admin/AuditTrail.jsx"));
const ClientsModule       = lazy(() => import("../pages/super-admin/clients/ClientsModule.jsx"));
const DirectorDashboard   = lazy(() => import("../pages/director/DirectorDashboard.jsx"));
const OpsDashboard        = lazy(() => import("../pages/ops/OpsDashboard.jsx"));
const FinanceDashboard    = lazy(() => import("../pages/finance/FinanceDashboard.jsx"));
const TrainingDashboard   = lazy(() => import("../pages/training/TrainingDashboard.jsx"));
const WorkforceDashboard  = lazy(() => import("../pages/workforce/WorkforceDashboard.jsx"));
const ClinicianDashboard  = lazy(() => import("../pages/clinician/ClinicianDashboard.jsx"));

// ── Page loader   
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin"/>
      <p className="text-sm text-slate-400 font-medium">Loading…</p>
    </div>
  </div>
);

// ── Protected wrapper  
const P = ({ roles, children }) => (
  <ProtectedRoute allowedRoles={roles}>
    <DashboardLayout>
      <Suspense fallback={<PageLoader/>}>
        {children}
      </Suspense>
    </DashboardLayout>
  </ProtectedRoute>
);

const AppRouter = () => (
  <Routes>
    <Route path="/"                element={<Navigate to="/login" replace />} />
    <Route path="/login"           element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/unauthorized"    element={<Unauthorized />} />

    {/* Super Admin */}
    <Route path="/dashboard/super-admin"                    element={<P roles={["super_admin"]}><SuperAdminDashboard /></P>} />
    <Route path="/dashboard/super-admin/users"              element={<P roles={["super_admin"]}><ManageUsers /></P>} />
    <Route path="/dashboard/super-admin/audit"              element={<P roles={["super_admin"]}><AuditTrail /></P>} />

    {/* Module 2 — Client Management */}
    <Route path="/dashboard/super-admin/clients"            element={<P roles={["super_admin","ops_manager","director"]}><ClientsModule /></P>} />
    <Route path="/dashboard/super-admin/clients/icb"        element={<P roles={["super_admin","ops_manager","director"]}><ClientsModule /></P>} />
    <Route path="/dashboard/super-admin/clients/pcn"        element={<P roles={["super_admin","ops_manager","director"]}><ClientsModule /></P>} />
    <Route path="/dashboard/super-admin/clients/practice"   element={<P roles={["super_admin","ops_manager","director"]}><ClientsModule /></P>} />
    <Route path="/dashboard/super-admin/clients/history"    element={<P roles={["super_admin","ops_manager","director"]}><ClientsModule /></P>} />
    <Route path="/dashboard/super-admin/clients/restricted" element={<P roles={["super_admin","ops_manager","director"]}><ClientsModule /></P>} />

    {/* Role Dashboards */}
    <Route path="/dashboard/director"    element={<P roles={["director","super_admin"]}><DirectorDashboard /></P>} />
    <Route path="/dashboard/ops-manager" element={<P roles={["ops_manager","super_admin"]}><OpsDashboard /></P>} />
    <Route path="/dashboard/finance"     element={<P roles={["finance","super_admin","director"]}><FinanceDashboard /></P>} />
    <Route path="/dashboard/training"    element={<P roles={["training","super_admin"]}><TrainingDashboard /></P>} />
    <Route path="/dashboard/workforce"   element={<P roles={["workforce","super_admin"]}><WorkforceDashboard /></P>} />

    {/* Clinician Portal */}
    <Route path="/portal/clinician"      element={<P roles={["clinician","super_admin"]}><ClinicianDashboard /></P>} />
    <Route path="/portal/clinician/*"    element={<P roles={["clinician","super_admin"]}><ClinicianDashboard /></P>} />

    {/* 404 — unbuilt modules land here */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRouter;