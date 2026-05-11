import { useMemo, useState, useCallback } from "react";
import { useClinicianLeave } from "../../../../hooks/useClinicianLeave";
import { useClinicianRota } from "../../../../hooks/useRota";
import { usePractices } from "../../../../hooks/usePractice";
import ShiftDetailModal from "../../../super-admin/RotaManagement/ShiftDetailModal";
import {
  ChevronLeft, ChevronRight, Calendar, List,
  Clock, MapPin, TrendingUp, AlertTriangle,
  Briefcase, Umbrella, Thermometer, BookOpen,
  UserPlus, XCircle, BarChart2,
} from "lucide-react";

/* ── Spec colour mapping ──────────────────────────────────────────────────
   BLUE   = Working
   YELLOW = Annual Leave
   ORANGE = Sick
   GREEN  = CPPE Training
   PURPLE = Cover
   RED    = Gap / Urgent Gap
   SLATE  = Cancelled / No shift
─────────────────────────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  working:      { bg: "bg-blue-500",   light: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   label: "Working",      Icon: Briefcase   },
  annual_leave: { bg: "bg-yellow-400", light: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", label: "Annual Leave", Icon: Umbrella    },
  sick:         { bg: "bg-orange-500", light: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", label: "Sick",         Icon: Thermometer },
  cppe:         { bg: "bg-green-500",  light: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  label: "CPPE",         Icon: BookOpen    },
  cover:        { bg: "bg-purple-500", light: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", label: "Cover",        Icon: UserPlus    },
  gap:          { bg: "bg-red-500",    light: "bg-red-50",    text: "text-red-700",    border: "border-red-200",    label: "Gap",          Icon: AlertTriangle },
  cancelled:    { bg: "bg-slate-400",  light: "bg-slate-50",  text: "text-slate-500",  border: "border-slate-200",  label: "Cancelled",    Icon: XCircle     },
};

const getStatus = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.cancelled;

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const fmtTime = (t) => {
  if (!t) return "";
  return String(t).slice(0, 5); // "09:00:00" → "09:00"
};

const fmtHours = (start, end) => {
  if (!start || !end) return null;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = ((eh * 60 + em) - (sh * 60 + sm)) / 60;
  return diff > 0 ? diff : null;
};

/* ── Stats derived from shifts ───────────────────────────────────────────── */
const deriveStats = (shifts) => {
  let working = 0, leave = 0, sick = 0, cppe = 0, cover = 0, gaps = 0, totalHours = 0;
  shifts.forEach((s) => {
    const h = fmtHours(s.start_time, s.end_time) ?? s.hours ?? 0;
    switch (s.status) {
      case "working":      working++;      totalHours += h; break;
      case "annual_leave": leave++;        break;
      case "sick":         sick++;         break;
      case "cppe":         cppe++;         break;
      case "cover":        cover++;        totalHours += h; break;
      case "gap":          gaps++;         break;
      default: break;
    }
  });
  return { working, leave, sick, cppe, cover, gaps, totalHours: Math.round(totalHours * 10) / 10 };
};

/* ── Practice name resolver ──────────────────────────────────────────────── */
const usePracticeMap = () => {
  const { data } = usePractices?.() ?? {};
  return useMemo(() => {
    const list = data?.data || data?.practices || data || [];
    const map = new Map();
    if (Array.isArray(list)) {
      list.forEach((p) => {
        if (p?.id)  map.set(String(p.id),  p.name || p.practiceName || p.practice_name || "");
        if (p?._id) map.set(String(p._id), p.name || p.practiceName || p.practice_name || "");
        if (p?.ods_code) map.set(String(p.ods_code), p.name || "");
      });
    }
    return map;
  }, [data]);
};

const shortId = (id) => {
  if (!id) return "—";
  const s = String(id);
  // ODS code like P84001 — show as-is
  if (/^[A-Z][0-9]{5}$/.test(s)) return s;
  // UUID — show last 8 chars
  return s.length > 12 ? `…${s.slice(-8)}` : s;
};

