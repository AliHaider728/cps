/**
 * ClinicianDashboard.jsx — FULLY UPDATED (May 2026)
 *
 * ✅ Uses useMyRota directly — no dependency on useMyTimesheet / useTimeEntries
 * ✅ Working Days + Expected Hours always populated from rota shifts
 * ✅ Handles both `status` and `shift_type` field names (legacy safe)
 * ✅ Handles both `shift_date` and `date` field names
 * ✅ Handles `surgery_name`, `practice_name`, `surgery` fallbacks
 * ✅ Expected hours derived from start/end time if expected_hours missing
 * ✅ Loading skeleton on summary cards
 * ✅ Empty state only shown when rota truly has no shifts
 */

import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays, ChevronLeft, ChevronRight,
  Clock, FileText, Stethoscope,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useMyRota } from "../../hooks/useRota";
import { usePractices } from "../../hooks/usePractice";
import { buildPracticeNameMap, resolvePracticeName } from "../../lib/practiceNames";

/* ── Shift status styles ──────────────────────────────────── */
const TYPE_STYLE = {
  working:       { cell: "bg-teal-50 text-teal-700 border-teal-200",       label: "Working"      },
  annual_leave:  { cell: "bg-purple-50 text-purple-700 border-purple-200", label: "Annual Leave" },
  sick:          { cell: "bg-red-50 text-red-700 border-red-200",          label: "Sick"         },
  cppe_training: { cell: "bg-indigo-50 text-indigo-700 border-indigo-200", label: "CPPE"         },
  cppe:          { cell: "bg-indigo-50 text-indigo-700 border-indigo-200", label: "CPPE"         },
  cover:         { cell: "bg-amber-50 text-amber-700 border-amber-200",    label: "Cover"        },
  bank_holiday:  { cell: "bg-slate-100 text-slate-600 border-slate-200",   label: "BH"           },
  gap:           { cell: "bg-rose-50 text-rose-600 border-rose-200",       label: "Gap"          },
  cancelled:     { cell: "bg-slate-50 text-slate-400 border-slate-200",    label: "Cancelled"    },
};

const DEFAULT_STYLE = { cell: "bg-slate-50 text-slate-600 border-slate-200", label: "Shift" };

/* ── Date helpers ─────────────────────────────────────────── */
const daysInMonth = (m, y) => new Date(y, m, 0).getDate();
const pad         = (v)    => String(v).padStart(2, "0");
const dateKey     = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

/* ── Field normalisation helpers ──────────────────────────── */

/** DB may use `status` (rota_shifts) or legacy `shift_type` */
function resolveStatus(shift) {
  return String(shift.status || shift.shift_type || "").toLowerCase();
}

/** Handles both `shift_date` (rota_shifts) and `date` (shifts) */
function resolveDate(shift) {
  return String(shift.shift_date || shift.date || "").slice(0, 10);
}


/**
 * Expected hours:
 *   1. expected_hours field (rota_shifts)
 *   2. Derived from start_time / end_time
 *   3. hours field (shifts table legacy)
 */
function resolveHours(shift) {
  if (shift.expected_hours != null && shift.expected_hours !== "") {
    return parseFloat(shift.expected_hours) || 0;
  }
  if (shift.start_time && shift.end_time) {
    const [sh, sm] = String(shift.start_time).split(":").map(Number);
    const [eh, em] = String(shift.end_time).split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return diff > 0 ? Math.round((diff / 60) * 100) / 100 : 0;
  }
  if (shift.hours != null && shift.hours !== "") {
    return parseFloat(shift.hours) || 0;
  }
  if (shift.total_hours != null && shift.total_hours !== "") {
    return parseFloat(shift.total_hours) || 0;
  }
  return 0;
}

