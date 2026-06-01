import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, AlertTriangle, FileText, CalendarDays,
  CheckCircle2, UserPlus, Activity,
  Building2, Stethoscope, Network, ArrowRight,
} from "lucide-react";
import { useClinicians }        from "../../hooks/useClinicians";
import { usePendingTimesheets, useRotaGaps } from "../../hooks/useRota";
import { useExpiringDocs }      from "../../hooks/useCompliance";
import { usePCNs }              from "../../hooks/usePCN";
import { usePractices }         from "../../hooks/usePractice";

/* ─── RAG Badge ─────────────────────────────────────────────────────────── */
function RAGBadge({ status }) {
  const map = {
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    amber: "bg-amber-50  text-amber-700  border border-amber-200",
    red:   "bg-rose-50   text-rose-700   border border-rose-200",
  };
  const labels = { green: "On Track", amber: "Due Soon", red: "Overdue" };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${map[status] || map.amber}`}>
      {labels[status] || status}
    </span>
  );
}

/* ─── Timesheet Status Badge ────────────────────────────────────────────── */
function TsBadge({ status }) {
  const map = {
    draft:     "bg-slate-100 text-slate-500",
    submitted: "bg-amber-50  text-amber-700",
    approved:  "bg-emerald-50 text-emerald-700",
    rejected:  "bg-rose-50   text-rose-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${map[status] || map.draft}`}>
      {status || "draft"}
    </span>
  );
}

/* ─── Stat Card — client-page tile style ────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, gradient, ring, accent, glow, alert, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden text-left rounded-2xl bg-white border p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 w-full
        ${alert ? "border-rose-200 bg-rose-50/30" : "border-slate-200"}
        ${ring || "ring-slate-100"}
        ${glow || ""}`}
    >
      {/* Decorative gradient blob */}
      <div
        className={`pointer-events-none absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500`}
      />
      {/* Bottom gradient bar */}
      <div
        className={`pointer-events-none absolute left-0 right-0 bottom-0 h-1 bg-gradient-to-r ${gradient} opacity-70 group-hover:opacity-100 transition-opacity`}
      />

      {/* Top row: icon + alert/live badge */}
      <div className="flex items-start justify-between mb-3 sm:mb-4 relative z-10">
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md shadow-slate-900/10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shrink-0`}
        >
          <Icon size={20} className="text-white" strokeWidth={2.2} />
        </div>
        <div
          className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg
            ${alert ? "text-rose-600 bg-rose-100" : "text-emerald-600 bg-emerald-50"}`}
        >
          <Activity size={10} /> {alert ? "ALERT" : "LIVE"}
        </div>
      </div>

      {/* Value + label */}
      <div className="relative z-10">
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
          {value}
        </h3>
        <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider leading-tight">
          {label}
        </p>
        {sub && (
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">{sub}</p>
        )}
      </div>

      {/* Count badge + manage row */}
      <div className="mt-3 sm:mt-4 flex items-center justify-between relative z-10">
        {accent && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${accent}`}>
            {value ?? 0}
          </span>
        )}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 group-hover:text-slate-800 transition-colors ml-auto">
          <span>View</span>
          <ArrowRight
            size={13}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </div>
      </div>
    </button>
  );
}

/* ─── Section Header ────────────────────────────────────────────────────── */
function SectionHeader({ icon: Icon, title, count, countColor = "bg-slate-100 text-slate-600", onViewAll }) {
  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-slate-400" />
        <h2 className="text-sm font-black text-slate-900">{title}</h2>
        {count !== undefined && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${countColor}`}>
            {count}
          </span>
        )}
      </div>
      {onViewAll && (
        <button onClick={onViewAll} className="text-xs font-bold text-blue-600 hover:text-blue-700 shrink-0">
          View all →
        </button>
      )}
    </div>
  );
}

