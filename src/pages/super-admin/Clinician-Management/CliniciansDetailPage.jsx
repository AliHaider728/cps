import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Stethoscope, ArrowLeft, ShieldAlert, ShieldCheck, Mail, Phone,
  User, Sparkles, ShieldCheck as ShieldIcon, Building2, CalendarDays,
  Users as UsersIcon, GraduationCap, Rocket, ShieldAlert as ScopeIcon,
  Eye, ChevronDown, Clock, CalendarCheck,
} from "lucide-react";

import { useClinician, useUpdateClinician } from "../../../hooks/useClinician";
import { useAllUsers } from "../../../hooks/useAuth";
import { usePCNs } from "../../../hooks/usePCN";
import { usePractices } from "../../../hooks/usePractice";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { setActiveClinicianDetailTab } from "../../../slices/clinicianSlice";

import BasicInfoPanel     from "./panels/BasicInfoPanel.jsx";
import SkillsPanel        from "./panels/SkillsPanel.jsx";
import CompliancePanel    from "./panels/CompliancePanel.jsx";
import ClientHistoryPanel from "./panels/ClientHistoryPanel.jsx";
import CalendarPanel      from "./panels/CalendarPanel.jsx";
import SupervisionPanel   from "./panels/SupervisionPanel.jsx";
import CPPEPanel          from "./panels/CPPEPanel.jsx";
import OnboardingPanel    from "./panels/OnboardingPanel.jsx";
import ScopePanel         from "./panels/ScopePanel.jsx";
import { Spinner, fmtDate } from "./panels/shared.jsx";

const TABS = [
  { id: "basic",       label: "Basic Info",      icon: User          },
  { id: "skills",      label: "Skills",          icon: Sparkles      },
  { id: "compliance",  label: "Compliance",      icon: ShieldIcon    },
  { id: "history",     label: "Client History",  icon: Building2     },
  { id: "calendar",    label: "Calendar",        icon: CalendarDays  },
  { id: "supervision", label: "Supervision",     icon: UsersIcon     },
  { id: "cppe",        label: "CPPE",            icon: GraduationCap },
  { id: "onboarding",  label: "Onboarding",      icon: Rocket        },
  { id: "scope",       label: "Scope",           icon: ScopeIcon     },
];

const TYPE_COLORS = {
  Pharmacist: "bg-purple-50 text-purple-700 border-purple-200",
  Technician: "bg-amber-50  text-amber-700  border-amber-200",
  IP:         "bg-teal-50   text-teal-700   border-teal-200",
};

const CONTRACT_COLORS = {
  ARRS:   "bg-blue-50   text-blue-700   border-blue-200",
  EA:     "bg-green-50  text-green-700  border-green-200",
  Direct: "bg-orange-50 text-orange-700 border-orange-200",
  Mixed:  "bg-pink-50   text-pink-700   border-pink-200",
};