/* ── Skeleton card ────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
      <div className="h-3 w-24 bg-slate-200 rounded mb-4" />
      <div className="h-8 w-16 bg-slate-200 rounded mb-2" />
      <div className="h-3 w-20 bg-slate-100 rounded" />
    </div>
  );
}

/* ── Summary card ─────────────────────────────────────────── */
function SummaryCard({ label, value, sub, Icon, borderColor, iconBg, iconColor, textColor }) {
  return (
    <div className={`bg-white rounded-2xl border ${borderColor} p-6 hover:shadow-lg transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <p className={`text-xs font-bold uppercase tracking-wider ${textColor}`}>{label}</p>
        <div className={`p-2 ${iconBg} rounded-lg`}>
          <Icon size={16} className={iconColor} />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-2">{sub}</p>
    </div>
  );
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

  /* ── Fetch rota shifts — single source of truth ─────────── */
  const { data: rota, isLoading: rotaLoading, isError: rotaError, error: rotaErr } =
    useMyRota(null, null);

  const { data: practicesData } = usePractices();
  const practiceMap = useMemo(
    () => buildPracticeNameMap(practicesData),
    [practicesData]
  );

  const allShifts = useMemo(() => {
    const raw = rota?.shifts || rota?.data?.shifts || rota?.rota || [];
    return Array.isArray(raw) ? raw : [];
  }, [rota]);

  /** Calendar month filter — navigation only; data is all-time from API */
  const shifts = useMemo(() => {
    return allShifts.filter((s) => {
      const d = String(s.shift_date || s.date || "").slice(0, 10);
      if (!d) return false;
      const [y, m] = d.split("-").map(Number);
      return m === cursor.month && y === cursor.year;
    });
  }, [allShifts, cursor.month, cursor.year]);

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
  const todayKey    = dateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());

  /* ── Summary stats — derived from rota shifts ────────────── */
  const workingShifts = useMemo(
    () => shifts.filter((s) => {
      const st = resolveStatus(s);
      return st === "working" || st === "cover";
    }),
    [shifts]
  );

  const workingDays = workingShifts.length;

  const expectedHours = useMemo(
    () => Math.round(
      workingShifts.reduce((sum, s) => sum + resolveHours(s), 0) * 100
    ) / 100,
    [workingShifts]
  );

  const leaveCount = useMemo(
    () => shifts.filter((s) => resolveStatus(s) === "annual_leave").length,
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

  /* ════════════════════════════════════════════════════════ */
  return (
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

      {rotaError && (
        <div className="mx-1 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          {rotaErr?.message ||
            "Could not load your rota. If this persists, ask an administrator to link your user account to a clinician profile."}
        </div>
      )}

      {/* ── Summary Cards ──────────────────────────────────── */}
      {rotaLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 px-1">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 px-1">
          <SummaryCard
            label="Working Days"
            value={workingDays}
            sub="Shifts this month"
            Icon={Clock}
            borderColor="border-teal-200"
            iconBg="bg-teal-50"
            iconColor="text-teal-600"
            textColor="text-teal-600"
          />
          <SummaryCard
            label="Expected Hours"
            value={
              <span>
                {expectedHours.toFixed(1)}
                <span className="text-lg text-slate-500">h</span>
              </span>
            }
            sub="Total scheduled"
            Icon={FileText}
            borderColor="border-green-200"
            iconBg="bg-green-50"
            iconColor="text-green-600"
            textColor="text-green-600"
          />
          <SummaryCard
            label="Leave Days"
            value={leaveCount}
            sub="Annual leave"
            Icon={CalendarDays}
            borderColor="border-purple-200"
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            textColor="text-purple-600"
          />
        </div>
      )}

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
              {shifts.length} this month · {allShifts.length} total
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

              {/* Offset cells for month start alignment */}
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
                        <p className="text-[10px] text-slate-200">—</p>
                      ) : (
                        dayShifts.map((shift) => {
                          const status = resolveStatus(shift);
                          const style  = TYPE_STYLE[status] ?? DEFAULT_STYLE;
                          const name   = resolvePracticeName(shift, practiceMap);
                          const hrs    = resolveHours(shift);

                          return (
                            <div
                              key={shift.id}
                              className={`rounded-lg border-l-2 px-2 py-1.5 text-[10px] font-semibold transition-all hover:shadow-sm ${style.cell}`}
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

            {/* Empty state — only shown when no shifts at all */}
            {shifts.length === 0 && (
              <div className="py-10 text-center text-slate-400 text-sm border-t border-slate-100">
                <CalendarDays size={32} className="mx-auto mb-2 opacity-30" />
                <p className="font-semibold">No shifts found for {monthLabel}</p>
                <p className="text-xs mt-1 opacity-70">
                  Contact your administrator if you believe this is incorrect.
                </p>
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
  );
}