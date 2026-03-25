// ── Director Dashboard ──────────────────────────────────────────
import {
  BarChart3, FileSignature, AlertTriangle, Users,
  Building2, Calendar, Clock, TrendingUp,
  CalendarCheck, GraduationCap, ClipboardCheck
} from "lucide-react";
import DashShell from "../components/DashShell.jsx";

export const DirectorDashboard = () => (
  <DashShell role="Director" colorClass="bg-purple-600" stats={[
    { icon: Building2,     label: "Active PCNs",       value: "18",  sub: "Nationwide" },
    { icon: FileSignature, label: "Active Contracts",  value: "142", sub: "This month" },
    { icon: BarChart3,     label: "Monthly Revenue",   value: "£84k",sub: "Mar 2026" },
    { icon: AlertTriangle, label: "Open Complaints",   value: "3",   sub: "Needs review" },
  ]} />
);

// ── Ops Dashboard ────────────────────────────────────────────────
export const OpsDashboard = () => (
  <DashShell role="Operations" colorClass="bg-orange-500" stats={[
    { icon: Calendar,      label: "Rota Gaps (14d)",   value: "5",   sub: "Needs cover" },
    { icon: Users,         label: "Active Clinicians", value: "61",  sub: "All contracts" },
    { icon: AlertTriangle, label: "Complaints Open",   value: "3",   sub: "SLA active" },
    { icon: FileSignature, label: "Renewals Due",      value: "7",   sub: "Next 30 days" },
  ]} />
);

// ── Finance Dashboard ────────────────────────────────────────────
export const FinanceDashboard = () => (
  <DashShell role="Finance" colorClass="bg-yellow-500" stats={[
    { icon: Clock,         label: "Pending Timesheets",value: "8",   sub: "Awaiting approval" },
    { icon: BarChart3,     label: "Invoices Ready",    value: "12",  sub: "To send" },
    { icon: TrendingUp,    label: "FTE Headcount",     value: "48.6",sub: "37.5h = 1 FTE" },
    { icon: AlertTriangle, label: "Variances Flagged", value: "4",   sub: "This month" },
  ]} />
);

// ── Training Dashboard ───────────────────────────────────────────
export const TrainingDashboard = () => (
  <DashShell role="Training & Development" colorClass="bg-green-600" stats={[
    { icon: CalendarCheck,  label: "Supervisions Due",  value: "9",  sub: "This month" },
    { icon: GraduationCap,  label: "CPPE Off-Track",    value: "4",  sub: "Needs attention" },
    { icon: ClipboardCheck, label: "Overdue Reflections",value: "2", sub: "Past 7-day deadline" },
    { icon: AlertTriangle,  label: "MHRA Unread",       value: "6",  sub: "Unacknowledged" },
  ]} />
);

// ── Workforce Dashboard ──────────────────────────────────────────
export const WorkforceDashboard = () => (
  <DashShell role="Workforce" colorClass="bg-cyan-600" stats={[
    { icon: Users,         label: "Total Clinicians",  value: "61",  sub: "Active" },
    { icon: Calendar,      label: "Cover Requests",    value: "3",   sub: "Open" },
    { icon: ClipboardCheck,label: "Compliance Gaps",   value: "11",  sub: "Docs missing" },
    { icon: AlertTriangle, label: "Leave Pending",     value: "5",   sub: "Awaiting review" },
  ]} />
);

// ── Clinician Dashboard ──────────────────────────────────────────
export const ClinicianDashboard = () => (
  <DashShell role="My Portal" colorClass="bg-blue-600" stats={[
    { icon: Calendar,      label: "Next Shift",        value: "Today",sub: "09:00 – 17:00" },
    { icon: Clock,         label: "Leave Remaining",   value: "12d",  sub: "ARRS balance" },
    { icon: CalendarCheck, label: "Next Supervision",  value: "28 Mar",sub: "With Stacey" },
    { icon: ClipboardCheck,label: "Compliance",        value: "94%",  sub: "1 doc missing" },
  ]} />
);