import { useState, useMemo } from "react";
import {
  Users,
  CalendarCheck,
  Clock,
  AlertTriangle,
  Timer,
  TrendingUp,
  Search,
  Filter,
  ArrowUpRight,
  MoreHorizontal,
  LogIn,
  Activity,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useTimeEntryAdminSummary } from "../../hooks/useTimeEntry";

/* ── Shift Status Badge ─────────────────────────────────────── */
function ShiftStatusPill({ c }) {
  // shiftStatus comes from enhanced backend; fallback to currentlyClockedIn
  const status = c.shiftStatus || (c.currentlyClockedIn ? "clocked_in" : "offline");

  if (!c.isActive)
    return (
      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
        Inactive
      </span>
    );

  if (status === "clocked_in")
    return (
      <div
        title={c.clockInTime ? `Since ${new Date(c.clockInTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}` : "Currently clocked in"}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase tracking-widest cursor-default"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        On Shift
      </div>
    );

  if (status === "scheduled")
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-black uppercase tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
        Scheduled
      </div>
    );

  if (status === "annual_leave")
    return (
      <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100 text-[10px] font-black uppercase tracking-widest">
        On Leave
      </span>
    );

  if (status === "sick")
    return (
      <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-black uppercase tracking-widest">
        Sick
      </span>
    );

  if (status === "cppe")
    return (
      <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-black uppercase tracking-widest">
        Training
      </span>
    );

  return (
    <span className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest">
      Offline
    </span>
  );
}

