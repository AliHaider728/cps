import { TrendingUp, DollarSign, Users, BarChart3 } from "lucide-react";
import DashShell from "../../components/DashShell";
const DirectorDashboard = () => (
  <DashShell role="Director" colorClass="bg-purple-600" stats={[
    { icon: DollarSign, label: "Annual Spend",    value: "£2.4M", sub: "YTD" },
    { icon: Users,      label: "Total Clinicians",value: "89",    sub: "Active" },
    { icon: TrendingUp, label: "Contract Value",  value: "£890K", sub: "Q1 2026" },
    { icon: BarChart3,  label: "PCN Coverage",    value: "94%",   sub: "Performance" },
  ]} />
);
export default DirectorDashboard;