export default function CliniciansDetailPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();
  const activeTab = useAppSelector((s) => s.clinician?.activeDetailTab || "basic");
  const [mobileTabOpen, setMobileTabOpen] = useState(false);

  const { data, isLoading, isError } = useClinician(id);
  const usersQ     = useAllUsers();
  const pcnsQ      = usePCNs();
  const practicesQ = usePractices();
  const updateM    = useUpdateClinician();

  const role        = useAppSelector((s) => s.auth?.user?.role) || "";
  const canManage   = ["super_admin", "director", "ops_manager"].includes(role);
  const canRestrict = ["super_admin", "ops_manager"].includes(role);

  const changeTab = (tabId) => {
    dispatch(setActiveClinicianDetailTab(tabId));
    setMobileTabOpen(false);
  };

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

  const clinician     = data.clinician;
  const users         = usersQ.data?.users         || usersQ.data        || [];
  const pcns          = pcnsQ.data?.pcns            || pcnsQ.data         || [];
  const practices     = practicesQ.data?.practices  || practicesQ.data    || [];
  const activeTabMeta = TABS.find((t) => t.id === activeTab) || TABS[0];

  const handlePatch = async (patch) => updateM.mutateAsync({ id, data: patch });

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
    <div className="space-y-4 sm:space-y-5">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate("/dashboard/clinicians")}
          className="h-9 lg:h-10 px-3 lg:px-4 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 inline-flex items-center gap-1.5 transition-all shadow-sm"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Clinicians</span>
        </button>

        <div className="flex items-center gap-2 text-xs lg:text-sm text-slate-400 bg-white border border-slate-200 rounded-xl px-3 lg:px-4 py-2 shadow-sm">
          <Eye size={12} />
          <span>Viewing as</span>
          <span className="font-bold text-slate-600">{role || "user"}</span>
        </div>
      </div>

      {/* ── Header card ── */}
      <div className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/40 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-100/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />

        {/* Top accent line */}
        <div className="relative h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

        <div className="relative p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 lg:gap-8">

            {/* Left — avatar + info */}
            <div className="flex items-start gap-4 lg:gap-5 min-w-0">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 sm:w-[68px] sm:h-[68px] lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200/60">
                  <Stethoscope size={24} className="text-white sm:w-7 sm:h-7 lg:w-9 lg:h-9" />
                </div>
                {/* Online dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-full border-2 border-white bg-emerald-400" />
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <h1 className="text-xl sm:text-2xl lg:text-[1.75rem] font-extrabold text-slate-800 leading-tight">
                  {clinician.fullName || "—"}
                </h1>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${TYPE_COLORS[clinician.clinicianType] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                    {clinician.clinicianType || "—"}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${CONTRACT_COLORS[clinician.contractType] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                    {clinician.contractType || "—"}
                  </span>
                  {clinician.restricted ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border bg-red-50 text-red-700 border-red-200">
                      <ShieldAlert size={10} /> Restricted
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                      <ShieldCheck size={10} /> Active
                    </span>
                  )}
                </div>

                {/* Contact row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
                  {clinician.email && (
                    <a href={`mailto:${clinician.email}`}
                      className="text-xs lg:text-sm text-slate-500 inline-flex items-center gap-1.5 hover:text-blue-600 transition-colors group">
                      <span className="w-5 h-5 rounded-md bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                        <Mail size={11} className="group-hover:text-blue-500 transition-colors" />
                      </span>
                      {clinician.email}
                    </a>
                  )}
                  {clinician.phone && (
                    <a href={`tel:${clinician.phone}`}
                      className="text-xs lg:text-sm text-slate-500 inline-flex items-center gap-1.5 hover:text-blue-600 transition-colors group">
                      <span className="w-5 h-5 rounded-md bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                        <Phone size={11} className="group-hover:text-blue-500 transition-colors" />
                      </span>
                      {clinician.phone}
                    </a>
                  )}
                  {clinician.gphcNumber && (
                    <span className="text-xs lg:text-sm font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                      GPhC {clinician.gphcNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right — stats */}
            <div className="grid grid-cols-3 sm:grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-2.5 sm:min-w-[180px] lg:min-w-[250px]">
              {[
                {
                  icon: Clock,
                  label: "Hrs / wk",
                  value: clinician.workingHours || 0,
                  big: true,
                },
                {
                  icon: CalendarCheck,
                  label: "Started",
                  value: fmtDate(clinician.startDate),
                  big: false,
                },
                {
                  icon: CalendarDays,
                  label: "Leave",
                  value: (
                    <span>
                      {clinician?.leaveBalances?.annual?.taken ?? 0}
                      <span className="text-slate-400 font-normal text-[10px] lg:text-xs"> /&nbsp;
                        {clinician?.leaveBalances?.annual?.allowance ?? clinician?.annualLeaveAllowance ?? 28}
                      </span>
                    </span>
                  ),
                  big: false,
                },
              ].map(({ icon: Icon, label, value, big }) => (
                <div key={label} className="rounded-xl bg-white/80 border border-slate-200/80 p-3 lg:p-4 text-center shadow-sm">
                  <div className="flex items-center justify-center gap-1 mb-1.5">
                    <Icon size={10} className="text-slate-400 lg:w-3 lg:h-3" />
                    <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                  </div>
                  <p className={`font-extrabold text-slate-800 ${big ? "text-xl lg:text-2xl" : "text-xs lg:text-sm"}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE: Dropdown Tab ── */}
      <div className="sm:hidden relative">
        <button
          onClick={() => setMobileTabOpen(!mobileTabOpen)}
          className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <activeTabMeta.icon size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-slate-800">{activeTabMeta.label}</span>
          </div>
          <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${mobileTabOpen ? "rotate-180" : ""}`} />
        </button>

        {mobileTabOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden">
            {TABS.map((t, i) => {
              const Icon   = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => changeTab(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors text-left
                    ${active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}
                    ${i > 0 ? "border-t border-slate-100" : ""}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${active ? "bg-blue-600" : "bg-slate-100"}`}>
                    <Icon size={14} className={active ? "text-white" : "text-slate-500"} />
                  </div>
                  {t.label}
                  {active && <span className="ml-auto w-2 h-2 rounded-full bg-blue-600" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── DESKTOP: Tab strip ── */}
      <div className="hidden sm:block">
        <div className="bg-white rounded-2xl border border-slate-200 px-3 py-2.5 lg:px-4 shadow-sm">
          <div className="flex flex-wrap gap-1 lg:gap-1.5">
            {TABS.map((t) => {
              const Icon   = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => changeTab(t.id)}
                  className={`flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-xs lg:text-sm font-bold transition-all
                    ${active
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
                >
                  <Icon size={13} className="lg:w-[14px] lg:h-[14px]" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Active Panel ── */}
      <div>{renderActive()}</div>
    </div>
  );
}