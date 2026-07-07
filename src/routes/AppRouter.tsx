import { lazy, Suspense, ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Unauthorized from "../pages/errors/Unauthorized";
import NotFound from "../pages/errors/NotFound";

// ── Super Admin
const SuperAdminDashboard = lazy(() => import("../pages/super-admin/SuperAdminDashboard"));
const ManageUsers = lazy(() => import("../pages/super-admin/ManageUsers"));
const AuditTrail = lazy(() => import("../pages/super-admin/AuditTrail"));
const AuditDetailPage = lazy(() => import("../pages/super-admin/AuditDetailPage"));

// ── Module 2 — Client Management
const ClientsPage = lazy(() => import("../pages/super-admin/client-managemnet/ClientsPage"));
const ICBListPage = lazy(() => import("../pages/super-admin/client-managemnet/ICBListPage"));
const ICBDetailPage = lazy(() => import("../pages/super-admin/client-managemnet/ICBDetailPage"));
const FederationListPage = lazy(() => import("../pages/super-admin/client-managemnet/FederationListPage"));
const PCNListPage = lazy(() => import("../pages/super-admin/client-managemnet/PCNListPage"));
const PCNDetailPage = lazy(() => import("../pages/super-admin/client-managemnet/PCNDetailPage"));
const PracticeListPage = lazy(() => import("../pages/super-admin/client-managemnet/PracticeListPage"));
const PracticeDetailPage = lazy(() => import("../pages/super-admin/client-managemnet/PracticeDetailPage"));
const RateHistoryPage = lazy(() => import("../pages/super-admin/client-managemnet/RateHistoryPage/RateHistoryPage"));

// ── Module 2 — Compliance
const ComplianceDocumentsListPage = lazy(() => import("../pages/super-admin/client-managemnet/ComplianceDocumentsListPage"));
const ComplianceDocumentDetailPage = lazy(() => import("../pages/super-admin/client-managemnet/ComplianceDocumentDetailPage"));
const ComplianceGroupsPage = lazy(() => import("../pages/super-admin/client-managemnet/CompliancePanel"));
const DocumentGroupDetailPage = lazy(() => import("../pages/super-admin/client-managemnet/DocumentGroupDetailPage"));

// ── Module 3 — Clinician Management
const CliniciansListPage = lazy(() => import("../pages/super-admin/Clinician-Management/CliniciansListPage"));
const CliniciansDetailPage = lazy(() => import("../pages/super-admin/Clinician-Management/CliniciansDetailPage"));
const RestrictedCliniciansPage = lazy(() => import("../pages/super-admin/Clinician-Management/RestrictedCliniciansPage"));

// ── Role Dashboards
const DirectorDashboard = lazy(() => import("../pages/director/DirectorDashboard"));
const OpsDashboard = lazy(() => import("../pages/ops/OpsDashboard"));
const FinanceDashboard = lazy(() => import("../pages/finance/FinanceDashboard"));
const TrainingDashboard = lazy(() => import("../pages/training/TrainingDashboard"));
const WorkforceDashboard = lazy(() => import("../pages/workforce/WorkforceDashboard"));
const ClinicianDashboard = lazy(() => import("../pages/clinician/ClinicianDashboard"));

// ── Clinician Portal
const MyTimesheetPage = lazy(() => import("../pages/clinician/MyTimesheetPage"));
const EnterMyHoursPage = lazy(() => import("../pages/clinician/EnterMyHoursPage"));
const ApplyForLeavePage = lazy(() => import("../pages/clinician/ApplyForLeavePage"));
const MyLeaveBalancePage = lazy(() => import("../pages/clinician/MyLeaveBalancePage"));
const LeaveManagementPage = lazy(() => import("../pages/super-admin/LeaveManagement/LeaveManagementPage"));
const ClinicianSupervisionPage = lazy(() => import("../pages/clinician/ClinicianSupervisionPage"));
const RemoteSupervisionPage = lazy(() => import("../pages/clinician/RemoteSupervisionPage"));
const ClinicianCPPEPage = lazy(() => import("../pages/clinician/ClinicianCPPEPage"));
const ClinicianCompliancePage = lazy(() => import("../pages/clinician/ClinicianCompliancePage"));
const ClinicianCertificatesPage = lazy(() => import("../pages/clinician/ClinicianCertificatesPage"));

// ── Module 5 — Rota Management
const RotaPage = lazy(() => import("../pages/super-admin/RotaManagement/RotaPage"));

//  NEW — Timesheet Queue + Detail (admin approval flow)
const TimesheetQueuePage = lazy(() => import("../pages/super-admin/RotaManagement/TimesheetQueuePage"));
const TimesheetDetailPage = lazy(() => import("../pages/super-admin/RotaManagement/TimesheetDetailPage"));

// ── Loader
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-slate-400 font-medium">Loading…</p>
    </div>
  </div>
);

