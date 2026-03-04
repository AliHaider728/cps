import { UserPlus, Key, ClipboardCheck, CalendarOff } from "lucide-react";
import DashShell from "../../components/DashShell";
const WorkforceDashboard = () => (
  <DashShell role="Workforce / VA" colorClass="bg-cyan-600" stats={[
    { icon: UserPlus,       label: "New Starters",      value: "3",  sub: "This month" },
    { icon: Key,            label: "Access Requests",   value: "8",  sub: "Pending" },
    { icon: ClipboardCheck, label: "Compliance Chases", value: "17", sub: "Outstanding" },
    { icon: CalendarOff,    label: "Leave Requests",    value: "9",  sub: "Awaiting approval" },
  ]} />
);
export default WorkforceDashboard;
