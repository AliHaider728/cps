/**
 * ClinicianDashboard.jsx
 *
 * FIXED (May 2026):
 *  - shift_type → status  (shifts table uses `status` not `shift_type`)
 *  - surgery_name fallback chain: surgery_name → practice_name → surgery → "Surgery"
 *  - shift_date fallback: shift_date → date  (both field names handled)
 *  - expected_hours derived from start_time/end_time if field is missing
 *  - Summary cards now show real data from rota
 */
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays, ChevronLeft, ChevronRight,
  Clock, FileText, Stethoscope,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useMyRota } from "../../hooks/useRota";

/* ── Shift status styles ───────────────────────────────────
   Field in DB is `status`, NOT `shift_type`
──────────────────────────────────────────────────────────── */
const TYPE_STYLE = {
  working:       { cell: "bg-teal-50 text-teal-700 border-teal-200",         label: "Working"      },
  annual_leave:  { cell: "bg-purple-50 text-purple-700 border-purple-200",   label: "Annual Leave" },
  sick:          { cell: "bg-red-50 text-red-700 border-red-200",            label: "Sick"         },
  cppe_training: { cell: "bg-indigo-50 text-indigo-700 border-indigo-200",   label: "CPPE"         },
  cppe:          { cell: "bg-indigo-50 text-indigo-700 border-indigo-200",   label: "CPPE"         },
  cover:         { cell: "bg-amber-50 text-amber-700 border-amber-200",      label: "Cover"        },
  bank_holiday:  { cell: "bg-slate-100 text-slate-600 border-slate-200",     label: "BH"           },
  gap:           { cell: "bg-rose-50 text-rose-600 border-rose-200",         label: "Gap"          },
  cancelled:     { cell: "bg-slate-50 text-slate-400 border-slate-200",      label: "Cancelled"    },
};

const DEFAULT_STYLE = { cell: "bg-slate-50 text-slate-600 border-slate-200", label: "Shift" };

/* ── Date helpers ─────────────────────────────────────────── */
const daysInMonth = (m, y) => new Date(y, m, 0).getDate();
const pad         = (v)    => String(v).padStart(2, "0");
const dateKey     = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

/* ── Expected hours helper ────────────────────────────────── */
function resolveHours(shift) {
  // Use expected_hours if present
  if (shift.expected_hours != null) return parseFloat(shift.expected_hours);
  // Fallback: derive from start/end time
  if (shift.start_time && shift.end_time) {
    const [sh, sm] = shift.start_time.split(":").map(Number);
    const [eh, em] = shift.end_time.split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return diff > 0 ? Math.round((diff / 60) * 100) / 100 : 0;
  }
  // Fallback: hours field
  if (shift.hours != null) return parseFloat(shift.hours);
  return 0;
}

/* ── Practice name helper ─────────────────────────────────── */
function resolveName(shift) {
  return (
    shift.surgery_name   ||
    shift.practice_name  ||
    shift.surgery        ||
    null
  );
}

/* ── Shift date helper ────────────────────────────────────── */
function resolveDate(shift) {
  return String(shift.shift_date || shift.date || "").slice(0, 10);
}

