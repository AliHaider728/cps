import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Stethoscope, ArrowLeft, ShieldAlert, ShieldCheck, Mail, Phone,
  User, Sparkles, ShieldCheck as ShieldIcon, Building2, CalendarDays,
  Users as UsersIcon, GraduationCap, Rocket, ShieldAlert as ScopeIcon, Eye,
} from "lucide-react";

import { useClinician, useUpdateClinician } from "../../../hooks/useClinician";
import { useAllUsers } from "../../../hooks/useAuth";
import { usePCNs } from "../../../hooks/usePCN";
import { usePractices } from "../../../hooks/usePractice";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { setActiveClinicianDetailTab } from "../../../slices/clinicianSlice";

import BasicInfoPanel    from "./panels/BasicInfoPanel.jsx";
import SkillsPanel       from "./panels/SkillsPanel.jsx";
import CompliancePanel   from "./panels/CompliancePanel.jsx";
import ClientHistoryPanel from "./panels/ClientHistoryPanel.jsx";
import CalendarPanel     from "./panels/CalendarPanel.jsx";
import SupervisionPanel  from "./panels/SupervisionPanel.jsx";
import CPPEPanel         from "./panels/CPPEPanel.jsx";
import OnboardingPanel   from "./panels/OnboardingPanel.jsx";
import ScopePanel        from "./panels/ScopePanel.jsx";
import { Spinner, fmtDate } from "./panels/shared.jsx";

const TABS = [
  { id: "basic",       label: "Basic info",    icon: User       },
  { id: "skills",      label: "Skills",        icon: Sparkles   },
  { id: "compliance",  label: "Compliance",    icon: ShieldIcon },
  { id: "history",     label: "Client history", icon: Building2 },
  { id: "calendar",    label: "Calendar",      icon: CalendarDays },
  { id: "supervision", label: "Supervision",   icon: UsersIcon  },
  { id: "cppe",        label: "CPPE",          icon: GraduationCap },
  { id: "onboarding",  label: "Onboarding",    icon: Rocket     },
  { id: "scope",       label: "Scope",         icon: ScopeIcon  },
];

export default function CliniciansDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((s) => s.clinician?.activeDetailTab || "basic");

  const { data, isLoading, isError } = useClinician(id);
  const usersQ     = useAllUsers();
  const pcnsQ      = usePCNs();
  const practicesQ = usePractices();
  const updateM    = useUpdateClinician();

  // Role-aware permissions (mirrors PCN detail page approach)
  const role       = useAppSelector((s) => s.auth?.user?.role) || "";
  const canManage  = ["super_admin", "director", "ops_manager"].includes(role);
  const canRestrict = ["super_admin", "ops_manager"].includes(role);

  useEffect(() => { /* default tab kept across visits via redux */ }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner cls="border-blue-600" />
      </div>
    );
  }

  if (isError || !data?.clinician) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
        <p className="text-sm font-bold text-slate-700">Clinician not found.</p>
        <button onClick={() => navigate("/dashboard/clinicians")}
          className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold inline-flex items-center gap-1.5">
          <ArrowLeft size={13} /> Back to list
        </button>
      </div>
    );
  }
  
  const clinician = data.clinician;
  const users     = usersQ.data?.users     || usersQ.data     || [];
  const pcns      = pcnsQ.data?.pcns       || pcnsQ.data      || [];
  const practices = practicesQ.data?.practices || practicesQ.data || [];

  const handlePatch = async (patch) =>
    updateM.mutateAsync({ id, data: patch });

  const renderActive = () => {
    switch (activeTab) {
      case "basic":       return <BasicInfoPanel    clinician={clinician} onPatch={handlePatch} users={users} />;
      case "skills":      return <SkillsPanel       clinician={clinician} onPatch={handlePatch} />;
      case "compliance":  return <CompliancePanel   clinicianId={id} canManage={canManage} />;
      case "history":     return <ClientHistoryPanel clinicianId={id} canManage={canManage} pcns={pcns} practices={practices} />;
      case "calendar":    return <CalendarPanel     clinicianId={id} clinician={clinician} canManage={canManage} />;
      case "supervision": return <SupervisionPanel  clinicianId={id} canManage={canManage} users={users} />;
      case "cppe":        return <CPPEPanel         clinicianId={id} canManage={canManage} />;
      case "onboarding":  return <OnboardingPanel   clinicianId={id} clinician={clinician} canManage={canManage} />;
      case "scope":       return <ScopePanel        clinician={clinician} canRestrict={canRestrict} />;
      default:            return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top bar ───────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => navigate("/dashboard/clinicians")}
          className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 inline-flex items-center gap-1.5">
          <ArrowLeft size={13} /> Clinicians
        </button>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Eye size={12} /> Viewing as <span className="font-bold text-slate-600 ml-1">{role || "user"}</span>
        </div>
      </div>

      {/* ── Header card ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
              <Stethoscope size={26} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800">{clinician.fullName || "—"}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border bg-slate-50 text-slate-600 border-slate-200">
                  {clinician.clinicianType || "—"}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border bg-blue-50 text-blue-700 border-blue-200">
                  {clinician.contractType || "—"}
                </span>
                {clinician.restricted ? (
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border bg-red-50 text-red-700 border-red-200 inline-flex items-center gap-1">
                    <ShieldAlert size={11} /> Restricted
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border bg-green-50 text-green-700 border-green-200 inline-flex items-center gap-1">
                    <ShieldCheck size={11} /> Active
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                {clinician.email && (
                  <span className="inline-flex items-center gap-1.5"><Mail size={12} /> {clinician.email}</span>
                )}
                {clinician.phone && (
                  <span className="inline-flex items-center gap-1.5"><Phone size={12} /> {clinician.phone}</span>
                )}
                {clinician.gphcNumber && (
                  <span className="font-mono text-slate-600">GPhC: {clinician.gphcNumber}</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center min-w-[260px]">
            <div className="rounded-xl bg-slate-50 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hours / wk</p>
              <p className="text-base font-extrabold text-slate-800">{clinician.workingHours || 0}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Started</p>
              <p className="text-xs font-bold text-slate-700">{fmtDate(clinician.startDate)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Annual leave</p>
              <p className="text-xs font-bold text-slate-700">
                {clinician?.leaveBalances?.annual?.taken ?? 0} / {clinician?.leaveBalances?.annual?.allowance ?? clinician?.annualLeaveAllowance ?? 28}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab strip ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((t) => {
            const active = activeTab === t.id;
            const Icon   = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => dispatch(setActiveClinicianDetailTab(t.id))}
                className={`px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all
                  ${active
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-600 hover:bg-slate-50"}`}
              >
                <Icon size={13} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active panel ──────────────────────────────────── */}
      {renderActive()}
    </div>
  );
}
