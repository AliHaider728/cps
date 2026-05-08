import { useEffect, useMemo, useState } from "react";
import { useRotaList } from "../../../hooks/useRota";
import ShiftDetailModal from "./ShiftDetailModal";
import AddShiftModal from "./AddShiftModal";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Briefcase,
  Umbrella,
  Thermometer,
  BookOpen,
  UserPlus,
  AlertTriangle,
  XCircle,
  Plus,
  Loader2,
  Users,
  Clock,
} from "lucide-react";

/* ── Status config with lucide icons ────────────────────────────────── */
const STATUS_CONFIG = {
  working:      { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", label: "Working",      short: "WK", Icon: Briefcase     },
  annual_leave: { bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-500",    label: "Annual Leave", short: "AL", Icon: Umbrella      },
  sick:         { bg: "bg-red-100",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500",     label: "Sick",         short: "SK", Icon: Thermometer   },
  cppe:         { bg: "bg-purple-100",  text: "text-purple-700",  border: "border-purple-200",  dot: "bg-purple-500",  label: "CPPE",         short: "CP", Icon: BookOpen      },
  cover:        { bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500",   label: "Cover",        short: "CV", Icon: UserPlus      },
  gap:          { bg: "bg-orange-100",  text: "text-orange-700",  border: "border-orange-200",  dot: "bg-orange-500",  label: "Gap",          short: "GP", Icon: AlertTriangle },
  cancelled:    { bg: "bg-slate-100",   text: "text-slate-500",   border: "border-slate-200",   dot: "bg-slate-400",   label: "Cancelled",    short: "XX", Icon: XCircle       },
};
const getStatus = (s) => STATUS_CONFIG[s] ?? { bg: "bg-slate-100", text: "text-slate-500", border: "border-slate-200", dot: "bg-slate-300", label: s, short: "??", Icon: AlertTriangle };

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* ── Helpers ─────────────────────────────────────────────────────────── */
const startOfWeekMonday = (date) => {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - ((day + 6) % 7));
  return d;
};

const AVATAR_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-700",
  "from-emerald-500 to-teal-700",
  "from-rose-500 to-pink-700",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-sky-700",
];

/* ── Stat Card (same pattern as ClientsPage) ─────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-extrabold text-slate-800 leading-none mt-0.5">{value ?? "—"}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

/* ── Week label ──────────────────────────────────────────────────────── */
const fmtDate = (d) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

/* ── Main Component ──────────────────────────────────────────────────── */
export default function WeeklyView({
  month = new Date().getMonth() + 1,
  year  = new Date().getFullYear(),
}) {
  const { data, isLoading, isError, error } = useRotaList({ month, year });
  const [anchor,       setAnchor]       = useState(() => new Date(Date.UTC(year, month - 1, new Date().getDate())));
  const [detailOpen,   setDetailOpen]   = useState(false);
  const [detailShift,  setDetailShift]  = useState(null);
  const [addOpen,      setAddOpen]      = useState(false);
  const [addDate,      setAddDate]      = useState(null);
  const [addClinicianId, setAddClinicianId] = useState(null);

  const weekStart  = useMemo(() => startOfWeekMonday(anchor), [anchor]);
  const days       = useMemo(() => Array.from({ length: 7 }, (_, i) => new Date(weekStart.getTime() + i * 86_400_000)), [weekStart]);
  const clinicians = data?.data?.clinicians ?? data?.clinicians ?? [];
  const todayISO   = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())).toISOString().slice(0, 10);

  useEffect(() => {
    setAnchor(new Date(Date.UTC(year, month - 1, 1)));
  }, [month, year]);

  /* ── Week stats ── */
  const stats = useMemo(() => {
    let total = 0, working = 0, gaps = 0, leave = 0;
    const dayISOs = days.map(d => d.toISOString().slice(0, 10));
    clinicians.forEach(row => {
      const shifts = row?.shifts ?? {};
      dayISOs.forEach(iso => {
        const s = shifts[iso];
        if (!s) return;
        total++;
        if (s.status === "working" || s.status === "cover") working++;
        if (s.status === "gap") gaps++;
        if (s.status === "annual_leave" || s.status === "sick") leave++;
      });
    });
    return { total, working, gaps, leave };
  }, [clinicians, days]);

  const prevWeek = () => setAnchor(new Date(anchor.getTime() - 7 * 86_400_000));
  const nextWeek = () => setAnchor(new Date(anchor.getTime() + 7 * 86_400_000));
  const goToday  = () => setAnchor(new Date());

  return (
    <div className="space-y-4">
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}         label="Clinicians"    value={clinicians.length} color="bg-blue-600"    sub="this week" />
        <StatCard icon={Briefcase}     label="Shifts Filled" value={stats.working}     color="bg-emerald-600" sub="working + cover" />
        <StatCard icon={AlertTriangle} label="Gaps"          value={stats.gaps}        color="bg-orange-500"  sub="unfilled shifts" />
        <StatCard icon={Umbrella}      label="On Leave"      value={stats.leave}       color="bg-violet-600"  sub="AL + sick" />
      </div>

      {/* ── Weekly table card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <CalendarDays size={17} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Weekly View</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {fmtDate(days[0])} – {fmtDate(days[6])}, {days[0].getUTCFullYear()}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={prevWeek}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-500 hover:text-slate-700 transition-all active:scale-95"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={goToday}
              className="px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all active:scale-95"
            >
              Today
            </button>
            <button
              type="button"
              onClick={nextWeek}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-500 hover:text-slate-700 transition-all active:scale-95"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Legend strip */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-3">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const { Icon } = cfg;
            return (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`w-4 h-4 rounded flex items-center justify-center ${cfg.bg} border ${cfg.border}`}>
                  <Icon size={9} className={cfg.text} />
                </div>
                <span className="text-[10px] font-semibold text-slate-500">{cfg.label}</span>
              </div>
            );
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-sm text-slate-400 gap-2">
            <Loader2 size={17} className="animate-spin" />
            Loading week…
          </div>
        ) : isError ? (
          <div className="p-6 text-sm text-red-600">{String(error?.message ?? "Failed to load")}</div>
        ) : clinicians.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <CalendarDays size={36} className="text-slate-200" />
            <p className="text-sm font-semibold text-slate-500">No clinicians found</p>
            <p className="text-xs text-slate-400">Generate a rota to populate this view</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-xs">
              <thead>
                <tr>
                  {/* Clinician col header */}
                  <th className="sticky left-0 z-20 bg-slate-50 px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 min-w-[180px]">
                    <div className="flex items-center gap-2">
                      <Users size={13} className="text-slate-400" />
                      Clinician
                    </div>
                  </th>

                  {/* Day columns */}
                  {days.map((d, idx) => {
                    const iso       = d.toISOString().slice(0, 10);
                    const isToday   = iso === todayISO;
                    const isWeekend = idx >= 5;
                    return (
                      <th
                        key={iso}
                        className={[
                          "text-center px-2 py-3 border-b border-slate-200 min-w-[80px]",
                          isWeekend ? "bg-slate-100/60" : "bg-slate-50",
                          isToday   ? "bg-blue-50/60"   : "",
                        ].join(" ")}
                      >
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isWeekend ? "text-slate-400" : "text-slate-400"}`}>
                          {DAY_NAMES[idx]}
                        </p>
                        <div className={[
                          "inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-extrabold",
                          isToday ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-slate-700",
                        ].join(" ")}>
                          {d.getUTCDate()}
                        </div>
                      </th>
                    );
                  })}

                  {/* Summary col */}
                  <th className="px-3 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50 min-w-[64px]">
                    <div className="flex items-center justify-center gap-1">
                      <Clock size={12} className="text-slate-400" />
                      Total
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {clinicians.map((row, ri) => {
                  const clinician   = row?.clinician ?? {};
                  const clinicianId = String(clinician?._id ?? clinician?.id ?? "");
                  const shifts      = row?.shifts ?? {};
                  const gradient    = AVATAR_GRADIENTS[ri % AVATAR_GRADIENTS.length];

                  /* week summary per clinician */
                  const weekShifts = days.map(d => shifts[d.toISOString().slice(0, 10)]).filter(Boolean);
                  const filledCount = weekShifts.filter(s => s.status === "working" || s.status === "cover").length;

                  return (
                    <tr
                      key={clinicianId}
                      className={`group transition-colors ${ri % 2 === 0 ? "bg-white" : "bg-slate-50/40"} hover:bg-blue-50/20`}
                    >
                      {/* Clinician cell */}
                      <td className={`sticky left-0 z-10 px-4 py-2.5 border-b border-slate-100 transition-colors ${ri % 2 === 0 ? "bg-white" : "bg-slate-50/40"} group-hover:bg-blue-50/20`}>
                        <div className="flex items-center gap-2.5">
                          <div className={`h-8 w-8 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm`}>
                            {(clinician.fullName ?? clinician.name ?? "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-slate-800 truncate max-w-[120px]">
                              {clinician.fullName ?? clinician.name ?? clinicianId}
                            </p>
                            <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                              {filledCount} / 5 filled
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Day cells */}
                      {days.map((d, idx) => {
                        const iso       = d.toISOString().slice(0, 10);
                        const shift     = shifts[iso] ?? null;
                        const isWeekend = idx >= 5;
                        const isToday   = iso === todayISO;
                        const cfg       = shift ? getStatus(shift.status) : null;
                        const { Icon }  = cfg ?? {};

                        return (
                          <td
                            key={iso}
                            className={[
                              "px-1.5 py-2 border-b border-slate-100",
                              isWeekend ? "bg-slate-50/50" : "",
                              isToday   ? "bg-blue-50/30"  : "",
                            ].join(" ")}
                          >
                            <button
                              type="button"
                              onClick={() => shift
                                ? (setDetailShift(shift), setDetailOpen(true))
                                : (setAddClinicianId(clinicianId), setAddDate(iso), setAddOpen(true))
                              }
                              title={shift ? `${cfg.label} — ${iso}` : `Add shift for ${iso}`}
                              className={[
                                "w-full h-10 rounded-xl flex items-center justify-center gap-1",
                                "text-[11px] font-bold transition-all duration-150",
                                "hover:scale-105 hover:shadow-md active:scale-95",
                                shift
                                  ? `${cfg.bg} ${cfg.text} ${cfg.border} border`
                                  : "border border-dashed border-slate-200 text-slate-300 hover:border-blue-400 hover:text-blue-400 hover:bg-blue-50",
                              ].join(" ")}
                            >
                              {shift ? (
                                <>
                                  {Icon && <Icon size={11} className="shrink-0" />}
                                  <span className="hidden sm:inline">{cfg.short}</span>
                                </>
                              ) : (
                                <Plus size={13} />
                              )}
                            </button>
                          </td>
                        );
                      })}

                      {/* Summary cell */}
                      <td className="px-3 py-2 border-b border-slate-100 text-center">
                        <span className={[
                          "inline-flex items-center justify-center w-8 h-8 rounded-xl text-[12px] font-extrabold",
                          filledCount === 5 ? "bg-emerald-100 text-emerald-700" :
                          filledCount === 0 ? "bg-slate-100 text-slate-400"     :
                          "bg-blue-50 text-blue-700",
                        ].join(" ")}>
                          {filledCount}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {/* Column totals row */}
                <tr className="bg-slate-50/80">
                  <td className="sticky left-0 z-10 bg-slate-50/80 px-5 py-3 border-t border-slate-200">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Day Total</p>
                  </td>
                  {days.map((d) => {
                    const iso   = d.toISOString().slice(0, 10);
                    const count = clinicians.filter(row => {
                      const s = row?.shifts?.[iso];
                      return s && s.status !== "cancelled";
                    }).length;
                    return (
                      <td key={iso} className="px-1.5 py-3 border-t border-slate-200 text-center">
                        <span className={[
                          "inline-flex items-center justify-center w-7 h-7 rounded-lg text-[11px] font-extrabold",
                          count > 0 ? "bg-blue-100 text-blue-700" : "text-slate-300",
                        ].join(" ")}>
                          {count > 0 ? count : "—"}
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 border-t border-slate-200 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl text-[12px] font-extrabold bg-blue-600 text-white shadow-sm">
                      {stats.working}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ShiftDetailModal open={detailOpen} onClose={() => setDetailOpen(false)} shift={detailShift} />
      <AddShiftModal    open={addOpen}    onClose={() => setAddOpen(false)}    clinicianId={addClinicianId} date={addDate} />
    </div>
  );
}