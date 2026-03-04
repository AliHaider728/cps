import { CalendarCheck, Award, GraduationCap, XCircle } from "lucide-react";
import DashShell from "../../components/DashShell";
const TrainingDashboard = () => (
  <DashShell role="Training & Development" colorClass="bg-green-600" stats={[
    { icon: CalendarCheck, label: "Supervisions Due",    value: "31",  sub: "This month" },
    { icon: Award,         label: "Competencies Active", value: "344", sub: "Total records" },
    { icon: GraduationCap, label: "CPPE In Progress",    value: "56",  sub: "Clinicians" },
    { icon: XCircle,       label: "Cancellations",       value: "4",   sub: "This month" },
  ]} />
);
export default TrainingDashboard;