/* ─── Empty State ───────────────────────────────────────────────────────── */
function EmptyState({ icon: Icon = CheckCircle2, message }) {
  return (
    <div className="px-6 py-8 text-center">
      <Icon size={24} className="mx-auto mb-2 text-emerald-400" />
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

/* ─── Skeleton ──────────────────────────────────────────────────────────── */
function SkeletonRows({ n = 3 }) {
  return (
    <div className="p-4 space-y-3">
      {[...Array(n)].map((_, i) => (
        <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

/* ─── Loading Value helper ──────────────────────────────────────────────── */
const val = (loading, v) => (loading ? "—" : v);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════════════════════════════ */
export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  const now        = new Date();
  const monthLabel = now.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  /* ── All real hooks ───────────────────────────────────────────────────── */
  const { data: cliniciansData, isLoading: cliniciansLoading } = useClinicians({});
  const { data: pendingData,    isLoading: tsLoading          } = usePendingTimesheets();
  const { data: gapsData                                      } = useRotaGaps();
  const { data: expiryData,     isLoading: expiryLoading      } = useExpiringDocs(30);
  const { data: pcnData,        isLoading: pcnLoading         } = usePCNs({});
  const { data: practiceData,   isLoading: practiceLoading    } = usePractices({});

  /* ── Derived ──────────────────────────────────────────────────────────── */
  const allClinicians  = useMemo(() => cliniciansData?.clinicians  || [], [cliniciansData]);
  const pendingTs      = useMemo(() => pendingData                 || [], [pendingData]);
  const gaps           = useMemo(() => gapsData?.gaps              || [], [gapsData]);

  const allPCNs = useMemo(() => {
    if (!pcnData) return [];
    if (Array.isArray(pcnData))        return pcnData;
    if (Array.isArray(pcnData.pcns))   return pcnData.pcns;
    if (Array.isArray(pcnData.data))   return pcnData.data;
    return [];
  }, [pcnData]);

  const allPractices = useMemo(() => {
    if (!practiceData) return [];
    if (Array.isArray(practiceData))             return practiceData;
    if (Array.isArray(practiceData.practices))   return practiceData.practices;
    if (Array.isArray(practiceData.data))        return practiceData.data;
    return [];
  }, [practiceData]);

  const expiringDocs = useMemo(() => {
    if (!expiryData) return [];
    if (Array.isArray(expiryData))              return expiryData;
    if (Array.isArray(expiryData.documents))    return expiryData.documents;
    if (Array.isArray(expiryData.data))         return expiryData.data;
    return [];
  }, [expiryData]);

  const urgentGaps       = gaps.filter((g) => g.urgency === "urgent" || g.urgency === "critical");
  const criticalGaps     = gaps.filter((g) => g.urgency === "critical");
  const activeClinicians = allClinicians.filter((c) => !c.restricted && !c.isRestricted);
  const restrictedCount  = allClinicians.filter((c) =>  c.restricted ||  c.isRestricted).length;
  const onboardingCount  = allClinicians.filter((c) =>  c.status === "onboarding").length;
  const critical7        = expiringDocs.filter((d) => (d.days_until_expiry ?? 999) <= 7);
  const activePCNs       = allPCNs.filter((p) => !p.status || p.status === "active");
  const activePractices  = allPractices.filter((p) => !p.status || p.status === "active");

  return (
    <div className="space-y-5 sm:space-y-6 pb-16 px-3 sm:px-0">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">System Overview</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              Live · {monthLabel}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stat Cards Row 1 — Clinicians + Ops ─────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Users}
          label="Total Clinicians"
          value={val(cliniciansLoading, allClinicians.length)}
          sub={cliniciansLoading ? "" : `${activeClinicians.length} active · ${onboardingCount} onboarding`}
          gradient="from-indigo-500 to-indigo-700"
          ring="ring-indigo-100"
          accent="bg-indigo-50 text-indigo-700"
          glow="group-hover:shadow-indigo-200/60"
          onClick={() => navigate("/dashboard/clinicians")}
        />
        <StatCard
          icon={Network}
          label="PCNs"
          value={val(pcnLoading, allPCNs.length)}
          sub={pcnLoading ? "" : `${activePCNs.length} active`}
          gradient="from-teal-500 to-emerald-600"
          ring="ring-teal-100"
          accent="bg-teal-50 text-teal-700"
          glow="group-hover:shadow-teal-200/60"
          onClick={() => navigate("/dashboard/super-admin/clients/pcn")}
        />
        <StatCard
          icon={Building2}
          label="Practices"
          value={val(practiceLoading, allPractices.length)}
          sub={practiceLoading ? "" : `${activePractices.length} active`}
          gradient="from-purple-500 to-fuchsia-600"
          ring="ring-purple-100"
          accent="bg-purple-50 text-purple-700"
          glow="group-hover:shadow-purple-200/60"
          onClick={() => navigate("/dashboard/super-admin/clients/practice")}
        />
        <StatCard
          icon={CalendarDays}
          label="Restricted"
          value={val(cliniciansLoading, restrictedCount)}
          sub="Clinicians flagged"
          gradient={restrictedCount > 0 ? "from-rose-500 to-red-700" : "from-slate-400 to-slate-600"}
          ring={restrictedCount > 0 ? "ring-rose-100" : "ring-slate-100"}
          accent={restrictedCount > 0 ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-500"}
          glow={restrictedCount > 0 ? "group-hover:shadow-rose-200/60" : ""}
          alert={restrictedCount > 0}
          onClick={() => navigate("/dashboard/clinicians/restricted")}
        />
      </div>

      {/* ── Stat Cards Row 2 — Alerts ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={AlertTriangle}
          label="Rota Gaps (14d)"
          value={gaps.length}
          sub={urgentGaps.length > 0 ? `${urgentGaps.length} urgent · ${criticalGaps.length} critical` : "No urgent gaps"}
          gradient={urgentGaps.length > 0 ? "from-red-500 to-rose-700" : "from-emerald-500 to-emerald-700"}
          ring={urgentGaps.length > 0 ? "ring-red-100" : "ring-emerald-100"}
          accent={urgentGaps.length > 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}
          glow={urgentGaps.length > 0 ? "group-hover:shadow-red-200/60" : "group-hover:shadow-emerald-200/60"}
          alert={urgentGaps.length > 0}
          onClick={() => navigate("/dashboard/rota-gaps")}
        />
        <StatCard
          icon={FileText}
          label="Pending Timesheets"
          value={val(tsLoading, pendingTs.length)}
          sub="Awaiting approval"
          gradient="from-amber-400 to-orange-500"
          ring="ring-amber-100"
          accent="bg-amber-50 text-amber-700"
          glow="group-hover:shadow-amber-200/60"
          alert={pendingTs.length > 5}
          onClick={() => navigate("/dashboard/super-admin/timesheets")}
        />
        <StatCard
          icon={Stethoscope}
          label="Compliance Expiring"
          value={val(expiryLoading, expiringDocs.length)}
          sub={critical7.length > 0 ? `${critical7.length} expire within 7 days` : "30-day window"}
          gradient={critical7.length > 0 ? "from-red-500 to-rose-700" : "from-amber-400 to-orange-500"}
          ring={critical7.length > 0 ? "ring-red-100" : "ring-amber-100"}
          accent={critical7.length > 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}
          glow={critical7.length > 0 ? "group-hover:shadow-red-200/60" : "group-hover:shadow-amber-200/60"}
          alert={critical7.length > 0}
          onClick={() => navigate("/dashboard/clinicians?tab=compliance")}
        />
        <StatCard
          icon={UserPlus}
          label="Onboarding"
          value={val(cliniciansLoading, onboardingCount)}
          sub="New starters in progress"
          gradient="from-blue-500 to-blue-700"
          ring="ring-blue-100"
          accent="bg-blue-50 text-blue-700"
          glow="group-hover:shadow-blue-200/60"
          onClick={() => navigate("/dashboard/clinicians?status=onboarding")}
        />
      </div>

      {/* ── Urgent Gap Alert ─────────────────────────────────────────────── */}
      {urgentGaps.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl shrink-0">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-800">
                {urgentGaps.length} urgent gap{urgentGaps.length > 1 ? "s" : ""} — cover needed within 48 hours
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                {criticalGaps.length} critical (within 24h)
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/dashboard/rota-gaps")}
            className="shrink-0 text-xs font-bold text-red-700 border border-red-300 bg-white px-4 py-2 rounded-xl hover:bg-red-50 transition-colors w-full sm:w-auto text-center"
          >
            Manage Gaps →
          </button>
        </div>
      )}

      {/* ── Compliance Alert ─────────────────────────────────────────────── */}
      {critical7.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl shrink-0">
              <Stethoscope size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-800">
                {critical7.length} compliance document{critical7.length > 1 ? "s" : ""} expiring within 7 days
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                {expiringDocs.length} total expiring in 30 days
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/dashboard/clinicians?tab=compliance")}
            className="shrink-0 text-xs font-bold text-amber-700 border border-amber-300 bg-white px-4 py-2 rounded-xl hover:bg-amber-50 transition-colors w-full sm:w-auto text-center"
          >
            View Compliance →
          </button>
        </div>
      )}

      {/* ── Two-col: Timesheets + Compliance ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

        {/* Pending Timesheets */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <SectionHeader
            icon={FileText}
            title="Pending Timesheets"
            count={tsLoading ? "—" : pendingTs.length}
            countColor="bg-amber-50 text-amber-700"
            onViewAll={() => navigate("/dashboard/super-admin/timesheets")}
          />
          {tsLoading ? (
            <SkeletonRows />
          ) : pendingTs.length === 0 ? (
            <EmptyState message="No pending timesheets" />
          ) : (
            <>
              <div className="divide-y divide-slate-50">
                {pendingTs.slice(0, 5).map((ts) => (
                  <div
                    key={ts.id || ts._id}
                    className="flex items-center justify-between px-4 sm:px-6 py-3 hover:bg-slate-50 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs shrink-0">
                        {(ts.clinician_name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {ts.clinician_name || "Unknown"}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {ts.month && ts.year
                            ? new Date(ts.year, ts.month - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
                            : "—"}
                          {ts.submitted_at && (
                            <span className="hidden sm:inline">
                              {` · ${new Date(ts.submitted_at).toLocaleDateString("en-GB")}`}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <TsBadge status={ts.status} />
                      <button
                        onClick={() => navigate(`/dashboard/super-admin/timesheets/${ts.id || ts._id}`)}
                        className="h-7 px-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold hover:bg-blue-100 transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 sm:px-6 py-3 border-t border-slate-50 flex justify-between items-center">
                <p className="text-[11px] text-slate-400">{pendingTs.length} pending</p>
                <button onClick={() => navigate("/dashboard/super-admin/timesheets")} className="text-xs font-bold text-blue-600 hover:text-blue-700">
                  Manage all →
                </button>
              </div>
            </>
          )}
        </div>

        {/* Compliance Expiring */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <SectionHeader
            icon={Stethoscope}
            title="Compliance Expiring (30d)"
            count={expiryLoading ? "—" : expiringDocs.length}
            countColor={critical7.length > 0 ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}
            onViewAll={() => navigate("/dashboard/clinicians?tab=compliance")}
          />
          {expiryLoading ? (
            <SkeletonRows />
          ) : expiringDocs.length === 0 ? (
            <EmptyState icon={CheckCircle2} message="No documents expiring in 30 days" />
          ) : (
            <>
              <div className="divide-y divide-slate-50">
                {expiringDocs.slice(0, 5).map((doc, i) => {
                  const days = doc.days_until_expiry ?? 999;
                  const rag  = days <= 7 ? "red" : days <= 14 ? "amber" : "green";
                  const name = doc.clinician_name || doc.clinician?.full_name || "Unknown";
                  const type = doc.document_type  || doc.doc_type || doc.type || "Document";
                  const exp  = doc.expiry_date     || doc.expiryDate;
                  return (
                    <div
                      key={doc._id || i}
                      onClick={() => navigate(`/dashboard/clinicians/${doc.clinician_id || doc.clinician?._id}`)}
                      className="flex items-center justify-between px-4 sm:px-6 py-3 hover:bg-slate-50 transition-colors gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 font-black text-xs shrink-0">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {type}
                            {exp    && ` · expires ${new Date(exp).toLocaleDateString("en-GB")}`}
                            {days < 999 && ` · ${days}d left`}
                          </p>
                        </div>
                      </div>
                      <RAGBadge status={rag} />
                    </div>
                  );
                })}
              </div>
              <div className="px-4 sm:px-6 py-3 border-t border-slate-50 flex justify-between items-center">
                <p className="text-[11px] text-slate-400">{expiringDocs.length} documents expiring</p>
                <button onClick={() => navigate("/dashboard/clinicians?tab=compliance")} className="text-xs font-bold text-blue-600 hover:text-blue-700">
                  View all →
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Rota Gaps Preview ────────────────────────────────────────────── */}
      {gaps.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <SectionHeader
            icon={AlertTriangle}
            title="Rota Gaps"
            count={gaps.length}
            countColor={urgentGaps.length > 0 ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}
            onViewAll={() => navigate("/dashboard/rota-gaps")}
          />
          <div className="divide-y divide-slate-50">
            {gaps.slice(0, 4).map((gap, i) => {
              const isUrgent = gap.urgency === "urgent" || gap.urgency === "critical";
              return (
                <div key={gap._id || gap.id || i} className="flex items-center justify-between px-4 sm:px-6 py-3 hover:bg-slate-50 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUrgent ? "bg-red-50" : "bg-amber-50"}`}>
                      <Building2 size={14} className={isUrgent ? "text-red-500" : "text-amber-500"} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {gap.practice_name || gap.client_name || "Unknown Practice"}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {gap.date
                          ? new Date(gap.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
                          : "—"}
                        {gap.shift_type && ` · ${gap.shift_type}`}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border
                    ${gap.urgency === "critical" ? "bg-rose-50 text-rose-700 border-rose-200"
                      : gap.urgency === "urgent"  ? "bg-orange-50 text-orange-700 border-orange-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                    {gap.urgency || "gap"}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="px-4 sm:px-6 py-3 border-t border-slate-50 flex justify-between items-center">
            <p className="text-[11px] text-slate-400">{gaps.length} gaps in next 14 days</p>
            <button onClick={() => navigate("/dashboard/rota-gaps")} className="text-xs font-bold text-blue-600 hover:text-blue-700">
              Manage all →
            </button>
          </div>
        </div>
      )}

    </div>
  );
}