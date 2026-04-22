import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";

import Login          from "../pages/auth/Login.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";
import Unauthorized   from "../pages/errors/Unauthorized.jsx";
import NotFound       from "../pages/errors/NotFound.jsx";

const SuperAdminDashboard = lazy(() => import("../pages/super-admin/SuperAdminDashboard.jsx"));
const ManageUsers         = lazy(() => import("../pages/super-admin/ManageUsers.jsx"));
const AuditTrail          = lazy(() => import("../pages/super-admin/AuditTrail.jsx"));

// Module 2 — Client Management
const ClientsPage        = lazy(() => import("../pages/super-admin/client-managemnet/ClientsPage.jsx"));
const ICBListPage        = lazy(() => import("../pages/super-admin/client-managemnet/ICBListPage.jsx"));
const ICBDetailPage      = lazy(() => import("../pages/super-admin/client-managemnet/ICBDetailPage.jsx"));
const FederationListPage = lazy(() => import("../pages/super-admin/client-managemnet/FederationListPage.jsx"));
const PCNListPage        = lazy(() => import("../pages/super-admin/client-managemnet/PCNListPage.jsx"));
const PCNDetailPage      = lazy(() => import("../pages/super-admin/client-managemnet/PCNDetailPage.jsx"));
const PracticeListPage   = lazy(() => import("../pages/super-admin/client-managemnet/PracticeListPage.jsx"));
const PracticeDetailPage = lazy(() => import("../pages/super-admin/client-managemnet/PracticeDetailPage.jsx"));
// ❌ ContactHistoryPanel import removed — it is used as a tab inside PCNDetailPage and PracticeDetailPage, not as a standalone page

// Compliance Pages
const ComplianceDocumentsListPage = lazy(() => import("../pages/super-admin/client-managemnet/ComplianceDocumentsListPage.jsx"));  
const ComplianceDocumentDetailPage = lazy(() => import("../pages/super-admin/client-managemnet/ComplianceDocumentDetailPage.jsx"));
const ComplianceGroupsPage         = lazy(() => import("../pages/super-admin/client-managemnet/CompliancePanel.jsx"));
const DocumentGroupDetailPage      = lazy(() => import("../pages/super-admin/client-managemnet/DocumentGroupDetailPage.jsx"));

// Role Dashboards
const DirectorDashboard  = lazy(() => import("../pages/director/DirectorDashboard.jsx"));
const OpsDashboard       = lazy(() => import("../pages/ops/OpsDashboard.jsx"));
const FinanceDashboard   = lazy(() => import("../pages/finance/FinanceDashboard.jsx"));
const TrainingDashboard  = lazy(() => import("../pages/training/TrainingDashboard.jsx"));
const WorkforceDashboard = lazy(() => import("../pages/workforce/WorkforceDashboard.jsx"));
const ClinicianDashboard = lazy(() => import("../pages/clinician/ClinicianDashboard.jsx"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-slate-400 font-medium">Loading…</p>
    </div>
  </div>
);

const P = ({ roles, children }) => (
  <ProtectedRoute allowedRoles={roles}>
    <DashboardLayout>
      <Suspense fallback={<PageLoader />}>
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
    <Route path="/dashboard/super-admin"       element={<P roles={["super_admin"]}><SuperAdminDashboard /></P>} />
    <Route path="/dashboard/super-admin/users" element={<P roles={["super_admin"]}><ManageUsers /></P>} />
    <Route path="/dashboard/super-admin/audit" element={<P roles={["super_admin"]}><AuditTrail /></P>} />

    {/* Module 2 — Client Management */}
    <Route path="/dashboard/super-admin/clients" element={<P roles={["super_admin","director","ops_manager"]}><ClientsPage /></P>} />

    {/* ICB */}
    <Route path="/dashboard/super-admin/clients/icb" element={<P roles={["super_admin","ops_manager"]}><ICBListPage /></P>} />
    <Route path="/dashboard/super-admin/clients/icb/:id" element={<P roles={["super_admin","ops_manager","director"]}><ICBDetailPage /></P>} />

    {/* Federation */}
    <Route path="/dashboard/super-admin/clients/federation" element={<P roles={["super_admin","ops_manager"]}><FederationListPage /></P>} />

    {/* PCN */}
    <Route path="/dashboard/super-admin/clients/pcn" element={<P roles={["super_admin","director","ops_manager","finance"]}><PCNListPage /></P>} />
    <Route path="/dashboard/super-admin/clients/pcn/:id" element={<P roles={["super_admin","director","ops_manager","finance"]}><PCNDetailPage /></P>} />

    {/* Practice */}
    <Route path="/dashboard/super-admin/clients/practice" element={<P roles={["super_admin","director","ops_manager","finance"]}><PracticeListPage /></P>} />
    <Route path="/dashboard/super-admin/clients/practice/:id" element={<P roles={["super_admin","director","ops_manager","finance"]}><PracticeDetailPage /></P>} />

    {/* ❌ /clients/history standalone route removed — ContactHistoryPanel is a tab inside PCN/Practice detail pages */}

    {/* Compliance Documents - Sidebar Route (List + Detail) */}
    <Route path="/dashboard/super-admin/compliance/documents"
      element={<P roles={["super_admin","ops_manager"]}><ComplianceDocumentsListPage /></P>} />
    <Route path="/dashboard/super-admin/compliance/documents/:id"
      element={<P roles={["super_admin","ops_manager"]}><ComplianceDocumentDetailPage /></P>} />
    <Route path="/dashboard/super-admin/compliance/groups"
      element={<P roles={["super_admin","ops_manager"]}><ComplianceGroupsPage /></P>} />
    <Route path="/dashboard/super-admin/compliance/groups/:id"
      element={<P roles={["super_admin","ops_manager"]}><DocumentGroupDetailPage /></P>} />

    {/* Role Dashboards */}
    <Route path="/dashboard/director"    element={<P roles={["director","super_admin"]}><DirectorDashboard /></P>} />
    <Route path="/dashboard/ops-manager" element={<P roles={["ops_manager","super_admin"]}><OpsDashboard /></P>} />
    <Route path="/dashboard/finance"     element={<P roles={["finance","super_admin","director"]}><FinanceDashboard /></P>} />
    <Route path="/dashboard/training"    element={<P roles={["training","super_admin"]}><TrainingDashboard /></P>} />
    <Route path="/dashboard/workforce"   element={<P roles={["workforce","super_admin"]}><WorkforceDashboard /></P>} />

    {/* Clinician Portal */}
    <Route path="/portal/clinician"   element={<P roles={["clinician","super_admin"]}><ClinicianDashboard /></P>} />
    <Route path="/portal/clinician/*" element={<P roles={["clinician","super_admin"]}><ClinicianDashboard /></P>} />

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRouter;