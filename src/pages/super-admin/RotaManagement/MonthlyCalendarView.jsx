import { useEffect, useMemo, useState } from "react";
import { useRotaList } from "../../../hooks/useRota";
import ShiftDetailModal from "./ShiftDetailModal";
import CoverBookingModal from "./CoverBookingModal";
import {
  Briefcase,
  Umbrella,
  Thermometer,
  BookOpen,
  UserPlus,
  AlertTriangle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Loader2,
} from "lucide-react";

/* ── Helpers ─────────────────────────────────────────────────────────── */
const monthName = (m, fmt = "long") =>
  new Intl.DateTimeFormat("en-GB", { month: fmt }).format(new Date(2000, m - 1, 1));

const daysInMonth = (m, y) => new Date(y, m, 0).getDate();

/* ── Status config ───────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  working:      { bg: "bg-blue-100",   text: "text-blue-800",   border: "border-blue-200",   label: "Working",      Icon: Briefcase     },
  annual_leave: { bg: "bg-green-100",  text: "text-green-800",  border: "border-green-200",  label: "Annual Leave", Icon: Umbrella      },
  sick:         { bg: "bg-red-100",    text: "text-red-800",    border: "border-red-200",    label: "Sick",         Icon: Thermometer   },
  cppe:         { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200", label: "CPPE",         Icon: BookOpen      },
  cover:        { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200", label: "Cover",        Icon: UserPlus      },
  gap:          { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200", label: "Gap",          Icon: AlertTriangle },
  cancelled:    { bg: "bg-slate-100",  text: "text-slate-600",  border: "border-slate-200",  label: "Cancelled",    Icon: XCircle       },
};

const getStatus = (s) =>
  STATUS_CONFIG[s] ?? { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", label: "??", Icon: AlertTriangle };

/* ── Legend ──────────────────────────────────────────────────────────── */
function Legend() {
  return (
    <div className="flex flex-wrap gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
        const { Icon } = cfg;
        return (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-5 h-5 rounded-md flex items-center justify-center ${cfg.bg} ${cfg.border} border`}>
              <Icon size={11} className={cfg.text} />
            </div>
            <span className="text-xs font-medium text-slate-600">{cfg.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Calendar Grid ───────────────────────────────────────────────────── */
function CalendarGrid({ month, year, clinicians, onEventClick, onGapClick }) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
  const daysInCurrentMonth = daysInMonth(month, year);
  const daysInPrevMonth    = daysInMonth(month === 1 ? 12 : month - 1, month === 1 ? year - 1 : year);

  const today          = new Date();
  const isCurrentMonth = today.getMonth() + 1 === month && today.getFullYear() === year;
  const todayDate      = today.getDate();

  const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const calendarDays = [];
  for (let i = adjustedFirstDay - 1; i >= 0; i--)
    calendarDays.push({ day: daysInPrevMonth - i, isCurrentMonth: false, date: new Date(year, month - 2, daysInPrevMonth - i) });
  for (let d = 1; d <= daysInCurrentMonth; d++)
    calendarDays.push({ day: d, isCurrentMonth: true, date: new Date(year, month - 1, d), isToday: isCurrentMonth && d === todayDate });
  const remaining = 42 - calendarDays.length;
  for (let d = 1; d <= remaining; d++)
    calendarDays.push({ day: d, isCurrentMonth: false, date: new Date(year, month, d) });

  const getEventsForDay = (date) => {
    const dateStr = date.toISOString().slice(0, 10);
    const events  = [];
    clinicians.forEach((row) => {
      const clinician = row?.clinician ?? {};
      const shift     = row?.shifts?.[dateStr];
      if (!shift) return;
      const cfg = getStatus(shift.status);
      events.push({
        id:          `${clinician._id}-${dateStr}`,
        title:       `${clinician.fullName ?? clinician.name} — ${cfg.label}`,
        status:      shift.status,
        clinician:   clinician.fullName ?? clinician.name,
        config:      cfg,
        shift,
        clinicianId: clinician._id,
        isGap:       shift.status === "gap",
      });
    });
    return events;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Week-day headers */}
      <div className="grid grid-cols-7 border-b border-slate-200">
        {weekDays.map((d) => (
          <div key={d} className="px-2 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
            <span className="hidden sm:inline">{d}</span>
            <span className="sm:hidden">{d[0]}</span>
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((dayInfo, idx) => {
          const events    = getEventsForDay(dayInfo.date);
          const isWeekend = idx % 7 === 5 || idx % 7 === 6;

          return (
            <div
              key={idx}
              className={[
                "min-h-[80px] sm:min-h-[110px] p-1 sm:p-2 border-r border-b border-slate-100 transition-colors",
                !dayInfo.isCurrentMonth             ? "bg-slate-50/70 text-slate-400"                  : "bg-white",
                isWeekend && dayInfo.isCurrentMonth ? "bg-blue-50/20"                                  : "",
                dayInfo.isToday                     ? "bg-blue-50/50 ring-1 ring-inset ring-blue-200"  : "",
                idx % 7 === 6                       ? "border-r-0"                                     : "",
              ].filter(Boolean).join(" ")}
            >
              {/* Day number */}
              <div className={[
                "text-xs sm:text-sm font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                dayInfo.isToday         ? "bg-blue-600 text-white" : "",
                !dayInfo.isCurrentMonth ? "text-slate-400"         : "text-slate-700",
              ].filter(Boolean).join(" ")}>
                {dayInfo.day}
              </div>

              {/* Event chips */}
              <div className="space-y-0.5">
                {events.slice(0, 2).map((event) => {
                  const { Icon } = event.config;
                  return (
                    <div
                      key={event.id}
                      onClick={() => event.isGap ? onGapClick(event.shift) : onEventClick(event.shift)}
                      title={`${event.clinician} — ${event.config.label}${event.isGap ? " (click to assign cover)" : ""}`}
                      className={[
                        "text-xs px-1 py-0.5 rounded-md truncate cursor-pointer",
                        "flex items-center gap-1 transition-all duration-150",
                        "hover:scale-[1.03] hover:shadow-sm",
                        event.config.bg,
                        event.config.text,
                        event.config.border,
                        event.isGap ? "border border-dashed animate-pulse hover:animate-none" : "border",
                      ].join(" ")}
                    >
                      <Icon size={10} className="shrink-0" />
                      <span className="hidden sm:inline font-medium leading-none">{event.config.label}</span>
                      <span className="sm:hidden font-medium leading-none">{event.config.label.slice(0, 2)}</span>
                    </div>
                  );
                })}
                {events.length > 2 && (
                  <div className="text-[10px] text-slate-400 font-semibold pl-1">
                    +{events.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Sidebar ─────────────────────────────────────────────────────────── */
function Sidebar({ month, year, clinicians, onNavigate }) {
  const today    = new Date();
  const isoFn    = (d) => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0, 10);
  const todayISO = isoFn(today);

  const collect = (key) =>
    clinicians.flatMap((row) => {
      const shift = row?.shifts?.[key];
      if (!shift) return [];
      const c = row?.clinician ?? {};
      return [{ name: c.fullName ?? c.name ?? "Unknown", shift }];
    });

  const Section = ({ label, accentColor, list }) => (
    <div className="px-4 py-3">
      <div className="flex items-center gap-2 mb-2.5">
        <span className={`h-1.5 w-1.5 rounded-full ${accentColor}`} />
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      </div>
      {list.length === 0 ? (
        <p className="text-[10px] text-slate-400 italic pl-3">None recorded</p>
      ) : (
        list.map((item, i) => {
          const cfg = getStatus(item.shift.status);
          const { Icon } = cfg;
          return (
            <div key={i} className="flex items-center gap-2 py-1.5 border-b border-slate-100 last:border-0">
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
                <Icon size={13} className={cfg.text} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-slate-700 truncate">{item.name}</p>
                <span className={`text-[9px] font-medium capitalize ${cfg.text}`}>
                  {item.shift.status?.replace("_", " ")}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="w-64 shrink-0 bg-white border-l border-slate-200">
      {/* Mini-calendar nav */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate(-1)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-sm font-semibold text-slate-700">
            {monthName(month, "short")} {year}
          </span>
          <button
            onClick={() => onNavigate(1)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Today / Yesterday */}
      <div className="max-h-96 overflow-y-auto">
        <Section label="Today's Shifts"     accentColor="bg-blue-500" list={collect(todayISO)} />
        <div className="mx-4 border-t border-slate-100" />
        <Section label="Yesterday's Shifts" accentColor="bg-slate-300" list={collect(isoFn(new Date(today.getTime() - 86_400_000)))} />
      </div>
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────────────────── */
export default function MonthlyCalendarView({
  month: initMonth = new Date().getMonth() + 1,
  year:  initYear  = new Date().getFullYear(),
}) {
  const [month, setMonth] = useState(initMonth);
  const [year,  setYear]  = useState(initYear);

  useEffect(() => { setMonth(initMonth); }, [initMonth]);
  useEffect(() => { setYear(initYear);   }, [initYear]);

  const { data, isLoading, isError, error } = useRotaList({ month, year });

  const [detailOpen,  setDetailOpen]  = useState(false);
  const [detailShift, setDetailShift] = useState(null);
  const [coverOpen,   setCoverOpen]   = useState(false);
  const [gapShift,    setGapShift]    = useState(null);

  const clinicians = data?.data?.clinicians ?? data?.clinicians ?? [];
  const today      = new Date();

  const navigate = (delta) => {
    let m = month + delta, y = year;
    if (m > 12) { m = 1;  y++; }
    if (m < 1)  { m = 12; y--; }
    setMonth(m); setYear(y);
  };

  const handleEventClick = (shift) => { setDetailShift(shift); setDetailOpen(true); };
  const handleGapClick   = (shift) => { setGapShift(shift);    setCoverOpen(true);  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64 rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-3 text-slate-400 text-sm">
        <Loader2 size={18} className="animate-spin" />
        Loading rota…
      </div>
    </div>
  );

  if (isError) return (
    <div className="flex items-center justify-center h-32 rounded-2xl border border-red-200 bg-red-50 text-sm text-red-600">
      {String(error?.message ?? "Failed to load")}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* ── Sub-header ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setMonth(today.getMonth() + 1); setYear(today.getFullYear()); }}
              className="px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Today
            </button>
            <div className="flex items-center gap-0.5">
              <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => navigate(1)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
            <h2 className="text-lg font-bold text-slate-800">{monthName(month)} {year}</h2>
          </div>

          {/* View switcher only — no Add Shift */}
          <div className="flex items-center gap-2">
            {["Day", "Week", "Month"].map((v) => (
              <button
                key={v}
                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                  v === "Month"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Legend ── */}
      <Legend />

      {/* ── Main content ── */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-4 overflow-auto">
          {clinicians.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-slate-200 gap-3">
              <Calendar size={40} className="text-slate-300" />
              <div className="text-center">
                <p className="text-slate-600 font-semibold">No clinicians found</p>
                <p className="text-slate-400 text-sm mt-1">Generate a rota to get started</p>
              </div>
            </div>
          ) : (
            <CalendarGrid
              month={month}
              year={year}
              clinicians={clinicians}
              onEventClick={handleEventClick}
              onGapClick={handleGapClick}
            />
          )}
        </div>

        {/* Sidebar — desktop only */}
        <div className="hidden lg:flex">
          <Sidebar month={month} year={year} clinicians={clinicians} onNavigate={navigate} />
        </div>
      </div>

      {/* ── Modals ── */}
      <ShiftDetailModal open={detailOpen} onClose={() => setDetailOpen(false)} shift={detailShift} />
      <CoverBookingModal
        open={coverOpen}
        onClose={() => { setCoverOpen(false); setGapShift(null); }}
        gapShift={gapShift}
        onAssign={() => window.location.reload()}
      />
    </div>
  );
}