/* ═══════════════════════════════════════════════════════════════════════════
   LEAVE BALANCE CARD
═══════════════════════════════════════════════════════════════════════════ */
function LeaveCard({ contract, data }) {
  const total     = Number(data?.total     ?? data?.totalDays     ?? 0);
  const used      = Number(data?.used      ?? data?.takenDays     ?? data?.taken ?? 0);
  const remaining = Number(data?.remaining ?? data?.remainingDays ?? (total - used));
  const pct       = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const isLow     = remaining <= 5 && total > 0;

  const CONTRACT_COLORS = {
    ARRS:   { bar: "bg-blue-500",   ring: "ring-blue-200",   accent: "text-blue-600"   },
    EA:     { bar: "bg-violet-500", ring: "ring-violet-200", accent: "text-violet-600" },
    Direct: { bar: "bg-emerald-500",ring: "ring-emerald-200",accent: "text-emerald-600"},
  };
  const colors = CONTRACT_COLORS[contract] || CONTRACT_COLORS.ARRS;

  return (
    <div className={`rounded-2xl border bg-white p-4 ring-1 ${colors.ring} shadow-sm`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{contract}</p>
          <p className="text-xs font-semibold text-slate-600 mt-0.5">Annual Leave</p>
        </div>
        {isLow && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <AlertTriangle size={9} /> Low
          </span>
        )}
      </div>

      <div className="flex items-end gap-1 mb-2">
        <span className={`text-3xl font-black ${colors.accent}`}>{remaining}</span>
        <span className="text-sm text-slate-400 mb-1">/ {total} days</span>
      </div>

      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-slate-400">
        <span>Taken <strong className="text-slate-600">{used}d</strong></span>
        <span>Remaining <strong className="text-slate-600">{remaining}d</strong></span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STAT PILL
═══════════════════════════════════════════════════════════════════════════ */
function StatPill({ label, value, color = "bg-slate-100 text-slate-700" }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${color}`}>
      <span className="text-base font-black">{value}</span>
      <span className="opacity-70">{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CALENDAR DAY CELL
═══════════════════════════════════════════════════════════════════════════ */
function DayCell({ day, isCurrentMonth, isToday, shifts = [], onClick }) {
  const primary = shifts[0];
  const cfg     = primary ? getStatus(primary.status) : null;
  const extra   = shifts.length - 1;

  return (
    <div
      onClick={() => primary && onClick(primary)}
      className={`
        relative min-h-[72px] rounded-xl border p-2 transition-all duration-150
        ${!isCurrentMonth ? "opacity-30 bg-slate-50/50 border-slate-100" : "bg-white border-slate-150"}
        ${isToday ? "ring-2 ring-blue-400 ring-offset-1 border-blue-300" : ""}
        ${primary ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""}
        ${cfg ? cfg.border : "border-slate-100"}
      `}
    >
      {/* Day number */}
      <div className={`
        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1
        ${isToday ? "bg-blue-500 text-white" : "text-slate-500"}
      `}>
        {day}
      </div>

      {/* Primary shift */}
      {primary && (
        <div className={`rounded-lg px-1.5 py-1 text-[10px] font-semibold leading-tight ${cfg.light} ${cfg.text}`}>
          <div className="flex items-center gap-1">
            {cfg.Icon && <cfg.Icon size={8} />}
            <span>{cfg.label}</span>
          </div>
          {primary.start_time && (
            <div className="opacity-70 mt-0.5">{fmtTime(primary.start_time)}–{fmtTime(primary.end_time)}</div>
          )}
        </div>
      )}

      {/* Extra shifts badge */}
      {extra > 0 && (
        <div className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full bg-slate-700 text-white text-[9px] font-bold flex items-center justify-center">
          +{extra}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function CalendarPanel({ clinicianId, canManage, userRole = "clinician" }) {
  const now      = useMemo(() => new Date(), []);
  const [month,  setMonth]  = useState(now.getMonth() + 1);
  const [year,   setYear]   = useState(now.getFullYear());
  const [view,   setView]   = useState("list"); // "calendar" | "list"
  const [selected, setSelected] = useState(null);

  const leaveQ     = useClinicianLeave(clinicianId);
  const rotaQ      = useClinicianRota(clinicianId, month, year);
  const practiceMap = usePracticeMap();

  const shifts   = rotaQ?.data?.data?.shifts ?? rotaQ?.data?.shifts ?? [];
  const balances = leaveQ?.data?.balances ?? leaveQ?.data?.data?.balances ?? [];
  const isLoading = rotaQ?.isLoading || leaveQ?.isLoading;

  const readOnly = userRole === "clinician" || !canManage;

  /* ── Leave balances by contract ─────────────────────────────────────── */
  const byContract = useMemo(() => {
    const map = { ARRS: {}, EA: {}, Direct: {} };
    (Array.isArray(balances) ? balances : []).forEach((b) => {
      const key = b?.contract || b?.contract_type;
      if (map[key]) map[key] = b;
    });
    return map;
  }, [balances]);

  /* ── Month stats ─────────────────────────────────────────────────────── */
  const stats = useMemo(() => deriveStats(shifts), [shifts]);

  /* ── Shifts keyed by date ────────────────────────────────────────────── */
  const shiftsByDate = useMemo(() => {
    const map = {};
    shifts.forEach((s) => {
      const key = String(s.date || "").slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return map;
  }, [shifts]);

  /* ── Calendar grid ───────────────────────────────────────────────────── */
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay  = new Date(year, month, 0);
    // Monday-based: Mon=0 … Sun=6
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const days = [];
    // Prev month padding
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, -i);
      days.push({ date: d, isCurrentMonth: false });
    }
    // Current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({ date: new Date(year, month - 1, d), isCurrentMonth: true });
    }
    // Next month padding (fill to 6 rows)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: new Date(year, month, d), isCurrentMonth: false });
    }
    return days;
  }, [month, year]);

  /* ── Practice name lookup ────────────────────────────────────────────── */
  const getPracticeName = useCallback((shift) => {
    const id = shift?.practice_id;
    if (!id) return "—";
    const fromMap = practiceMap.get(String(id));
    if (fromMap) return fromMap;
    if (shift?.practice_name) return shift.practice_name;
    return shortId(id);
  }, [practiceMap]);

  /* ── Navigate ────────────────────────────────────────────────────────── */
  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };
  const isToday   = (d) => {
    const t = new Date();
    return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
  };

  return (
    <div className="space-y-5">

      {/* ── Leave Balance Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {["ARRS", "EA", "Direct"].map((c) => (
          <LeaveCard key={c} contract={c} data={byContract[c]} />
        ))}
      </div>

      {/* ── Calendar Header ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {/* Month navigation */}
            <button onClick={prevMonth}
              className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
              <ChevronLeft size={14} className="text-slate-600" />
            </button>
            <h2 className="text-base font-bold text-slate-800 min-w-[160px] text-center">
              {MONTHS[month - 1]} {year}
            </h2>
            <button onClick={nextMonth}
              className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
              <ChevronRight size={14} className="text-slate-600" />
            </button>

            {/* Today button */}
            <button
              onClick={() => { setMonth(now.getMonth() + 1); setYear(now.getFullYear()); }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors border border-blue-200">
              Today
            </button>
          </div>

          {/* Stats + View Toggle */}
          <div className="flex items-center gap-3">
            {/* Quick stats */}
            <div className="hidden md:flex items-center gap-1.5">
              {stats.working > 0    && <StatPill label="working"  value={stats.working}    color="bg-blue-50 text-blue-700"    />}
              {stats.leave > 0      && <StatPill label="leave"    value={stats.leave}      color="bg-yellow-50 text-yellow-700"/>}
              {stats.sick > 0       && <StatPill label="sick"     value={stats.sick}       color="bg-orange-50 text-orange-700"/>}
              {stats.gaps > 0       && <StatPill label="gaps"     value={stats.gaps}       color="bg-red-50 text-red-700"      />}
              {stats.totalHours > 0 && <StatPill label="hrs"      value={stats.totalHours} color="bg-slate-100 text-slate-700" />}
            </div>

            {/* View toggle */}
            <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden">
              <button onClick={() => setView("calendar")}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${view === "calendar" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
                <Calendar size={12} /> Calendar
              </button>
              <button onClick={() => setView("list")}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${view === "list" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
                <List size={12} /> List
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center h-32 gap-2 text-sm text-slate-400">
            <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-blue-500 animate-spin" />
            Loading shifts…
          </div>
        )}

        {/* ── CALENDAR VIEW ───────────────────────────────────────────── */}
        {!isLoading && view === "calendar" && (
          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map((d) => (
                <div key={d} className={`text-center text-[11px] font-bold uppercase tracking-wider py-2 ${d === "Sat" || d === "Sun" ? "text-slate-400" : "text-slate-500"}`}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map(({ date, isCurrentMonth }, idx) => {
                const key   = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
                const dayShifts = shiftsByDate[key] || [];
                return (
                  <DayCell
                    key={idx}
                    day={date.getDate()}
                    isCurrentMonth={isCurrentMonth}
                    isToday={isToday(date)}
                    shifts={dayShifts}
                    onClick={setSelected}
                  />
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-100">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <div className={`w-2.5 h-2.5 rounded-full ${cfg.bg}`} />
                  {cfg.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LIST VIEW ───────────────────────────────────────────────── */}
        {!isLoading && view === "list" && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Time</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Hours</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Practice</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">System</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shifts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm">
                      <Calendar size={28} className="mx-auto mb-2 opacity-30" />
                      No shifts found for {MONTHS[month - 1]} {year}
                    </td>
                  </tr>
                )}
                {shifts.map((s, i) => {
                  const cfg   = getStatus(s.status);
                  const hours = fmtHours(s.start_time, s.end_time) ?? s.hours;
                  const practiceName = getPracticeName(s);

                  return (
                    <tr
                      key={s.id || i}
                      onClick={() => setSelected(s)}
                      className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                    >
                      {/* Date */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="text-xs font-bold text-slate-800">
                            {String(s.date || "").slice(0, 10)}
                          </div>
                          {s.day_of_week && (
                            <span className="text-[10px] text-slate-400 font-medium">{s.day_of_week}</span>
                          )}
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.light} ${cfg.text} ${cfg.border}`}>
                          <cfg.Icon size={10} />
                          {s.status === "gap" && s.urgent ? "URGENT GAP" : cfg.label}
                        </span>
                      </td>

                      {/* Time */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Clock size={11} className="text-slate-400" />
                          {s.start_time ? `${fmtTime(s.start_time)} – ${fmtTime(s.end_time)}` : "—"}
                        </div>
                      </td>

                      {/* Hours */}
                      <td className="px-5 py-3">
                        {hours ? (
                          <span className="text-xs font-bold text-slate-700">{hours}h</span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>

                      {/* Practice — ✅ FIXED: shows name instead of UUID */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5 max-w-[180px]">
                          <MapPin size={11} className="text-slate-400 shrink-0" />
                          <span
                            className="text-xs text-slate-700 font-medium truncate"
                            title={String(s.practice_id || "")}
                          >
                            {practiceName}
                          </span>
                        </div>
                      </td>

                      {/* Clinical system */}
                      <td className="px-5 py-3">
                        {s.clinical_system ? (
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {s.clinical_system}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>

                      {/* Rate */}
                      <td className="px-5 py-3">
                        {s.hourly_rate ? (
                          <span className="text-xs font-semibold text-emerald-700">
                            £{s.hourly_rate}/hr
                            {s.total_value ? <span className="text-slate-400 font-normal ml-1">(£{s.total_value})</span> : null}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* List footer summary */}
            {shifts.length > 0 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
                <span className="text-xs text-slate-500">
                  {shifts.length} shift{shifts.length !== 1 ? "s" : ""} · {MONTHS[month - 1]} {year}
                </span>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {stats.totalHours > 0 && (
                    <span className="flex items-center gap-1">
                      <BarChart2 size={11} />
                      <strong className="text-slate-700">{stats.totalHours}h</strong> total
                    </span>
                  )}
                  {stats.gaps > 0 && (
                    <span className="flex items-center gap-1 text-red-600 font-semibold">
                      <AlertTriangle size={11} />
                      {stats.gaps} gap{stats.gaps !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Shift Detail Modal ───────────────────────────────────────────── */}
      <ShiftDetailModal
        open={!!selected}
        onClose={() => setSelected(null)}
        shift={selected}
        readOnly={readOnly}
        practiceName={selected ? getPracticeName(selected) : ""}
      />
    </div>
  );
}