import { useState, useMemo, useEffect, useRef } from "react";
import { useClinicianRota, useRotaList } from "../../../hooks/useRota";
import { usePractices } from "../../../hooks/usePractice";
import { useTimeEntries, useActiveTimeEntry } from "../../../hooks/useTimeEntry";
import {
  Building2,
  Users,
  Calendar,
  Clock,
  Filter,
  Briefcase,
  Umbrella,
  Thermometer,
  BookOpen,
  UserPlus,
  AlertTriangle,
  XCircle,
  Loader2,
  FileText,
  Search,
  ChevronDown,
  X,
  Timer,
  Activity,
} from "lucide-react";

const STATUS_CONFIG = {
  working:      { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200", dot: "bg-emerald-500", label: "Working",      Icon: Briefcase     },
  annual_leave: { bg: "bg-blue-100",    text: "text-blue-800",    border: "border-blue-200",    dot: "bg-blue-500",    label: "Annual Leave", Icon: Umbrella      },
  sick:         { bg: "bg-red-100",     text: "text-red-800",     border: "border-red-200",     dot: "bg-red-500",     label: "Sick",         Icon: Thermometer   },
  cppe:         { bg: "bg-purple-100",  text: "text-purple-800",  border: "border-purple-200",  dot: "bg-purple-500",  label: "CPPE",         Icon: BookOpen      },
  cover:        { bg: "bg-amber-100",   text: "text-amber-800",   border: "border-amber-200",   dot: "bg-amber-500",   label: "Cover",        Icon: UserPlus      },
  gap:          { bg: "bg-orange-100",  text: "text-orange-800",  border: "border-orange-200",  dot: "bg-orange-500",  label: "Gap",          Icon: AlertTriangle },
  cancelled:    { bg: "bg-slate-100",   text: "text-slate-500",   border: "border-slate-200",   dot: "bg-slate-400",   label: "Cancelled",    Icon: XCircle       },
};

const getStatus = (s) =>
  STATUS_CONFIG[s] ?? { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", dot: "bg-gray-300", label: s ?? "??", Icon: AlertTriangle };

const ALL_STATUSES = ["all", ...Object.keys(STATUS_CONFIG)];

/* ── Live timer formatter ── */
const formatLiveDuration = (startIso) => {
  if (!startIso) return "00:00:00";
  const diffMs = Date.now() - new Date(startIso).getTime();
  const h = Math.floor(diffMs / 3_600_000);
  const m = Math.floor((diffMs % 3_600_000) / 60_000);
  const s = Math.floor((diffMs % 60_000) / 1_000);
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
};

const StatCard = ({ icon: Icon, iconBg, label, value, sub }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
      <Icon size={18} className="text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{label}</p>
      <p className="text-2xl font-extrabold text-slate-800 leading-none mt-0.5">{value ?? "—"}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

/* ══════════════════════════════════════════════
   ACTIVE SHIFT BANNER
   Sirf tab show hota hai jab koi clinician
   select ho aur uski active entry ho
══════════════════════════════════════════════ */
function ActiveShiftBanner({ selectedClinician }) {
  const { data: activeEntry } = useActiveTimeEntry();
  const { data: timeEntriesData } = useTimeEntries({ limit: 100 });
  const [liveDisplay, setLiveDisplay] = useState("00:00:00");
  const intervalRef = useRef(null);

  const entries = Array.isArray(timeEntriesData) ? timeEntriesData : [];

  /* Monthly clocked hours from completed entries */
  const now = new Date();
  const monthlyHours = useMemo(() => {
    return entries
      .filter((e) => {
        if (e.status !== "completed") return false;
        const d = new Date(e.clock_in);
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth()
        );
      })
      .reduce((sum, e) => sum + Number(e.actual_hours || 0), 0)
      .toFixed(1);
  }, [entries, now]);

  /* Active sessions this month */
  const sessionsThisMonth = entries.filter((e) => {
    if (e.status !== "completed") return false;
    const d = new Date(e.clock_in);
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth()
    );
  }).length;

  /* Live timer */
  useEffect(() => {
    if (activeEntry?.clock_in) {
      setLiveDisplay(formatLiveDuration(activeEntry.clock_in));
      intervalRef.current = setInterval(() => {
        setLiveDisplay(formatLiveDuration(activeEntry.clock_in));
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
      setLiveDisplay("00:00:00");
    }
    return () => clearInterval(intervalRef.current);
  }, [activeEntry?.clock_in]);

  /* Koi clinician select nahi — kuch mat dikhao */
  if (!selectedClinician) return null;

  /* Na active shift, na koi history — card mat dikhao */
  if (!activeEntry && monthlyHours === "0.0" && sessionsThisMonth === 0) return null;

  return (
    <div className={`rounded-2xl border overflow-hidden ${activeEntry ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
      <div className={`px-4 py-3 flex items-center justify-between border-b ${activeEntry ? "border-emerald-200 bg-emerald-100/60" : "border-slate-100 bg-slate-50"}`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${activeEntry ? "bg-emerald-600" : "bg-slate-400"}`}>
            <Timer size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">
              {activeEntry ? "Shift Currently In Progress" : "Shift Activity"}
            </p>
            <p className="text-xs text-slate-400">Live clock-in status</p>
          </div>
        </div>

        {activeEntry && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Live
          </span>
        )}
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Live Timer */}
        <div className={`rounded-xl border p-3 text-center ${activeEntry ? "border-emerald-200 bg-white" : "border-slate-200 bg-slate-50"}`}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            {activeEntry ? "Current Session" : "No Active Session"}
          </p>
          <p className={`font-mono text-2xl font-black tracking-tight tabular-nums ${activeEntry ? "text-slate-900" : "text-slate-300"}`}>
            {liveDisplay}
          </p>
          {activeEntry?.clock_in && (
            <p className="text-[11px] text-slate-400 mt-1">
              Started{" "}
              <span className="font-bold text-slate-600">
                {new Date(activeEntry.clock_in).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </p>
          )}
        </div>

        {/* Monthly Hours */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Activity size={11} className="text-blue-500" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">This Month</p>
          </div>
          <p className="text-2xl font-black text-slate-800">
            {monthlyHours}
            <span className="text-xs font-normal text-slate-400 ml-1">hrs</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{sessionsThisMonth} sessions</p>
        </div>

        {/* Status */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status</p>
          <p className={`text-sm font-black mt-1 ${activeEntry ? "text-emerald-600" : "text-slate-400"}`}>
            {activeEntry ? "Clocked In" : "Not Clocked In"}
          </p>
          {activeEntry?.planned_hours && (
            <p className="text-[11px] text-slate-400 mt-1">
              Planned: <span className="font-bold text-slate-600">{activeEntry.planned_hours}h</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function ClinicianDiaryView() {
  const [selectedClinician, setSelectedClinician] = useState("");
  const [searchQuery,       setSearchQuery]        = useState("");
  const [dropdownOpen,      setDropdownOpen]       = useState(false);
  const [month,             setMonth]              = useState(new Date().getMonth() + 1);
  const [year,              setYear]               = useState(new Date().getFullYear());
  const [statusFilter,      setStatusFilter]       = useState("all");
  const [practiceFilter,    setPracticeFilter]     = useState("");
  const dropdownRef = useRef(null);

  const { data: rotaData, isLoading: rotaLoading } = useRotaList({ month, year });

  const allClinicians = useMemo(() => {
    const rows = rotaData?.data?.clinicians ?? rotaData?.clinicians ?? [];
    return rows
      .filter((r) => {
        if (r?.status === "gap") return false;
        const name = (r?.clinician?.fullName ?? r?.clinician?.name ?? "").toLowerCase();
        if (name.startsWith("gap")) return false;
        if (!r?.clinician?.email && !r?.clinician?.fullName && !r?.clinician?.name) return false;
        return true;
      })
      .map((r) => r?.clinician)
      .filter(Boolean);
  }, [rotaData]);

  const filteredClinicians = useMemo(() =>
    allClinicians.filter((c) => {
      const name  = (c.fullName ?? c.name ?? "").toLowerCase();
      const email = (c.email ?? "").toLowerCase();
      const q     = searchQuery.toLowerCase();
      return !q || name.includes(q) || email.includes(q);
    }),
  [allClinicians, searchQuery]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data: rawDiaryData, isLoading: diaryLoading } = useClinicianRota(
    selectedClinician || null,
    month,
    year
  );

  const diaryPayload = rawDiaryData?.data ?? rawDiaryData ?? null;
  const clinician    = diaryPayload?.clinician ?? null;
  const shifts       = Array.isArray(diaryPayload?.shifts) ? diaryPayload.shifts : [];

  const { data: practicesRes } = usePractices();
  const practicesPayload = practicesRes?.data ?? practicesRes;
  const practices = Array.isArray(practicesPayload)
    ? practicesPayload
    : Array.isArray(practicesPayload?.data)
      ? practicesPayload.data
      : [];

  const practiceNameById = useMemo(() => {
    const map = new Map();
    practices.forEach((p) => {
      const id = String(p?._id ?? p?.id ?? "");
      if (!id) return;
      map.set(id, p?.name ?? id);
    });
    return map;
  }, [practices]);

  const monthInputValue = `${year}-${String(month).padStart(2, "0")}`;
  const handleMonthChange = (e) => {
    const [y, m] = e.target.value.split("-");
    if (y && m) { setYear(parseInt(y)); setMonth(parseInt(m)); }
  };

  const filteredShifts = useMemo(() =>
    shifts.filter((s) => {
      const statusOk   = statusFilter === "all" || s.status === statusFilter;
      const practiceOk = !practiceFilter || String(s.practice_id ?? "").toLowerCase().includes(practiceFilter.toLowerCase());
      return statusOk && practiceOk;
    }),
  [shifts, statusFilter, practiceFilter]);

  const shiftsByDate = useMemo(() => {
    const grouped = {};
    filteredShifts.forEach((s) => {
      const key = String(s.date ?? "").slice(0, 10);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(s);
    });
    return grouped;
  }, [filteredShifts]);

  const stats = useMemo(() => {
    let totalHours = 0;
    const byStatus = {};
    filteredShifts.forEach((s) => {
      byStatus[s.status] = (byStatus[s.status] ?? 0) + 1;
      if (s.hours) totalHours += parseFloat(s.hours);
    });
    return {
      total:      filteredShifts.length,
      totalHours: totalHours.toFixed(1),
      breakdown:  Object.entries(byStatus).map(([status, count]) => ({
        status, count,
        cfg: getStatus(status),
        pct: filteredShifts.length > 0 ? ((count / filteredShifts.length) * 100).toFixed(0) : 0,
      })),
    };
  }, [filteredShifts]);

  const selectClinician = (c) => {
    setSelectedClinician(c._id ?? c.id ?? "");
    setSearchQuery(c.fullName ?? c.name ?? "");
    setDropdownOpen(false);
  };

  const clearClinician = () => {
    setSelectedClinician("");
    setSearchQuery("");
    setDropdownOpen(false);
  };

  const isLoading = diaryLoading && !!selectedClinician;

  return (
    <div className="space-y-4">

      {/* ── Top stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}         iconBg="bg-blue-600"    label="Shifts"       value={stats.total}      sub="this month" />
        <StatCard icon={Clock}         iconBg="bg-emerald-600" label="Total Hours"  value={stats.totalHours} sub="hrs worked" />
        <StatCard icon={Briefcase}     iconBg="bg-violet-600"  label="Working Days" value={stats.breakdown.find(b => b.status === "working")?.count ?? 0}  sub="working" />
        <StatCard icon={AlertTriangle} iconBg="bg-orange-500"  label="Gaps / Sick"  value={(stats.breakdown.find(b => b.status === "gap")?.count ?? 0) + (stats.breakdown.find(b => b.status === "sick")?.count ?? 0)} sub="gaps + sick" />
      </div>

      {/* ── Active Shift Banner — sirf tab show ho jab clinician select ho ── */}
      <ActiveShiftBanner selectedClinician={selectedClinician} />

      {/* ── Main diary card ── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <Calendar size={17} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Clinician Diary</p>
              <p className="text-xs text-slate-400 mt-0.5">Full diary: shifts, dates, locations, clients</p>
            </div>
          </div>
          {stats.total > 0 && (
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
              {stats.total} shifts · {stats.totalHours}h
            </span>
          )}
        </div>

        {/* ── Filters ── */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">

            {/* Clinician search dropdown */}
            <div className="flex-1 min-w-[220px]" ref={dropdownRef}>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Clinician <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="relative">
                  {isLoading || rotaLoading
                    ? <Loader2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin pointer-events-none" />
                    : <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  }
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setDropdownOpen(true);
                      if (!e.target.value) setSelectedClinician("");
                    }}
                    onFocus={() => setDropdownOpen(true)}
                    placeholder={rotaLoading ? "Loading clinicians…" : "Search clinician name or email…"}
                    className="w-full h-10 pl-9 pr-9 rounded-xl border border-slate-200 bg-white text-sm text-slate-800
                      focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button type="button" onClick={clearClinician}
                      className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      <X size={13} />
                    </button>
                  )}
                  <button type="button" onClick={() => setDropdownOpen((p) => !p)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                </div>

                {dropdownOpen && (
                  <div className="absolute z-30 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                    <div className="max-h-56 overflow-y-auto">
                      {rotaLoading ? (
                        <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-400">
                          <Loader2 size={15} className="animate-spin text-blue-500" />
                          Loading clinicians…
                        </div>
                      ) : filteredClinicians.length === 0 ? (
                        <div className="py-6 text-center text-sm text-slate-400">
                          {searchQuery ? "No clinicians match your search" : "No clinicians found for this month"}
                        </div>
                      ) : (
                        filteredClinicians.map((c) => {
                          const id       = c._id ?? c.id ?? "";
                          const name     = c.fullName ?? c.name ?? "Unknown";
                          const email    = c.email ?? "";
                          const isActive = selectedClinician === id;
                          const rows     = rotaData?.data?.clinicians ?? rotaData?.clinicians ?? [];
                          const row      = rows.find((r) => (r?.clinician?._id ?? r?.clinician?.id) === id);
                          const shiftCnt = row?.shifts ? Object.keys(row.shifts).length : 0;

                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => selectClinician(c)}
                              className={[
                                "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                                "hover:bg-blue-50 border-b border-slate-50 last:border-0",
                                isActive ? "bg-blue-50" : "",
                              ].join(" ")}
                            >
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-sm ${isActive ? "bg-blue-600" : "bg-slate-400"}`}>
                                {name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold truncate ${isActive ? "text-blue-800" : "text-slate-800"}`}>{name}</p>
                                {email && <p className="text-xs text-slate-400 truncate">{email}</p>}
                              </div>
                              {shiftCnt > 0 && (
                                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                                  {shiftCnt}
                                </span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Practice filter */}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Practice</label>
              <div className="relative">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={practiceFilter}
                  onChange={(e) => setPracticeFilter(e.target.value)}
                  placeholder="Filter by practice…"
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800
                    focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Month picker */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Month / Year</label>
              <input
                type="month"
                value={monthInputValue}
                onChange={handleMonthChange}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800
                  focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Status filter pills */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Status</label>
            <div className="flex items-center gap-1 overflow-x-auto pb-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm scrollbar-hide">
              {ALL_STATUSES.map((s) => {
                const cfg    = s === "all" ? null : getStatus(s);
                const active = statusFilter === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={[
                      "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0 active:scale-95",
                      active ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
                    ].join(" ")}
                  >
                    {cfg && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />}
                    {s === "all" ? "All" : cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Selected clinician info bar ── */}
        {clinician && (
          <div className="px-5 py-3.5 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md shrink-0">
              <span className="text-white text-sm font-bold">
                {(clinician.fullName ?? clinician.name ?? "?").charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-blue-900 truncate">{clinician.fullName ?? clinician.name}</p>
              <p className="text-xs text-blue-600 truncate">{clinician.email ?? "No email"}</p>
            </div>
            <span className="shrink-0 text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
              {filteredShifts.length} shifts
            </span>
          </div>
        )}

        {/* ── Status breakdown chips ── */}
        {stats.breakdown.length > 0 && (
          <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap gap-2">
            {stats.breakdown.map(({ status, count, cfg, pct }) => {
              const { Icon } = cfg;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
                  className={[
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:scale-105 active:scale-95",
                    statusFilter === status ? "ring-2 ring-offset-1 ring-slate-400" : "",
                    cfg.bg, cfg.text, cfg.border,
                  ].join(" ")}
                >
                  <Icon size={11} />
                  {cfg.label} · {count} <span className="opacity-60">({pct}%)</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Diary content ── */}
        <div className="px-5 py-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 size={22} className="animate-spin text-blue-500" />
              <p className="text-sm text-slate-400 font-medium">Loading diary…</p>
            </div>
          ) : Object.keys(shiftsByDate).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Calendar size={40} className="text-slate-200" />
              <p className="text-slate-500 font-semibold text-sm">
                {selectedClinician ? "No shifts found" : "Select a clinician to view their diary"}
              </p>
              <p className="text-slate-400 text-xs">
                {selectedClinician ? "Try adjusting filters or date range" : "Search and select a clinician above"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(shiftsByDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, dayShifts]) => (
                <div key={date} className="rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-500" />
                      <p className="text-sm font-bold text-slate-800">
                        {new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
                          weekday: "long", day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">
                      {dayShifts.length} shift{dayShifts.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {dayShifts.map((shift) => {
                      const cfg = getStatus(shift.status);
                      const { Icon } = cfg;
                      return (
                        <div key={shift.id ?? shift._id ?? Math.random()} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${cfg.bg} ${cfg.border}`}>
                              <Icon size={16} className={cfg.text} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <div>
                                  <p className="text-sm font-bold text-slate-800">{cfg.label}</p>
                                  {(shift.start_time || shift.end_time) && (
                                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                      <Clock size={10} />
                                      {shift.start_time} – {shift.end_time}
                                    </p>
                                  )}
                                </div>
                                {shift.hours && (
                                  <span className="text-sm font-extrabold text-slate-700 shrink-0">
                                    {shift.hours}h
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-x-4 gap-y-1">
                                {shift.practice_id && (
                                  <span className="flex items-center gap-1 text-xs text-slate-500">
                                    <Building2 size={11} className="text-slate-400" />
                                    <span className="font-medium">
                                      {practiceNameById.get(String(shift.practice_id)) ?? String(shift.practice_id)}
                                    </span>
                                  </span>
                                )}
                                {shift.client_id && (
                                  <span className="flex items-center gap-1 text-xs text-slate-500">
                                    <Users size={11} className="text-slate-400" />
                                    <span className="font-medium">{shift.client_id}</span>
                                  </span>
                                )}
                                {shift.clinical_system && (
                                  <span className="flex items-center gap-1 text-xs text-slate-500">
                                    <FileText size={11} className="text-slate-400" />
                                    <span className="font-medium">{shift.clinical_system}</span>
                                  </span>
                                )}
                                {shift.service_code && (
                                  <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-semibold">
                                    {shift.service_code}
                                  </span>
                                )}
                              </div>

                              {shift.workstreams_notes && (
                                <div className="mt-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600">
                                  <strong>Notes:</strong> {shift.workstreams_notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}