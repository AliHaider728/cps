import { Users, Building2, FileSignature, AlertTriangle } from "lucide-react";
import DashShell from "../../components/DashShell.jsx";
const SuperAdminDashboard = () => (
  <DashShell role="Super Admin" colorClass="bg-red-600" stats={[
    { icon: Users,         label: "Total Users",      value: "24",  sub: "All roles" },
    { icon: Building2,     label: "Active PCNs",      value: "18",  sub: "Nationwide" },
    { icon: FileSignature, label: "Active Contracts", value: "142", sub: "This month" },
    { icon: AlertTriangle, label: "Open Complaints",  value: "3",   sub: "Needs review" },
  ]} />
);
export default SuperAdminDashboard;
