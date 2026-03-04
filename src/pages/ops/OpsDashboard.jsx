import { Calendar, UserCheck, RefreshCw, FileClock } from "lucide-react";
import DashShell from "../../components/DashShell";
const OpsDashboard = () => (
  <DashShell role="Operations Manager" colorClass="bg-orange-600" stats={[
    { icon: Calendar,  label: "Rota Gaps",        value: "7",  sub: "This month" },
    { icon: UserCheck, label: "Active Clinicians", value: "89", sub: "On contract" },
    { icon: RefreshCw, label: "Cover Requests",   value: "12", sub: "Pending" },
    { icon: FileClock, label: "Renewals Due",      value: "5",  sub: "Next 30 days" },
  ]} />
);
export default OpsDashboard;
