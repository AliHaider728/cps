import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute      from "../components/ProtectedRoute";
import DashboardLayout     from "../layouts/DashboardLayout";
import Login               from "../pages/auth/Login";
import ForgotPassword      from "../pages/auth/ForgotPassword";
import SuperAdminDashboard from "../pages/super-admin/SuperAdminDashboard";
import ManageUsers         from "../pages/super-admin/ManageUsers";
import DirectorDashboard   from "../pages/director/DirectorDashboard";
import OpsDashboard        from "../pages/ops/OpsDashboard";
import FinanceDashboard    from "../pages/finance/FinanceDashboard";
import TrainingDashboard   from "../pages/training/TrainingDashboard";
import WorkforceDashboard  from "../pages/workforce/WorkforceDashboard";
import ClinicianDashboard  from "../pages/clinician/ClinicianDashboard";
import Unauthorized        from "../pages/errors/Unauthorized";
import NotFound            from "../pages/errors/NotFound";

const P = ({ roles, children }) => (
  <ProtectedRoute allowedRoles={roles}>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

const AppRouter = () => (
  <Routes>
    <Route path="/"                 element={<Navigate to="/login" replace />} />
    <Route path="/login"            element={<Login />} />
    <Route path="/forgot-password"  element={<ForgotPassword />} />
    <Route path="/unauthorized"     element={<Unauthorized />} />

    <Route path="/dashboard/super-admin"       element={<P roles={["super_admin"]}><SuperAdminDashboard /></P>} />
    <Route path="/dashboard/super-admin/users" element={<P roles={["super_admin"]}><ManageUsers /></P>} />
    <Route path="/dashboard/director"          element={<P roles={["director","super_admin"]}><DirectorDashboard /></P>} />
    <Route path="/dashboard/ops-manager"       element={<P roles={["ops_manager","super_admin"]}><OpsDashboard /></P>} />
    <Route path="/dashboard/finance"           element={<P roles={["finance","super_admin","director"]}><FinanceDashboard /></P>} />
    <Route path="/dashboard/training"          element={<P roles={["training","super_admin"]}><TrainingDashboard /></P>} />
    <Route path="/dashboard/workforce"         element={<P roles={["workforce","super_admin"]}><WorkforceDashboard /></P>} />
    <Route path="/portal/clinician"            element={<P roles={["clinician","super_admin"]}><ClinicianDashboard /></P>} />

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRouter;
