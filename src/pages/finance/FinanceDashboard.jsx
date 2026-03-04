import { Clock, Receipt, Hash, TrendingUp } from "lucide-react";
import DashShell from "../../components/DashShell.jsx";
const FinanceDashboard = () => (
  <DashShell role="Finance" colorClass="bg-yellow-500" stats={[
    { icon: Clock,      label: "Pending Timesheets",   value: "14",    sub: "Awaiting approval" },
    { icon: Receipt,    label: "Invoices This Month",  value: "£184K", sub: "Contractor + Client" },
    { icon: Hash,       label: "Staff Xero Codes",     value: "248",   sub: "Total records" },
    { icon: TrendingUp, label: "FTE Headcount",        value: "110",   sub: "37.5hr basis" },
  ]} />
);
export default FinanceDashboard;

