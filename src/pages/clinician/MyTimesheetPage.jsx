import { useMemo, useState } from "react";
import {
  ChevronLeft, ChevronRight, Send, FileText,
  Clock, CheckCircle2, TrendingUp, BarChart2,
  AlertTriangle, Calendar, MapPin, RefreshCw,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  useMyTimesheet,
  useMyRota,
  useSubmitTimesheet,
  useUpdateTimesheetEntry,
} from "../../hooks/useRota";
import { useTimeEntries } from "../../hooks/useTimeEntry";

/* ─────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────── */
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const statusColor = {
  draft:     "default",
  submitted: "warning",
  approved:  "success",
  rejected:  "danger",
};

function calcHours(start, end) {
  if (!start || !end) return null;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = eh * 60 + em - (sh * 60 + sm);
  return diff > 0 ? Math.round((diff / 60) * 100) / 100 : null;
}

function fmtDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short",
  });
}

function DiffBadge({ expected, actual }) {
  if (actual == null || expected == null)
    return <span className="text-slate-300 text-xs">—</span>;
  const diff = Math.round((Number(actual) - Number(expected)) * 100) / 100;
  const abs  = Math.abs(diff);
  const cls  =
    abs < 0.01
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : abs <= 1
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-rose-50 text-rose-700 border-rose-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-[11px] font-bold ${cls}`}>
      {diff >= 0 ? "+" : ""}{diff.toFixed(2)}h
    </span>
  );
}

/* ─────────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────────── */
function StatCard({ label, value, sub, Icon, color = "text-slate-900" }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-slate-500" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className={`text-xl font-black leading-tight ${color}`}>{value}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────── */
export default function MyTimesheetPage() {
  const today = new Date();
  const [cursor, setCursor] = useState({
    month: today.getMonth() + 1,
    year:  today.getFullYear(),
  });
  const [drafts,     setDrafts]     = useState({});
  const [confirming, setConfirming] = useState(false);

  /* ── Data fetching ──────────────────────────────── */
  // ROTA SHIFTS are PRIMARY source — always query them
  const rotaQuery      = useMyRota(cursor.month, cursor.year);
  
  // Timesheet metadata (status, approval info)
  const timesheetMetaQuery = useMyTimesheet(cursor.month, cursor.year);
  
  // Time entries (clock-in/clock-out) — OPTIONAL overlay
  const timeEntriesQuery = useTimeEntries({
    month: cursor.month,
    year: cursor.year,
  });

  const updateEntry = useUpdateTimesheetEntry();
  const submit      = useSubmitTimesheet();

  /* ── Combined loading / error state ────────────── */
  const isLoading = rotaQuery.isLoading || timesheetMetaQuery.isLoading;
  const error     = rotaQuery.error || timesheetMetaQuery.error;

  /* ── Derive timesheet metadata (status, approval info) ── */
  const timesheet = useMemo(() => {
    const payload = timesheetMetaQuery.data;
    if (!payload) return null;
    if (payload.timesheet) return payload.timesheet;
    const { entries: _e, shifts: _s, ...meta } = payload;
    return payload.id ? meta : null;
  }, [timesheetMetaQuery.data]);

  /* ── Normalise rows: ROTA SHIFTS are primary, time_entries are overlay ── */
  const rows = useMemo(() => {
    // STEP 1: Extract rota shifts (primary source of truth)
    const rotaRaw =
      rotaQuery.data?.shifts ??
      timesheetMetaQuery.data?.shifts ??
      rotaQuery.data?.rota ??
      rotaQuery.data ??
      [];
    const rotaArray = Array.isArray(rotaRaw) ? rotaRaw : [];

    // If no rota shifts exist at all → return empty
    if (rotaArray.length === 0) {
      return [];
    }

    // STEP 2: Extract time entries (optional overlay for clock-in/clock-out)
    // Filter to only entries for the current month/year if needed
    const timeEntries = Array.isArray(timeEntriesQuery.data) ? timeEntriesQuery.data : [];
    
    // Build a map of time_entries by shiftId for quick lookup
    const timeEntryMap = {};
    timeEntries.forEach((entry) => {
      const shiftId = entry.shiftId ?? entry.shift_id ?? entry.shift?.id;
      if (shiftId) {
        timeEntryMap[shiftId] = entry;
      }
    });

    // STEP 3: Merge rota shifts with time_entries (where available)
    return rotaArray.map((shift) => {
      const timeEntry = timeEntryMap[shift.id] || {};
      
      return {
        id:              shift.id,
        shift_date:      shift.shift_date || shift.date,
        surgery_name:    shift.surgery_name || shift.practice_name || shift.practice?.name || "—",
        expected_hours:  Number(shift.expected_hours ?? shift.hours ?? shift.total_hours ?? 0),
        start_time:      timeEntry.start_time || shift.start_time || "",
        end_time:        timeEntry.end_time || shift.end_time || "",
        notes:           timeEntry.notes || shift.notes || "",
        actual_hours:    timeEntry.actual_hours ?? null,
        is_cover:        !!shift.is_cover,
        is_seeded_from_rota: true, // All rows from rota are seeded (never save to API without explicit entry)
        ...(drafts[shift.id] || {}), // Apply local draft edits on top
      };
    });
  }, [rotaQuery.data, timeEntriesQuery.data, drafts]);

  /* ── Derived flags ──────────────────────────────── */
  const isDraft     = !timesheet || timesheet.status === "draft" || timesheet.status === "rejected";
  const canSubmit   = isDraft && !!timesheet;
  const missingRows = rows.filter((r) => !r.is_seeded_from_rota && (!r.start_time || !r.end_time));

  /* ── Stats ──────────────────────────────────────── */
  const totalExpected = rows.reduce((s, r) => s + Number(r.expected_hours || 0), 0);
  const totalActual   = rows.reduce((s, r) => {
    return s + Number(r.actual_hours ?? calcHours(r.start_time, r.end_time) ?? 0);
  }, 0);
  const fte       = totalExpected > 0 ? (totalActual / 37.5).toFixed(2) : "—";
  const diffTotal = totalActual - totalExpected;

  /* ── Month nav ──────────────────────────────────── */
  const moveMonth = (delta) => {
    const next = new Date(cursor.year, cursor.month - 1 + delta, 1);
    setCursor({ month: next.getMonth() + 1, year: next.getFullYear() });
    setDrafts({});
  };
  const goToday = () => {
    setCursor({ month: today.getMonth() + 1, year: today.getFullYear() });
    setDrafts({});
  };

  const monthLabel = `${MONTHS[cursor.month - 1]} ${cursor.year}`;
  const isCurrentMonth =
    cursor.month === today.getMonth() + 1 && cursor.year === today.getFullYear();

  /* ── Row handlers ───────────────────────────────── */
  const setRow = (id, key, val) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), [key]: val } }));

  const saveRow = (entry) => {
    // Seeded-from-rota rows don't exist in timesheet_entries yet — skip API call
    if (entry.is_seeded_from_rota) return;

    updateEntry.mutate({
      entryId: entry.id,
      data: {
        start_time: entry.start_time,
        end_time:   entry.end_time,
        notes:      entry.notes || "",
      },
    });
  };

  const handleSubmit = () => {
    if (!timesheet?.id) return;
    submit.mutate(timesheet.id, {
      onSuccess: () => setConfirming(false),
    });
  };

  /* ── Seeded-row notice ──────────────────────────── */
  const isSeededView = rows.length > 0 && rows.every((r) => r.is_seeded_from_rota);

  /* ════════════════════════════════════════════════ */
  return (
    <div className="space-y-5 pb-10 max-w-7xl mx-auto px-1">

      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            My Timesheet
          </h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-slate-500 text-sm font-medium">{monthLabel}</span>
            {timesheet?.status && (
              <Badge color={statusColor[timesheet.status] || "default"}>
                {timesheet.status.charAt(0).toUpperCase() + timesheet.status.slice(1)}
              </Badge>
            )}
            {isSeededView && (
              <Badge color="default">Rota Preview</Badge>
            )}
          </div>
        </div>

        {/* Month controls + submit */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <button
              onClick={() => moveMonth(-1)}
              className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 transition-colors border-r border-slate-200"
              title="Previous month"
            >
              <ChevronLeft size={15} className="text-slate-600" />
            </button>
            <span className="px-4 text-sm font-bold text-slate-800 min-w-[140px] text-center select-none">
              {monthLabel}
            </span>
            <button
              onClick={() => moveMonth(1)}
              className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 transition-colors border-l border-slate-200"
              title="Next month"
            >
              <ChevronRight size={15} className="text-slate-600" />
            </button>
          </div>

          {!isCurrentMonth && (
            <button
              onClick={goToday}
              className="text-xs font-semibold text-blue-600 px-3 py-2 rounded-xl hover:bg-blue-50 border border-blue-200 transition-colors"
            >
              Today
            </button>
          )}

          <button
            onClick={() => { rotaQuery.refetch(); timesheetMetaQuery.refetch(); timeEntriesQuery.refetch(); }}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm"
            title="Refresh"
          >
            <RefreshCw size={14} className="text-slate-500" />
          </button>

          <Button
            disabled={!canSubmit || missingRows.length > 0 || submit.isLoading}
            onClick={() => setConfirming(true)}
            title={
              isSeededView
                ? "Fill in start / end times before submitting"
                : !timesheet
                ? "No timesheet found for this month"
                : missingRows.length > 0
                ? `${missingRows.length} rows missing start/end times`
                : "Submit timesheet for approval"
            }
          >
            <Send size={14} />
            {submit.isLoading ? "Submitting…" : "Submit"}
          </Button>
        </div>
      </div>

      {/* ── Seeded-view info banner ── */}
      {isSeededView && (
        <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <Calendar size={15} className="shrink-0 mt-0.5" />
          <div>
            <strong>Rota Preview</strong>
            <p className="mt-0.5 font-normal opacity-80">
              Your assigned shifts for {monthLabel} are shown below.
              Add start / end times and submit once your hours are confirmed.
            </p>
          </div>
        </div>
      )}

      {/* ── Alerts ── */}
      {timesheet?.status === "rejected" && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <div>
            <strong>Timesheet Rejected</strong>
            <p className="mt-0.5 font-normal opacity-80">
              {timesheet.rejection_reason || "Please update your entries and resubmit."}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          {error.message || "Failed to load timesheet data."}
        </div>
      )}

      {/* ── Stats row ── */}
      {rows.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Working Days"
            value={rows.length}
            sub="assigned shifts"
            Icon={Calendar}
          />
          <StatCard
            label="Expected"
            value={`${totalExpected.toFixed(2)}h`}
            Icon={Clock}
          />
          <StatCard
            label="Actual"
            value={totalActual > 0 ? `${totalActual.toFixed(2)}h` : "—"}
            Icon={CheckCircle2}
            color={totalActual > 0 ? (totalActual >= totalExpected ? "text-emerald-700" : "text-rose-600") : "text-slate-400"}
          />
          <StatCard
            label="FTE"
            value={fte}
            sub="based on 37.5h/wk"
            Icon={BarChart2}
          />
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-700">
              {monthLabel} Timesheet
            </span>
            {rows.length > 0 && (
              <span className="text-[11px] text-slate-400 font-medium">
                · {rows.length} shift{rows.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          {missingRows.length > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              <AlertTriangle size={10} /> {missingRows.length} row{missingRows.length > 1 ? "s" : ""} incomplete
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {[
                  "Date", "Surgery / Practice", "Expected",
                  "Start Time", "End Time", "Actual Hours",
                  "Difference", "Notes", "Cover",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">

              {/* Loading */}
              {isLoading && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-blue-500 animate-spin" />
                      Loading shifts…
                    </div>
                  </td>
                </tr>
              )}

              {/* Empty — only shown when BOTH timesheet AND rota are empty */}
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Calendar size={32} className="text-slate-300" />
                      <p className="text-slate-500 font-semibold text-sm">
                        No shifts found for {monthLabel}
                      </p>
                      <p className="text-slate-400 text-xs max-w-sm">
                        No rota has been assigned for this month yet. Contact your administrator if you believe this is incorrect.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {!isLoading && rows.map((entry) => {
                const actual   = entry.actual_hours ?? calcHours(entry.start_time, entry.end_time);
                const editable = isDraft && !entry.is_seeded_from_rota
                              || (isDraft && entry.is_seeded_from_rota); // seeded rows: allow editing times locally

                return (
                  <tr
                    key={entry.id}
                    className={`transition-colors ${
                      entry.is_seeded_from_rota
                        ? "bg-slate-50/50"
                        : entry.is_cover
                        ? "bg-amber-50/60"
                        : "hover:bg-slate-50/30"
                    }`}
                  >
                    {/* Date */}
                    <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap text-xs">
                      {fmtDate(entry.shift_date)}
                    </td>

                    {/* Surgery */}
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={11} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[160px]">
                          {entry.surgery_name || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Expected hours */}
                    <td className="px-4 py-3 text-xs font-medium text-slate-600">
                      {Number(entry.expected_hours || 0).toFixed(2)}h
                    </td>

                    {/* Start time */}
                    <td className="px-4 py-3">
                      {editable ? (
                        <input
                          type="time"
                          value={entry.start_time || ""}
                          onChange={(e) => setRow(entry.id, "start_time", e.target.value)}
                          onBlur={() => saveRow(entry)}
                          className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white"
                        />
                      ) : (
                        <span className={`text-xs font-mono ${entry.start_time ? "text-slate-700" : "text-slate-300"}`}>
                          {entry.start_time ? entry.start_time.slice(0, 5) : "—"}
                        </span>
                      )}
                    </td>

                    {/* End time */}
                    <td className="px-4 py-3">
                      {editable ? (
                        <input
                          type="time"
                          value={entry.end_time || ""}
                          onChange={(e) => setRow(entry.id, "end_time", e.target.value)}
                          onBlur={() => saveRow(entry)}
                          className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white"
                        />
                      ) : (
                        <span className={`text-xs font-mono ${entry.end_time ? "text-slate-700" : "text-slate-300"}`}>
                          {entry.end_time ? entry.end_time.slice(0, 5) : "—"}
                        </span>
                      )}
                    </td>

                    {/* Actual hours */}
                    <td className="px-4 py-3 text-sm font-black text-slate-900 whitespace-nowrap">
                      {actual != null
                        ? `${Number(actual).toFixed(2)}h`
                        : <span className="text-slate-300 font-normal text-xs">—</span>}
                    </td>

                    {/* Diff badge */}
                    <td className="px-4 py-3">
                      <DiffBadge expected={entry.expected_hours} actual={actual} />
                    </td>

                    {/* Notes */}
                    <td className="px-4 py-3">
                      {editable ? (
                        <input
                          value={entry.notes || ""}
                          onChange={(e) => setRow(entry.id, "notes", e.target.value)}
                          onBlur={() => saveRow(entry)}
                          placeholder="Optional note…"
                          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white min-w-[120px]"
                        />
                      ) : (
                        <span className={`text-xs ${entry.notes ? "text-slate-600" : "text-slate-300"}`}>
                          {entry.notes || "—"}
                        </span>
                      )}
                    </td>

                    {/* Cover / seeded badge */}
                    <td className="px-4 py-3">
                      {entry.is_seeded_from_rota ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-slate-100 text-slate-500 border-slate-200">
                          Rota
                        </span>
                      ) : entry.is_cover ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-amber-50 text-amber-700 border-amber-200">
                          Cover
                        </span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Footer totals */}
            {!isLoading && rows.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200">
                  <td colSpan={2} className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                    Monthly Total
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-slate-600">
                    {totalExpected.toFixed(2)}h
                  </td>
                  <td colSpan={2} />
                  <td className="px-4 py-3 text-sm font-black text-slate-900">
                    {totalActual > 0
                      ? `${totalActual.toFixed(2)}h`
                      : <span className="text-slate-300 font-normal text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {totalActual > 0 && (
                      <DiffBadge expected={totalExpected} actual={totalActual} />
                    )}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ── Submitted / approved notice ── */}
      {timesheet?.status === "submitted" && (
        <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 font-medium">
          <CheckCircle2 size={15} />
          Timesheet submitted on{" "}
          {timesheet.submitted_at
            ? new Date(timesheet.submitted_at).toLocaleDateString("en-GB")
            : "—"}{" "}
          — awaiting approval.
        </div>
      )}
      {timesheet?.status === "approved" && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-medium">
          <CheckCircle2 size={15} />
          Timesheet approved on{" "}
          {timesheet.approved_at
            ? new Date(timesheet.approved_at).toLocaleDateString("en-GB")
            : "—"}.
        </div>
      )}

      {/* ── Submit confirmation modal ── */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">Submit Timesheet?</h2>
            <p className="mt-2 text-sm text-slate-600">
              Once submitted, your {monthLabel} timesheet will be sent to the approvals queue.
              You won't be able to edit it until it's reviewed.
            </p>
            <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 grid grid-cols-2 gap-2 text-sm">
              <span className="text-slate-500">Working days:</span>
              <span className="font-bold text-slate-800">{rows.length}</span>
              <span className="text-slate-500">Total expected:</span>
              <span className="font-bold text-slate-800">{totalExpected.toFixed(2)}h</span>
              <span className="text-slate-500">Total actual:</span>
              <span className="font-bold text-slate-800">{totalActual > 0 ? `${totalActual.toFixed(2)}h` : "—"}</span>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} isLoading={submit.isLoading}>
                <Send size={14} /> Confirm Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}