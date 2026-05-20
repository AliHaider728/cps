import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, CalendarCheck, Clock, AlertTriangle,
  TrendingUp, Search, ArrowUpRight,
  Activity, ChevronUp, ChevronDown, Eye,
  Stethoscope, CalendarDays, FileText,
  CheckCircle2, XCircle, Timer,
} from "lucide-react";
import { useClinicians } from "../../hooks/useClinicians";
import { usePendingTimesheets, useRotaGaps } from "../../hooks/useRota";

/* ─── Status Pill ──────────────────────────────────────── */
function RotaStatusPill({ shift }) {
  if (!shift) return (
    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
      No shift
    </span>
  );
  const map = {
    working:      "bg-emerald-50 text-emerald-700 border-emerald-100",
    annual_leave: "bg-sky-50 text-sky-700 border-sky-100",
    sick:         "bg-rose-50 text-rose-700 border-rose-100",
    cppe_training:"bg-violet-50 text-violet-700 border-violet-100",
    cover:        "bg-amber-50 text-amber-700 border-amber-100",
    gap:          "bg-red-50 text-red-700 border-red-100",
  };
  const labels = {
    working: "Working", annual_leave: "On Leave",
    sick: "Sick", cppe_training: "Training",
    cover: "Cover", gap: "Gap",
  };
  const cls = map[shift.shift_type || shift.status] || "bg-slate-50 text-slate-500 border-slate-200";
  const label = labels[shift.shift_type || shift.status] || (shift.shift_type || shift.status || "—");
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}

/* ─── Stat Card ────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, colorClass, trend, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`group bg-white rounded-2xl border border-slate-100 p-5 shadow-sm transition-all duration-200 relative overflow-hidden ${onClick ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md" : ""}`}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className={`p-3 rounded-2xl ${colorClass}`}>
          <Icon size={18} />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
          <ArrowUpRight size={11} /> LIVE
        </div>
      </div>
      <div className="mt-4 relative z-10">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
        <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{label}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
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
  const [search, setSearch] = useState("");

  const now   = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();
  const monthLabel = now.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  // Data hooks
  const { data: cliniciansData, isLoading: cliniciansLoading } = useClinicians({});
  const { data: pendingData,    isLoading: tsLoading }         = usePendingTimesheets();
  const { data: gapsData }                                     = useRotaGaps();

  const allClinicians  = useMemo(() => cliniciansData?.clinicians || [], [cliniciansData]);
  const pendingTs      = useMemo(() => pendingData || [], [pendingData]);
  const gaps           = useMemo(() => gapsData?.gaps || [], [gapsData]);
  const urgentGaps     = gaps.filter((g) => g.urgency === "urgent" || g.urgency === "critical");

  const filtered = useMemo(() => {
    if (!search) return allClinicians;
    const q = search.toLowerCase();
    return allClinicians.filter((c) =>
      (c.fullName || c.name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q)
    );
  }, [allClinicians, search]);

  const activeClinicians    = allClinicians.filter((c) => !c.restricted && !c.isRestricted);
  const restrictedCount     = allClinicians.filter((c) => c.restricted || c.isRestricted).length;

  return (
    <div className="space-y-8 pb-12">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Overview</h1>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users} label="Total Clinicians" value={allClinicians.length}
          sub={`${activeClinicians.length} active`}
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
          icon={FileText} label="Pending Timesheets" value={pendingTs.length}
          sub="Awaiting approval"
          colorClass="bg-amber-50 text-amber-600"
          onClick={() => navigate("/dashboard/super-admin/timesheets")}
        />
        <StatCard
          icon={CalendarDays} label="Restricted" value={restrictedCount}
          sub="Clinicians flagged"
          colorClass={restrictedCount > 0 ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-500"}
          onClick={() => navigate("/dashboard/clinicians/restricted")}
        />
      </div>

      {/* ── Gap Alert Banner (only if urgent gaps exist) ──── */}
      {urgentGaps.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl">
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
            className="shrink-0 text-xs font-bold text-red-700 border border-red-300 bg-white px-4 py-2 rounded-xl hover:bg-red-50 transition-colors"
          >
            View Gaps →
          </button>
        </div>
      )}

      {/* ── Pending Timesheets ──────────────────────────────── */}
      {pendingTs.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-amber-500" />
              <h2 className="text-sm font-black text-slate-900">Pending Timesheets</h2>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black">{pendingTs.length}</span>
            </div>
            <button
              onClick={() => navigate("/dashboard/super-admin/timesheets")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              View all →
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {pendingTs.slice(0, 5).map((ts) => (
              <div key={ts.id} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                    {(ts.clinician_name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{ts.clinician_name || "Unknown"}</p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(ts.year, ts.month - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                      {ts.submitted_at && ` · Submitted ${new Date(ts.submitted_at).toLocaleDateString("en-GB")}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
        </div>
      )}

      {/* ── Clinician List ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-800">Clinicians</h2>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black">
              {filtered.length}
            </span>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clinician…"
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 w-48 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/60 text-[10px] text-slate-400 uppercase tracking-widest font-black">
                <th className="text-left px-6 py-3">Clinician</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Contract</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {cliniciansLoading
                ? [...Array(4)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-3">
                        <div className="h-9 bg-slate-50 rounded-xl animate-pulse" />
                      </td>
                    </tr>
                  ))
                : filtered.map((c) => {
                    const id       = c._id || c.id;
                    const name     = c.fullName || c.name || "Unknown";
                    const email    = c.email || "";
                    const type     = c.clinicianType || "—";
                    const contract = c.contractType || "—";
                    const isRestricted = c.restricted || c.isRestricted;

                    const typeColors = {
                      Pharmacist: "bg-purple-50 text-purple-700",
                      Technician: "bg-amber-50 text-amber-700",
                      IP:         "bg-teal-50 text-teal-700",
                    };
                    const contractColors = {
                      ARRS:   "bg-blue-50 text-blue-700",
                      EA:     "bg-green-50 text-green-700",
                      Direct: "bg-orange-50 text-orange-700",
                      Mixed:  "bg-pink-50 text-pink-700",
                    };

                    return (
                      <tr key={id} className="group hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center shrink-0">
                              <Stethoscope size={13} className="text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${typeColors[type] || "bg-slate-50 text-slate-500"}`}>
                            {type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${contractColors[contract] || "text-slate-500"}`}>
                            {contract}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isRestricted ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-red-50 text-red-700 border-red-200">
                              <XCircle size={9} /> Restricted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                              <CheckCircle2 size={9} /> Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => navigate(`/dashboard/clinicians/${id}`)}
                            className="h-7 px-2.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-[11px] font-bold hover:bg-blue-100 inline-flex items-center gap-1 transition-colors"
                          >
                            <Eye size={11} /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {!cliniciansLoading && filtered.length === 0 && (
          <div className="py-16 text-center">
            <Users size={28} className="mx-auto mb-2 text-slate-200" />
            <p className="text-slate-400 text-sm">
              {search ? `No clinicians match "${search}"` : "No clinicians found."}
            </p>
          </div>
        )}

        <div className="px-6 py-3 border-t border-slate-50 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">{allClinicians.length} clinicians total</p>
          <button
            onClick={() => navigate("/dashboard/clinicians")}
            className="text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            Manage all →
          </button>
        </div>
      </div>

    </div>
  );
}