/* ── Status helper ────────────────────────────────────────── */
function resolveStatus(shift) {
  // DB field is `status`; legacy data may use `shift_type`
  return shift.status || shift.shift_type || "";
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
export default function ClinicianDashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const now        = new Date();

  const [cursor, setCursor] = useState({
    month: now.getMonth() + 1,
    year:  now.getFullYear(),
  });

  /* ── Fetch rota shifts ──────────────────────────────────── */
  const { data: rota, isLoading: rotaLoading } = useMyRota(cursor.month, cursor.year);

  // rota response can be { shifts: [...] } or { data: { shifts: [...] } }
  const shifts = useMemo(
    () => rota?.shifts ?? rota?.data?.shifts ?? [],
    [rota]
  );

  /* ── Month navigation ───────────────────────────────────── */
  const moveMonth = useCallback((delta) => {
    setCursor((c) => {
      const next = new Date(c.year, c.month - 1 + delta, 1);
      return { month: next.getMonth() + 1, year: next.getFullYear() };
    });
  }, []);

  const monthLabel  = new Date(cursor.year, cursor.month - 1, 1)
    .toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const totalDays   = daysInMonth(cursor.month, cursor.year);
  const firstOffset = (new Date(cursor.year, cursor.month - 1, 1).getDay() + 6) % 7;

  /* ── Summary stats ──────────────────────────────────────── */
  // FIX: was filtering by s.shift_type — now uses resolveStatus(s)
  const workingCount = useMemo(
    () => shifts.filter((s) => {
      const st = resolveStatus(s);
      return st === "working" || st === "cover";
    }).length,
    [shifts]
  );

  const leaveCount = useMemo(
    () => shifts.filter((s) => resolveStatus(s) === "annual_leave").length,
    [shifts]
  );

  const totalExpected = useMemo(
    () => shifts
      .filter((s) => {
        const st = resolveStatus(s);
        return st === "working" || st === "cover";
      })
      .reduce((sum, s) => sum + resolveHours(s), 0),
    [shifts]
  );

  /* ── Calendar shift lookup ──────────────────────────────── */
  const shiftsByDate = useMemo(() => {
    const map = {};
    shifts.forEach((s) => {
      const key = resolveDate(s);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return map;
  }, [shifts]);

  const todayKey = dateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());

  /* ════════════════════════════════════════════════════════ */
  return (
    <>
      <div className="space-y-8 pb-16 bg-slate-50 min-h-screen">

        {/* ── Hero Header ───────────────────────────────────── */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl px-8 py-10 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Stethoscope size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">My Shifts</h1>
                <p className="text-blue-100 text-sm mt-1">
                  {user?.name || "Clinician"} • {monthLabel}
                </p>
              </div>
            </div>

            {/* Month navigator */}
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl p-2">
              <button
                onClick={() => moveMonth(-1)}
                className="p-2.5 rounded-xl hover:bg-white/20 transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft size={18} className="text-white" />
              </button>
              <span className="min-w-[140px] text-center text-sm font-bold text-white">
                {monthLabel}
              </span>
              <button
                onClick={() => moveMonth(1)}
                className="p-2.5 rounded-xl hover:bg-white/20 transition-colors"
                aria-label="Next month"
              >
                <ChevronRight size={18} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Summary Cards ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 px-1">

          {/* Working Days */}
          <div className="bg-white rounded-2xl border border-teal-200 p-6 hover:shadow-lg hover:shadow-teal-100 transition-all">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                Working Days
              </p>
              <div className="p-2 bg-teal-50 rounded-lg">
                <Clock size={16} className="text-teal-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{workingCount}</p>
            <p className="text-xs text-slate-500 mt-2">This month</p>
          </div>

          {/* Expected Hours */}
          <div className="bg-white rounded-2xl border border-green-200 p-6 hover:shadow-lg hover:shadow-green-100 transition-all">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-bold text-green-600 uppercase tracking-wider">
                Expected Hours
              </p>
              <div className="p-2 bg-green-50 rounded-lg">
                <FileText size={16} className="text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {totalExpected.toFixed(1)}
              <span className="text-lg text-slate-500">h</span>
            </p>
            <p className="text-xs text-slate-500 mt-2">Total scheduled</p>
          </div>

          {/* Leave Days */}
          <div className="bg-white rounded-2xl border border-purple-200 p-6 hover:shadow-lg hover:shadow-purple-100 transition-all">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                Leave Days
              </p>
              <div className="p-2 bg-purple-50 rounded-lg">
                <CalendarDays size={16} className="text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{leaveCount}</p>
            <p className="text-xs text-slate-500 mt-2">Annual leave</p>
          </div>
        </div>

        {/* ── Quick Action Buttons ──────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 px-1">
          <button
            onClick={() => navigate("/portal/clinician/my-timesheet")}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700
              hover:from-blue-700 hover:to-blue-800 px-6 py-3 text-sm font-bold text-white
              shadow-lg shadow-blue-200 active:scale-[0.98] transition-all"
          >
            <Clock size={17} />
            Enter My Hours
          </button>
          <button
            onClick={() => navigate("/portal/clinician/apply-leave")}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-white border-2 border-blue-200
              hover:bg-blue-50 hover:border-blue-300 px-6 py-3 text-sm font-bold text-blue-700
              active:scale-[0.98] transition-all"
          >
            <CalendarDays size={17} />
            Apply for Leave
          </button>
          <button
            onClick={() => navigate("/portal/clinician/leave-balance")}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-white border-2 border-slate-200
              hover:bg-slate-50 hover:border-slate-300 px-6 py-3 text-sm font-bold text-slate-700
              active:scale-[0.98] transition-all"
          >
            <FileText size={17} />
            Leave Balance
          </button>
        </div>

        {/* ── Calendar ─────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-200 px-8 py-5 bg-gradient-to-r from-slate-50 to-white">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <CalendarDays size={18} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              My Shifts — {monthLabel}
            </h2>
            {!rotaLoading && (
              <span className="ml-auto text-xs text-slate-400 font-medium">
                {shifts.length} shift{shifts.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {rotaLoading ? (
            <div className="p-16 text-center">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-slate-500">Loading your rota…</p>
            </div>
          ) : (
            <>
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-2 py-3">
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
                  <div key={d} className="text-center text-xs font-bold text-slate-600 uppercase tracking-wide">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar cells */}
              <div className="grid grid-cols-7 gap-0.5 bg-slate-100 p-2 pb-3">

                {/* Empty offset cells (Mon-start) */}
                {Array.from({ length: firstOffset }, (_, i) => (
                  <div key={`blank-${i}`} className="bg-white min-h-[100px] rounded-lg" />
                ))}

                {/* Day cells */}
                {Array.from({ length: totalDays }, (_, idx) => {
                  const day       = idx + 1;
                  const key       = dateKey(cursor.year, cursor.month, day);
                  const isToday   = key === todayKey;
                  const dayShifts = shiftsByDate[key] ?? [];

                  return (
                    <div
                      key={key}
                      className={`bg-white min-h-[100px] p-2.5 rounded-lg transition-all ${
                        isToday
                          ? "ring-2 ring-blue-500 shadow-md bg-gradient-to-br from-blue-50 to-white"
                          : "hover:shadow-md"
                      }`}
                    >
                      <p className={`text-xs font-bold mb-1.5 ${
                        isToday ? "text-blue-700" : "text-slate-600"
                      }`}>
                        {day}
                      </p>

                      <div className="space-y-1">
                        {dayShifts.length === 0 ? (
                          <p className="text-[10px] text-slate-300">—</p>
                        ) : (
                          dayShifts.map((shift) => {
                            const status = resolveStatus(shift);
                            const style  = TYPE_STYLE[status] ?? DEFAULT_STYLE;
                            const name   = resolveName(shift);
                            const hrs    = resolveHours(shift);

                            return (
                              <div
                                key={shift.id}
                                className={`rounded-lg border-l-2 px-2 py-1.5 text-[10px] font-semibold transition-all hover:shadow-md ${style.cell}`}
                              >
                                {name && (
                                  <div className="font-bold truncate">{name}</div>
                                )}
                                <div className="opacity-75">
                                  {hrs > 0 ? `${hrs.toFixed(1)}h` : style.label}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty state */}
              {shifts.length === 0 && (
                <div className="py-10 text-center text-slate-400 text-sm">
                  <CalendarDays size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="font-semibold">No shifts found for {monthLabel}</p>
                  <p className="text-xs mt-1 opacity-70">Contact your administrator if you believe this is incorrect.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Legend ───────────────────────────────────────── */}
        <div className="px-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Shift Types</h3>
            <div className="flex flex-wrap gap-2.5">
              {[
                { type: "working",      label: "Working"      },
                { type: "cover",        label: "Cover"        },
                { type: "annual_leave", label: "Annual Leave" },
                { type: "sick",         label: "Sick Leave"   },
                { type: "cppe",         label: "CPPE"         },
                { type: "bank_holiday", label: "Bank Holiday" },
              ].map(({ type, label }) => {
                const s = TYPE_STYLE[type] ?? DEFAULT_STYLE;
                return (
                  <span
                    key={type}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold border ${s.cell}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}