// ── Protected wrapper
interface PProps {
  roles: string[];
  children: ReactNode;
}

const P = ({ roles, children }: PProps) => (
  <ProtectedRoute allowedRoles={roles}>
    <DashboardLayout>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </DashboardLayout>
  </ProtectedRoute>
);

const CM_ROLES = ["super_admin", "director", "ops_manager", "training_manager", "workforce_manager"];
const LEAVE_ADMIN_ROLES = ["super_admin", "director", "ops_manager", "finance"];
const CLINICIAN_ROLES = ["clinician", "super_admin"];
const TS_ROLES = ["super_admin", "ops_manager", "finance", "director"];

const AppRouter = () => (
  <Routes>
    {/* ── Public ───────────────────────────────────────── */}
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/unauthorized" element={<Unauthorized />} />

    {/* ── Super Admin ──────────────────────────────────── */}
    <Route path="/dashboard/super-admin" element={<P roles={["super_admin"]}><SuperAdminDashboard /></P>} />
    <Route path="/dashboard/super-admin/users" element={<P roles={["super_admin"]}><ManageUsers /></P>} />
    <Route path="/dashboard/super-admin/audit" element={<P roles={["super_admin"]}><AuditTrail /></P>} />
    <Route path="/dashboard/super-admin/audit/:id" element={<P roles={["super_admin"]}><AuditDetailPage /></P>} />

    {/* ── Module 2 — Client Management ─────────────────── */}
    <Route path="/dashboard/super-admin/clients"
      element={<P roles={["super_admin", "director", "ops_manager"]}><ClientsPage /></P>} />
    <Route path="/dashboard/super-admin/clients/icb"
      element={<P roles={["super_admin", "ops_manager"]}><ICBListPage /></P>} />
    <Route path="/dashboard/super-admin/clients/icb/:id"
      element={<P roles={["super_admin", "ops_manager", "director"]}><ICBDetailPage /></P>} />
    <Route path="/dashboard/super-admin/clients/federation"
      element={<P roles={["super_admin", "ops_manager"]}><FederationListPage /></P>} />
    <Route path="/dashboard/super-admin/clients/pcn"
      element={<P roles={["super_admin", "director", "ops_manager", "finance"]}><PCNListPage /></P>} />
    <Route path="/dashboard/super-admin/clients/pcn/:id"
      element={<P roles={["super_admin", "director", "ops_manager", "finance"]}><PCNDetailPage /></P>} />
    <Route path="/dashboard/super-admin/clients/practice"
      element={<P roles={["super_admin", "director", "ops_manager", "finance"]}><PracticeListPage /></P>} />
    <Route path="/dashboard/super-admin/clients/practice/:id"
      element={<P roles={["super_admin", "director", "ops_manager", "finance"]}><PracticeDetailPage /></P>} />

    <Route path="/dashboard/super-admin/rate-history"
      element={<P roles={["super_admin", "director", "finance"]}><RateHistoryPage /></P>} />





    {/* ── Compliance ────────────────────────────────────── */}
    <Route path="/dashboard/super-admin/compliance/documents"
      element={<P roles={["super_admin", "ops_manager"]}><ComplianceDocumentsListPage /></P>} />
    <Route path="/dashboard/super-admin/compliance/documents/:id"
      element={<P roles={["super_admin", "ops_manager"]}><ComplianceDocumentDetailPage /></P>} />
    <Route path="/dashboard/super-admin/compliance/groups"
      element={<P roles={["super_admin", "ops_manager"]}><ComplianceGroupsPage /></P>} />
    <Route path="/dashboard/super-admin/compliance/groups/:id"
      element={<P roles={["super_admin", "ops_manager"]}><DocumentGroupDetailPage /></P>} />

    {/* ── Module 3 — Clinician Management ──────────────── */}
    <Route path="/dashboard/clinicians"
      element={<P roles={CM_ROLES}><CliniciansListPage /></P>} />
    <Route path="/dashboard/clinicians/restricted"
      element={<P roles={["super_admin", "ops_manager"]}><RestrictedCliniciansPage /></P>} />
    {/* Static paths MUST be before :id — otherwise "projects" etc. match as clinician id */}
    <Route path="/dashboard/clinicians/basic-info" element={<Navigate to="/dashboard/clinicians?tab=basic-info" replace />} />
    <Route path="/dashboard/clinicians/skills" element={<Navigate to="/dashboard/clinicians?tab=skills" replace />} />
    <Route path="/dashboard/clinicians/compliance" element={<Navigate to="/dashboard/clinicians?tab=compliance" replace />} />
    <Route path="/dashboard/clinicians/client-history" element={<Navigate to="/dashboard/clinicians?tab=client-history" replace />} />
    <Route path="/dashboard/clinicians/calendar" element={<Navigate to="/dashboard/clinicians?tab=calendar" replace />} />
    <Route path="/dashboard/clinicians/projects" element={<Navigate to="/dashboard/clinicians?tab=project-mapping" replace />} />
    <Route path="/dashboard/clinicians/project-mapping" element={<Navigate to="/dashboard/clinicians?tab=project-mapping" replace />} />
    <Route path="/dashboard/clinicians/supervision-log" element={<Navigate to="/dashboard/clinicians?tab=supervision-log" replace />} />
    <Route path="/dashboard/clinicians/cppe-status" element={<Navigate to="/dashboard/clinicians?tab=cppe-status" replace />} />
    <Route path="/dashboard/clinicians/onboarding" element={<Navigate to="/dashboard/clinicians?tab=onboarding" replace />} />
    <Route path="/dashboard/clinicians/scope" element={<Navigate to="/dashboard/clinicians?tab=scope" replace />} />
    <Route path="/dashboard/clinicians/:id"
      element={<P roles={CM_ROLES}><CliniciansDetailPage /></P>} />
    <Route path="/dashboard/leave"
      element={<P roles={LEAVE_ADMIN_ROLES}><LeaveManagementPage /></P>} />

    {/* Legacy sidebar aliases → working routes */}
    <Route path="/dashboard/timesheets" element={<Navigate to="/dashboard/super-admin/timesheets" replace />} />
    <Route path="/dashboard/cover" element={<Navigate to="/dashboard/rota-gaps" replace />} />

    {/* ── Module 5 — Rota Management ───────────────────── */}
    <Route path="/dashboard/rota"
      element={<P roles={["super_admin", "ops_manager", "workforce_manager", "finance", "training_manager", "director"]}><RotaPage /></P>} />
    <Route path="/dashboard/rota-gaps"
      element={<Navigate to="/dashboard/rota?tab=gaps" replace />} />

    {/*  NEW — Timesheet approval queue + detail ─────── */}
    <Route path="/dashboard/super-admin/timesheets"
      element={<P roles={TS_ROLES}><TimesheetQueuePage /></P>} />
    <Route path="/dashboard/super-admin/timesheets/:id"
      element={<P roles={TS_ROLES}><TimesheetDetailPage /></P>} />

    {/* ── Role Dashboards ───────────────────────────────── */}
    <Route path="/dashboard/director" element={<P roles={["director", "super_admin"]}><DirectorDashboard /></P>} />
    <Route path="/dashboard/ops-manager" element={<P roles={["ops_manager", "super_admin"]}><OpsDashboard /></P>} />
    <Route path="/dashboard/finance" element={<P roles={["finance", "super_admin", "director"]}><FinanceDashboard /></P>} />
    <Route path="/dashboard/training" element={<P roles={["training_manager", "super_admin"]}><TrainingDashboard /></P>} />
    <Route path="/dashboard/workforce" element={<P roles={["workforce_manager", "super_admin"]}><WorkforceDashboard /></P>} />

    {/* ── Clinician Portal ──────────────────────────────── */}
    <Route path="/portal/clinician" element={<P roles={CLINICIAN_ROLES}><ClinicianDashboard /></P>} />
    <Route path="/portal/clinician/my-timesheet" element={<P roles={CLINICIAN_ROLES}><MyTimesheetPage /></P>} />
    <Route path="/portal/clinician/enter-hours" element={<P roles={CLINICIAN_ROLES}><EnterMyHoursPage /></P>} />
    <Route path="/portal/clinician/timesheet" element={<Navigate to="/portal/clinician/my-timesheet" replace />} />
    <Route path="/portal/clinician/apply-leave" element={<P roles={CLINICIAN_ROLES}><ApplyForLeavePage /></P>} />
    <Route path="/portal/clinician/leave-balance" element={<P roles={CLINICIAN_ROLES}><MyLeaveBalancePage /></P>} />
    <Route path="/portal/clinician/supervision" element={<P roles={CLINICIAN_ROLES}><ClinicianSupervisionPage /></P>} />
    <Route path="/portal/clinician/remote-supervision" element={<P roles={CLINICIAN_ROLES}><RemoteSupervisionPage /></P>} />
    <Route path="/portal/clinician/cppe" element={<P roles={CLINICIAN_ROLES}><ClinicianCPPEPage /></P>} />
    <Route path="/portal/clinician/compliance" element={<P roles={CLINICIAN_ROLES}><ClinicianCompliancePage /></P>} />
    <Route path="/portal/clinician/certificates"
      element={<P roles={CLINICIAN_ROLES}><ClinicianCertificatesPage /></P>} />

    {/* ── 404 ───────────────────────────────────────────── */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRouter;