/* ── Stat Card ──────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, colorClass, trend }) {
  return (
    <div className="group bg-white rounded-[1.5rem] border border-slate-100 p-5 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
      <div className={`absolute -right-6 -top-6 w-20 h-20 rounded-full opacity-[0.04] group-hover:scale-150 group-hover:opacity-[0.07] transition-all duration-500 ${colorClass.split(" ")[1] || ""}`} />
      <div className="flex items-start justify-between relative z-10">
        <div className={`p-3 rounded-2xl ${colorClass}`}>
          <Icon size={20} />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
          <ArrowUpRight size={11} />
          LIVE
        </div>
      </div>
      <div className="mt-4 relative z-10">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
        <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{label}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{sub}</p>}
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

/* ── Hours Progress Cell ────────────────────────────────────── */
function HoursCell({ actual, planned, shifts }) {
  const pct = planned > 0 ? Math.min((actual / planned) * 100, 100) : 0;
  const barColor =
    pct >= 90 ? "bg-emerald-500" :
    pct >= 50 ? "bg-indigo-500" :
    pct >  0  ? "bg-amber-400"  :
                "bg-slate-200";

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-black text-slate-800">{actual}h</span>
        <span className="text-[10px] text-slate-400 font-medium">/ {planned}h planned</span>
      </div>
      <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${Math.max(pct, 0)}%` }}
        />
      </div>
      <span className="text-[10px] text-slate-400 font-medium">
        {shifts} shift{shifts !== 1 ? "s" : ""} · {pct.toFixed(0)}%
      </span>
    </div>
  );
}

/* ── Main Dashboard ─────────────────────────────────────────── */
export default function SuperAdminDashboard() {
  const { data: summary, isLoading } = useTimeEntryAdminSummary();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name"); // "name" | "hours" | "status"

  const totals    = summary?.totals     || {};
  const rawClinicians = summary?.clinicians || [];
  const month     = summary?.month      || "";

  /* filter + sort */
  const clinicians = useMemo(() => {
    let list = rawClinicians.filter((c) =>
      (c.fullName || "").toLowerCase().includes(search.toLowerCase())
    );
    if (sortBy === "hours")
      list = [...list].sort((a, b) => b.actualHoursMonth - a.actualHoursMonth);
    else if (sortBy === "status")
      list = [...list].sort((a, b) => {
        const order = { clocked_in: 0, scheduled: 1, annual_leave: 2, sick: 3, offline: 4 };
        return (order[a.shiftStatus || (a.currentlyClockedIn ? "clocked_in" : "offline")] ?? 5) -
               (order[b.shiftStatus || (b.currentlyClockedIn ? "clocked_in" : "offline")] ?? 5);
      });
    else
      list = [...list].sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));
    return list;
  }, [rawClinicians, search, sortBy]);

  const activeCount = clinicians.filter(
    (c) => (c.shiftStatus === "clocked_in" || c.currentlyClockedIn)
  ).length;

  return (
    <div className="max-w-7xl mx-auto min-h-screen pb-12 antialiased">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              Live · <span className="text-slate-700">{month || "Loading…"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter size={15} />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all">
            Export Report
          </button>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-50 rounded-[1.5rem] animate-pulse" />
          ))
        ) : (
          <>
            <StatCard icon={Users}         label="Clinicians"   value={totals.clinicians ?? 0}               sub="Registered Staff"   colorClass="bg-indigo-50 text-indigo-600" />
            <StatCard icon={CalendarCheck} label="Shifts"       value={totals.shiftsThisMonth ?? 0}          sub="This Month"          colorClass="bg-emerald-50 text-emerald-600" />
            <StatCard icon={Clock}         label="Planned"      value={`${totals.plannedHours ?? 0}h`}       sub="Budgeted Hours"      colorClass="bg-slate-100 text-slate-600" />
            <StatCard icon={TrendingUp}    label="Actual"       value={`${totals.actualHours ?? 0}h`}        sub="Hours Logged"        colorClass="bg-blue-50 text-blue-600" />
            <StatCard icon={Timer}         label="On Shift"     value={activeCount}                          sub="Clocked In Now"      colorClass="bg-rose-50 text-rose-600" />
            <StatCard icon={AlertTriangle} label="Leave Reqs"   value={totals.pendingLeave ?? 0}             sub="Pending Approval"    colorClass="bg-amber-50 text-amber-600" />
          </>
        )}
      </div>

      {/* ── Hours Utilisation bar ────────────────────────────── */}
      {!isLoading && totals.plannedHours > 0 && (
        <div className="mb-8 bg-white rounded-2xl border border-slate-100 px-6 py-4 flex items-center gap-6 shadow-sm">
          <div className="flex items-center gap-2 shrink-0">
            <Activity size={16} className="text-indigo-500" />
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Workforce Utilisation
            </span>
          </div>
          <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(((totals.actualHours || 0) / totals.plannedHours) * 100, 100)}%` }}
            />
          </div>
          <span className="text-xs font-black text-slate-700 shrink-0">
            {totals.actualHours ?? 0}h / {totals.plannedHours}h &nbsp;
            <span className="text-slate-400 font-medium">
              ({Math.round(((totals.actualHours || 0) / totals.plannedHours) * 100)}%)
            </span>
          </span>
        </div>
      )}

      {/* ── Clinician Table ──────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-8 py-5 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-slate-800">Clinician Activity</h2>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase">
              {clinicians.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1">
              {[["name", "Name"], ["hours", "Hours"], ["status", "Status"]].map(([val, lbl]) => (
                <button
                  key={val}
                  onClick={() => setSortBy(val)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                    sortBy === val ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={15} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clinician…"
                className="pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 w-52 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/60 text-[10px] text-slate-400 uppercase tracking-[0.18em] font-black">
                <th className="text-left px-8 py-4">Staff Member</th>
                <th className="text-left px-4 py-4">Type</th>
                <th className="text-left px-4 py-4">Contract</th>
                <th className="text-right px-4 py-4">Monthly Hours</th>
                <th className="text-center px-4 py-4">Today</th>
                <th className="px-8 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-8 py-4">
                        <div className="h-10 bg-slate-50 rounded-xl animate-pulse" />
                      </td>
                    </tr>
                  ))
                : clinicians.map((c) => {
                    const actual  = Number(c.actualHoursMonth  || 0);
                    const planned = Number(c.plannedHoursMonth || 0);
                    const shifts  = Number(c.shiftsThisMonth   || 0);
                    const initials = (c.fullName || "??")
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    return (
                      <tr
                        key={c.clinicianId}
                        className="group hover:bg-slate-50/70 transition-all duration-150"
                      >
                        {/* Name */}
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-slate-100 flex items-center justify-center text-indigo-600 font-black text-xs shadow-sm shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 leading-tight">
                                {c.fullName || "Unnamed"}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium">
                                #{String(c.clinicianId).slice(-6)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-4">
                          <span className="text-xs font-semibold text-slate-500">
                            {c.clinicianType || "—"}
                          </span>
                        </td>

                        {/* Contract */}
                        <td className="px-4 py-4">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg">
                            {c.contractType || "General"}
                          </span>
                        </td>

                        {/* Hours progress */}
                        <td className="px-4 py-4">
                          <HoursCell actual={actual} planned={planned} shifts={shifts} />
                        </td>

                        {/* Shift status */}
                        <td className="px-4 py-4">
                          <div className="flex justify-center">
                            <ShiftStatusPill c={c} />
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-8 py-4 text-right">
                          <button className="p-2 text-slate-200 hover:text-slate-500 transition-colors rounded-xl hover:bg-slate-100">
                            <MoreHorizontal size={17} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {!isLoading && clinicians.length === 0 && (
          <div className="py-20 text-center">
            <div className="inline-flex p-4 rounded-full bg-slate-50 text-slate-200 mb-4">
              <Users size={30} />
            </div>
            <p className="text-slate-400 font-medium text-sm">
              {search ? `No clinicians match "${search}"` : "No clinicians in the roster."}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-50 flex items-center justify-between">
          <p className="text-[11px] text-slate-400 font-medium">
            {activeCount > 0
              ? `${activeCount} clinician${activeCount !== 1 ? "s" : ""} currently on shift`
              : "No active shifts right now"}
          </p>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
            <LogIn size={12} className="text-emerald-500" />
            <span className="text-emerald-600">{activeCount} active</span>
            <span>·</span>
            <span>{clinicians.length - activeCount} offline</span>
          </div>
        </div>
      </div>
    </div>
  );
}