import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, AlertTriangle, FileText, CalendarDays,
  ArrowUpRight, ChevronUp, ChevronDown,
  XCircle, CheckCircle2,
} from "lucide-react";
import { useClinicians } from "../../hooks/useClinicians";
import { usePendingTimesheets, useRotaGaps } from "../../hooks/useRota";

/* ─── Stat Card ────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, colorClass, trend, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`group bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm transition-all duration-200 relative overflow-hidden ${onClick ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]" : ""}`}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className={`p-2.5 sm:p-3 rounded-2xl ${colorClass}`}>
          <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
          <ArrowUpRight size={10} /> LIVE
        </div>
      </div>
      <div className="mt-3 sm:mt-4 relative z-10">
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
        <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider leading-tight">{label}</p>
        {sub && <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">{sub}</p>}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-[10px] font-bold ${trend >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
            {trend >= 0 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {Math.abs(trend)}% vs last month
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Timesheet Badge ──────────────────────────────────── */
function TsBadge({ status }) {
  const map = {
    draft:     "bg-slate-100 text-slate-500",
    submitted: "bg-amber-50 text-amber-700",
    approved:  "bg-emerald-50 text-emerald-700",
    rejected:  "bg-rose-50 text-rose-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${map[status] || map.draft}`}>
      {status || "draft"}
    </span>
  );
}

/* ─── Main ─────────────────────────────────────────────── */
export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  const now       = new Date();
  const monthLabel = now.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const { data: cliniciansData, isLoading: cliniciansLoading } = useClinicians({});
  const { data: pendingData,    isLoading: tsLoading }         = usePendingTimesheets();
  const { data: gapsData }                                     = useRotaGaps();

  const allClinicians  = useMemo(() => cliniciansData?.clinicians || [], [cliniciansData]);
  const pendingTs      = useMemo(() => pendingData || [], [pendingData]);
  const gaps           = useMemo(() => gapsData?.gaps || [], [gapsData]);
  const urgentGaps     = gaps.filter((g) => g.urgency === "urgent" || g.urgency === "critical");

  const activeClinicians = allClinicians.filter((c) => !c.restricted && !c.isRestricted);
  const restrictedCount  = allClinicians.filter((c) => c.restricted || c.isRestricted).length;

  return (
    <div className="space-y-5 sm:space-y-8 pb-12 px-3 sm:px-0">

      {/* ── Header ─────────────────────────────────────────── */}
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

      {/* ── Stat Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Users} label="Total Clinicians" value={cliniciansLoading ? "—" : allClinicians.length}
          sub={cliniciansLoading ? "" : `${activeClinicians.length} active`}
          colorClass="bg-indigo-50 text-indigo-600"
          onClick={() => navigate("/dashboard/clinicians")}
        />
        <StatCard
          icon={AlertTriangle} label="Rota Gaps (14d)" value={gaps.length}
          sub={urgentGaps.length > 0 ? `${urgentGaps.length} urgent` : "All clear"}
          colorClass={gaps.length > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}
          onClick={() => navigate("/dashboard/rota-gaps")}
        />
        <StatCard
          icon={FileText} label="Pending Timesheets" value={tsLoading ? "—" : pendingTs.length}
          sub="Awaiting approval"
          colorClass="bg-amber-50 text-amber-600"
          onClick={() => navigate("/dashboard/super-admin/timesheets")}
        />
        <StatCard
          icon={CalendarDays} label="Restricted" value={cliniciansLoading ? "—" : restrictedCount}
          sub="Clinicians flagged"
          colorClass={restrictedCount > 0 ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-500"}
          onClick={() => navigate("/dashboard/clinicians/restricted")}
        />
      </div>

      {/* ── Gap Alert Banner ───────────────────────────────── */}
      {urgentGaps.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl shrink-0">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-800">
                {urgentGaps.length} urgent gap{urgentGaps.length > 1 ? "s" : ""} — need cover within 48 hours
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                {gaps.filter(g => g.urgency === "critical").length} critical (within 24h)
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/dashboard/rota-gaps")}
            className="shrink-0 text-xs font-bold text-red-700 border border-red-300 bg-white px-4 py-2 rounded-xl hover:bg-red-50 transition-colors w-full sm:w-auto text-center"
          >
            View Gaps →
          </button>
        </div>
      )}

      {/* ── Pending Timesheets ──────────────────────────────── */}
      {tsLoading ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : pendingTs.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-amber-500" />
              <h2 className="text-sm font-black text-slate-900">Pending Timesheets</h2>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black">
                {pendingTs.length}
              </span>
            </div>
            <button
              onClick={() => navigate("/dashboard/super-admin/timesheets")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 shrink-0"
            >
              View all →
            </button>
          </div>

          <div className="divide-y divide-slate-50">
            {pendingTs.slice(0, 5).map((ts) => (
              <div
                key={ts.id}
                className="flex items-center justify-between px-4 sm:px-6 py-3 hover:bg-slate-50 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                    {(ts.clinician_name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {ts.clinician_name || "Unknown"}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {new Date(ts.year, ts.month - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                      {ts.submitted_at && (
                        <span className="hidden sm:inline">
                          {` · Submitted ${new Date(ts.submitted_at).toLocaleDateString("en-GB")}`}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <TsBadge status={ts.status} />
                  <button
                    onClick={() => navigate(`/dashboard/super-admin/timesheets/${ts.id}`)}
                    className="h-7 px-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold hover:bg-blue-100 transition-colors"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 sm:px-6 py-3 border-t border-slate-50 flex items-center justify-between">
            <p className="text-[11px] text-slate-400">{pendingTs.length} timesheets pending</p>
            <button
              onClick={() => navigate("/dashboard/super-admin/timesheets")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              Manage all →
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-8 text-center">
          <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-400" />
          <p className="text-sm text-slate-400">No pending timesheets</p>
        </div>
      )}

    </div>
  );
}