import { Clock, CalendarCheck, ClipboardCheck, GraduationCap } from "lucide-react";
import DashShell from "../../components/DashShell";
const ClinicianDashboard = () => (
  <DashShell role="Clinician Portal" colorClass="bg-slate-600" stats={[
    { icon: Clock,          label: "Timesheet Status",  value: "Due",    sub: "March 2026" },
    { icon: CalendarCheck,  label: "Next Supervision",  value: "12 Mar", sub: "Stacey M." },
    { icon: ClipboardCheck, label: "Compliance",        value: "92%",    sub: "Up to date" },
    { icon: GraduationCap,  label: "CPPE Progress",     value: "68%",    sub: "On track" },
  ]} />
);
export default ClinicianDashboard;
