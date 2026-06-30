import React, { useMemo, useState } from "react";
import {
  ChevronLeft, ChevronRight, Send, FileText, Save,
  Clock, CheckCircle2, TrendingUp, BarChart2,
  AlertTriangle, Calendar, MapPin, RefreshCw, Hourglass,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  useMyTimesheet,
  useMyRota,
  useSubmitTimesheet,
  useUpdateTimesheetEntry,
  useUpsertTimesheetEntryForShift,
} from "../../hooks/useRota";
import { useTimeEntries } from "../../hooks/useTimeEntry";
import { usePractices } from "../../hooks/usePractice";
import {
  buildPracticeNameMap,
  resolvePracticeName,
  isWorkingShift,
} from "../../lib/practiceNames";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const statusColor: Record<string, string> = {
  draft:     "draft",
  submitted: "submitted",
  approved:  "approved",
  rejected:  "rejected",
};

const MONTHLY_STATUS: Record<string, { label: string, desc: string, cls: string, icon: React.ElementType }> = {
  draft: {
    label: "Draft — not submitted",
    desc: "Enter your actual start/end times for each shift, save, then submit the whole month.",
    cls: "border-slate-200 bg-slate-50 text-slate-700",
    icon: Clock,
  },
  submitted: {
    label: "Under review",
    desc: "Your hours are with Super Admin. You cannot edit until they approve or reject.",
    cls: "border-blue-200 bg-blue-50 text-blue-800",
    icon: Hourglass,
  },
  approved: {
    label: "Approved",
    desc: "This month’s working hours are confirmed. Totals below match what Finance will use.",
    cls: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected — please fix and resubmit",
    desc: "Update the rows below, save, then submit again.",
    cls: "border-rose-200 bg-rose-50 text-rose-800",
    icon: AlertTriangle,
  },
};

function calcHours(start: string, end: string) {
  if (!start || !end) return null;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = eh * 60 + em - (sh * 60 + sm);
  return diff > 0 ? Math.round((diff / 60) * 100) / 100 : null;
}

function fmtDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short",
  });
}

function fmtTime(t: any) {
  if (!t) return "";
  return String(t).slice(0, 5);
}

function weekKey(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d.setDate(diff));
  return mon.toISOString().slice(0, 10);
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  Icon: React.ElementType;
  color?: string;
}

function StatCard({ label, value, sub, Icon, color = "text-slate-900" }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-slate-500" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
        <p className={`text-xl font-black leading-tight ${color}`}>{value}</p>
        {sub && <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

interface RowStatusBadgeProps {
  entry: any;
  monthlyStatus: string;
  editable: boolean;
}

function RowStatusBadge({ entry, monthlyStatus, editable }: RowStatusBadgeProps) {
  if (monthlyStatus === "submitted") {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border bg-blue-50 text-blue-700 border-blue-200">
        Under review
      </span>
    );
  }
  if (monthlyStatus === "approved") {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
        Approved
      </span>
    );
  }
  const actual = entry.actual_hours ?? calcHours(entry.start_time, entry.end_time);
  if (actual == null || Number.isNaN(Number(actual))) {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border bg-amber-50 text-amber-700 border-amber-200">
        Incomplete
      </span>
    );
  }
  if (entry.entry_id) {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
        Saved
      </span>
    );
  }
  if (editable) {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border bg-slate-100 text-slate-600 border-slate-200">
        Ready to save
      </span>
    );
  }
  return <span className="text-gray-400 text-xs">—</span>;
}

export default function MyTimesheetPage() {
  const today = new Date();
  const [viewMode, setViewMode] = useState("all");
  const [cursor, setCursor] = useState({
    month: today.getMonth() + 1,
    year:  today.getFullYear(),
  });
  const [drafts, setDrafts] = useState<Record<string, any>>({});
  const [confirming, setConfirming] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");

  const rotaQuery = useMyRota(
    viewMode === "month" ? cursor.month : null,
    viewMode === "month" ? cursor.year : null
  );

  const timesheetAllQuery = useMyTimesheet(null, null);

  const timesheetMonthQuery = useMyTimesheet(cursor.month, cursor.year, {
    enabled: viewMode === "month" || confirming,
  });

  const timesheetMetaQuery =
    viewMode === "month" ? timesheetMonthQuery : timesheetAllQuery;

  const timeEntriesQuery = useTimeEntries({ limit: 200 });

  const { data: practicesData } = usePractices();
  const practiceMap = useMemo(
    () => buildPracticeNameMap(practicesData),
    [practicesData]
  );

  const updateEntry = useUpdateTimesheetEntry();
  const upsertShift = useUpsertTimesheetEntryForShift();
  const submit = useSubmitTimesheet();

  const isLoading = rotaQuery.isLoading || timesheetMetaQuery.isLoading;
  const error = rotaQuery.error || timesheetMetaQuery.error;

  const allShifts = useMemo(() => {
    const raw =
      rotaQuery.data?.shifts ??
      timesheetMetaQuery.data?.shifts ??
      rotaQuery.data?.rota ??
      [];
    return Array.isArray(raw) ? raw : [];
  }, [rotaQuery.data, timesheetMetaQuery.data]);

  const filteredShifts = useMemo(() => {
    if (viewMode !== "month") return allShifts.filter(isWorkingShift);
    return allShifts.filter((s: any) => {
      if (!isWorkingShift(s)) return false;
      const d = String(s.shift_date || s.date || "").slice(0, 10);
      if (!d) return false;
      const [y, m] = d.split("-").map(Number);
      return m === cursor.month && y === cursor.year;
    });
  }, [allShifts, viewMode, cursor.month, cursor.year]);

  const timesheet = useMemo(() => {
    if (viewMode === "month") {
      const payload = timesheetMonthQuery.data;
      if (!payload) return null;
      if (payload.timesheet) return payload.timesheet;
      const { entries: _e, shifts: _s, ...meta } = payload;
      return payload.id ? meta : null;
    }
    return null;
  }, [viewMode, timesheetMonthQuery.data]);

  const monthlyStatus = timesheet?.status || "draft";

  const monthEntries = useMemo(() => {
    if (viewMode !== "month") return [];
    return timesheetMonthQuery.data?.entries ?? [];
  }, [viewMode, timesheetMonthQuery.data]);

  const entryByKey = useMemo(() => {
    const m = new Map();
    monthEntries.forEach((e: any) => {
      const key = `${String(e.shift_date).slice(0, 10)}|${String(e.surgery_id || "")}`;
      m.set(key, e);
    });
    return m;
  }, [monthEntries]);

  const rows = useMemo(() => {
    if (viewMode !== "month") {
      return allShifts
        .filter(isWorkingShift)
        .map((shift: any) => {
          const dateStr = String(shift.shift_date || shift.date || "").slice(0, 10);
          return {
            id: shift.id,
            shift_date: dateStr,
            surgery_name: resolvePracticeName(shift, practiceMap),
            expected_hours: Number(shift.expected_hours ?? shift.hours ?? 0),
            start_time: shift.start_time || "",
            end_time: shift.end_time || "",
            hourly_rate: shift.hourly_rate,
            clinical_system: shift.clinical_system,
            is_cover: !!shift.is_cover,
          };
        })
        .sort((a, b) => String(b.shift_date).localeCompare(String(a.shift_date)));
    }

    const timeEntries = Array.isArray(timeEntriesQuery.data) ? timeEntriesQuery.data : [];
    const timeEntryMap: Record<string, any> = {};
    timeEntries.forEach((entry: any) => {
      const shiftId = entry.shiftId ?? entry.shift_id ?? entry.shift?.id;
      if (shiftId) timeEntryMap[shiftId] = entry;
    });

    return filteredShifts.map((shift: any) => {
      const dateStr = String(shift.shift_date || shift.date || "").slice(0, 10);
      const surgeryId = shift.surgery_id || shift.practice_id || "";
      const te = entryByKey.get(`${dateStr}|${String(surgeryId)}`);
      const clock = timeEntryMap[shift.id] || {};
      const draft = drafts[shift.id] || {};

      return {
        id: shift.id,
        shift_id: shift.id,
        entry_id: te?.id || null,
        shift_date: dateStr,
        surgery_name: resolvePracticeName(shift, practiceMap),
        expected_hours: Number(
          te?.expected_hours ?? shift.expected_hours ?? shift.hours ?? shift.total_hours ?? 0
        ),
        start_time: draft.start_time ?? te?.start_time ?? clock.start_time ?? shift.start_time ?? "",
        end_time: draft.end_time ?? te?.end_time ?? clock.end_time ?? shift.end_time ?? "",
        notes: draft.notes ?? te?.notes ?? clock.notes ?? shift.notes ?? "",
        actual_hours: te?.actual_hours ?? clock.actual_hours ?? null,
        hourly_rate: shift.hourly_rate,
        clinical_system: shift.clinical_system || shift.service_code,
        is_cover: !!shift.is_cover || te?.is_cover,
        ...(draft),
      };
    });
  }, [
    viewMode,
    allShifts,
    filteredShifts,
    timeEntriesQuery.data,
    drafts,
    practiceMap,
    entryByKey,
  ]);

  const timesheetHistory = useMemo(() => {
    const list = timesheetAllQuery.data?.timesheets;
    return Array.isArray(list) ? list : [];
  }, [timesheetAllQuery.data]);

  const isDraft = monthlyStatus === "draft" || monthlyStatus === "rejected";
  const isApproved = monthlyStatus === "approved";
  const isSubmitted = monthlyStatus === "submitted";
  const hoursLocked = isApproved || isSubmitted;
  const timesheetReadOnly = true;

  const missingRows =
    viewMode === "month"
      ? rows.filter((r) => {
          const actual = r.actual_hours ?? calcHours(r.start_time, r.end_time);
          return actual == null || Number.isNaN(Number(actual));
        })
      : [];

  const canSubmit =
    !timesheetReadOnly && viewMode === "month" && isDraft && rows.length > 0 && missingRows.length === 0;

  const totalExpected = rows.reduce((s, r) => s + Number(r.expected_hours || 0), 0);
  const totalActual = rows.reduce(
    (s, r) => s + Number(r.actual_hours ?? calcHours(r.start_time, r.end_time) ?? 0),
    0
  );
  const fte = totalExpected > 0 ? (totalActual / 37.5).toFixed(2) : "—";

  const weeklyBreakdown = useMemo(() => {
    if (!isApproved && !isSubmitted) return [];
    const map = new Map();
    rows.forEach((r) => {
      const wk = weekKey(r.shift_date);
      const prev = map.get(wk) || { shifts: 0, hours: 0 };
      map.set(wk, {
        shifts: prev.shifts + 1,
        hours: prev.hours + Number(r.actual_hours ?? calcHours(r.start_time, r.end_time) ?? 0),
      });
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [rows, isApproved, isSubmitted]);

  const statusCfg = MONTHLY_STATUS[monthlyStatus] || MONTHLY_STATUS.draft;
  const StatusIcon = statusCfg.icon;

  const moveMonth = (delta: number) => {
    const next = new Date(cursor.year, cursor.month - 1 + delta, 1);
    setCursor({ month: next.getMonth() + 1, year: next.getFullYear() });
    setDrafts({});
    setSubmitError("");
  };

  const goToday = () => {
    setCursor({ month: today.getMonth() + 1, year: today.getFullYear() });
    setDrafts({});
    setSubmitError("");
  };

  const monthLabel =
    viewMode === "all"
      ? "All time"
      : `${MONTHS[cursor.month - 1]} ${cursor.year}`;

  const isCurrentMonth =
    cursor.month === today.getMonth() + 1 && cursor.year === today.getFullYear();

  const setRow = (id: string, key: string, val: any) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), [key]: val } }));

  const persistRow = async (entry: any) => {
    const actual = entry.actual_hours ?? calcHours(entry.start_time, entry.end_time);
    const payload = {
      actual_hours: actual == null ? null : Number(actual),
      start_time: entry.start_time || "",
      end_time: entry.end_time || "",
      notes: entry.notes || "",
    };
    if (entry.entry_id) {
      await updateEntry.mutateAsync({ entryId: entry.entry_id, data: payload });
    } else {
      await upsertShift.mutateAsync({
        shiftId: entry.shift_id || entry.id,
        data: payload,
      });
    }
    await timesheetMonthQuery.refetch();
  };

  const saveRow = async (entry: any) => {
    if (viewMode !== "month" || hoursLocked) return;
    const actual = entry.actual_hours ?? calcHours(entry.start_time, entry.end_time);
    if (actual == null || Number.isNaN(Number(actual))) return;
    setSavingId(entry.id);
    try {
      await persistRow(entry);
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[entry.id];
        return next;
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleSubmit = async () => {
    setSubmitError("");
    try {
      for (const row of rows) {
        const actual = row.actual_hours ?? calcHours(row.start_time, row.end_time);
        if (actual != null && !Number.isNaN(Number(actual))) await persistRow(row);
      }
      const refreshed = await timesheetMonthQuery.refetch();
      const payload: any = refreshed.data;
      const tsId =
        payload?.timesheet?.id ??
        timesheet?.id ??
        (payload?.id && !payload?.entries ? payload.id : null);
      if (!tsId) {
        setSubmitError("Could not find timesheet for this month. Please refresh and try again.");
        return;
      }
      await submit.mutateAsync(tsId);
      setConfirming(false);
      setDrafts({});
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Submit failed. Ensure every shift has start and end times saved.";
      setSubmitError(msg);
    }
  };

  return (
    <div className="space-y-5 pb-10 max-w-full mx-auto px-1 overflow-x-hidden">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            My Timesheet
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Assigned hours view only. Use <strong>Enter My Hours</strong> to submit actual worked time.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                viewMode === "month" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Assigned hours
            </button>
            <button
              type="button"
              onClick={() => setViewMode("all")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                viewMode === "all" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              All shifts (history)
            </button>
          </div>

          {viewMode === "month" && (
            <>
              <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <button
                  onClick={() => moveMonth(-1)}
                  className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 border-r border-slate-200"
                >
                  <ChevronLeft size={15} className="text-slate-600" />
                </button>
                <span className="px-4 text-sm font-bold text-slate-800 min-w-[140px] text-center">
                  {monthLabel}
                </span>
                <button
                  onClick={() => moveMonth(1)}
                  className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 border-l border-slate-200"
                >
                  <ChevronRight size={15} className="text-slate-600" />
                </button>
              </div>
              {!isCurrentMonth && (
                <button
                  type="button"
                  onClick={goToday}
                  className="text-xs font-semibold text-blue-600 px-3 py-2 rounded-xl hover:bg-blue-50 border border-blue-200"
                >
                  This month
                </button>
              )}
            </>
          )}

          <button
            onClick={() => {
              rotaQuery.refetch();
              timesheetMetaQuery.refetch();
              timeEntriesQuery.refetch();
            }}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-sm"
            title="Refresh"
          >
            <RefreshCw size={14} className="text-slate-500" />
          </button>

          {viewMode === "month" && !timesheetReadOnly && (
            <Button
              disabled={!canSubmit || submit.isLoading}
              onClick={() => setConfirming(true)}
              title={
                missingRows.length > 0
                  ? `Complete ${missingRows.length} shift(s) first (start + end time)`
                  : "Send this month to Super Admin for approval"
              }
            >
              <Send size={14} />
              {submit.isLoading ? "Submitting…" : "Submit to Admin"}
            </Button>
          )}
        </div>
      </div>

      {/* How it works — month view only */}
      {viewMode === "month" && isDraft && !timesheetReadOnly && (
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4">
          <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-3">
            How to submit your hours
          </p>
          <ol className="grid sm:grid-cols-3 gap-3 text-sm text-slate-700">
            <li className="flex gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">1</span>
              <span>For each shift, enter <strong>Start</strong> and <strong>End</strong> time (your real worked hours).</span>
            </li>
            <li className="flex gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">2</span>
              <span>Click <strong>Save</strong> on each row (or they save when you leave the field).</span>
            </li>
            <li className="flex gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">3</span>
              <span>Click <strong>Submit to Admin</strong> — status becomes <em>Under review</em> until approved.</span>
            </li>
          </ol>
        </div>
      )}

      {/* Monthly status banner */}
      {viewMode === "month" && (
        <div className={`flex items-start gap-3 rounded-2xl border px-5 py-4 ${statusCfg.cls}`}>
          <StatusIcon size={20} className="shrink-0 mt-0.5 opacity-80" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold">{statusCfg.label}</span>
              {timesheet?.status && (
                <Badge color={statusColor[timesheet.status] || "draft"}>
                  {timesheet.status}
                </Badge>
              )}
            </div>
            <p className="text-sm mt-1 opacity-90">{statusCfg.desc}</p>
            {isApproved && (
              <p className="text-sm font-semibold mt-2">
                {rows.length} shift{rows.length !== 1 ? "s" : ""} approved · {totalActual.toFixed(2)}h actual · {totalExpected.toFixed(2)}h expected
              </p>
            )}
            {timesheet?.submitted_at && isSubmitted && (
              <p className="text-xs mt-1 opacity-75">
                Submitted {new Date(timesheet.submitted_at).toLocaleString("en-GB")}
              </p>
            )}
            {timesheet?.approved_at && isApproved && (
              <p className="text-xs mt-1 opacity-75">
                Approved {new Date(timesheet.approved_at).toLocaleString("en-GB")}
              </p>
            )}
          </div>
        </div>
      )}

      {monthlyStatus === "rejected" && timesheet?.rejection_reason && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <div>
            <strong>Rejection reason:</strong> {timesheet.rejection_reason}
          </div>
        </div>
      )}

      {submitError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {(error as any) && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {(error as any).message || "Failed to load timesheet data."}
        </div>
      )}

      {/* Weekly breakdown when approved / under review */}
      {viewMode === "month" && weeklyBreakdown.length > 0 && (isApproved || isSubmitted) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-3">
            {isApproved ? "Approved hours by week" : "Submitted hours by week"}
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {weeklyBreakdown.map(([wk, data]) => (
              <div key={wk} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Week from</p>
                <p className="text-sm font-bold text-gray-800">{fmtDate(wk)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {data.shifts} shift{data.shifts !== 1 ? "s" : ""} · {data.hours.toFixed(2)}h
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submission history — all view */}
      {viewMode === "all" && timesheetHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 text-sm font-bold text-slate-700">
            Monthly submission history
          </div>
          <div className="divide-y divide-slate-100">
            {timesheetHistory.map((ts: any) => (
              <button
                key={ts.id}
                type="button"
                onClick={() => {
                  setViewMode("month");
                  setCursor({ month: ts.month, year: ts.year });
                }}
                className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-semibold text-slate-800">
                  {MONTHS[ts.month - 1]} {ts.year}
                </span>
                <Badge color={statusColor[ts.status] || "draft"}>
                  {ts.status === "submitted" ? "Under review" : ts.status}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {rows.length > 0 && viewMode === "month" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Shifts" value={rows.length} sub="this month" Icon={Calendar} />
          <StatCard label="Expected" value={`${totalExpected.toFixed(2)}h`} Icon={Clock} />
          <StatCard
            label="Your hours"
            value={totalActual > 0 ? `${totalActual.toFixed(2)}h` : "—"}
            Icon={CheckCircle2}
            color={totalActual > 0 ? "text-emerald-700" : "text-slate-400"}
          />
          <StatCard label="FTE" value={fte} sub="37.5h/wk" Icon={BarChart2} />
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="section-header flex items-center justify-between !py-3.5 !px-5 !rounded-none !border-0 !shadow-none border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-gray-500" />
            <span className="text-sm font-bold text-gray-800">
              {viewMode === "month" ? `${monthLabel} — enter your hours` : "All assigned shifts"}
            </span>
          </div>
          {missingRows.length > 0 && (
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              {missingRows.length} shift{missingRows.length > 1 ? "s" : ""} need hours
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="table-header bg-gray-50 border-b border-gray-200">
              <tr>
                {(viewMode === "month"
                  ? ["Date", "Practice", "Expected", "Actual Hours", "Status", "Actions"]
                  : ["Date", "Practice", "Expected", "Scheduled", "Rate", "System"]
                ).map((h) => (
                  <th
                    key={h || "actions"}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading && (
                <tr>
                  <td colSpan={viewMode === "month" ? 6 : 11} className="px-4 py-12 text-center text-gray-500 text-sm">
                    Loading…
                  </td>
                </tr>
              )}

              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={viewMode === "month" ? 6 : 11} className="px-4 py-16 text-center text-slate-500 text-sm">
                    No working shifts found{viewMode === "month" ? ` for ${monthLabel}` : ""}.
                  </td>
                </tr>
              )}

              {!isLoading &&
                rows.map((entry) => {
                  const actual =
                    entry.actual_hours ?? calcHours(entry.start_time, entry.end_time);
                  const editable = viewMode === "month" && !timesheetReadOnly && isDraft && !hoursLocked;
                  const expanded = !!drafts?.[entry.id]?.expanded;

                  if (viewMode === "all") {
                    return (
                      <tr key={entry.id} className="hover:bg-slate-50/40">
                        <td className="px-4 py-3 text-xs font-semibold text-gray-800">{fmtDate(entry.shift_date)}</td>
                        <td className="px-4 py-3 text-xs text-gray-800">{entry.surgery_name}</td>
                        <td className="px-4 py-3 text-xs text-gray-800">{Number(entry.expected_hours || 0).toFixed(2)}h</td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-500">
                          {entry.start_time && entry.end_time
                            ? `${fmtTime(entry.start_time)} – ${fmtTime(entry.end_time)}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {entry.hourly_rate ? `£${entry.hourly_rate}/hr` : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{entry.clinical_system || "—"}</td>
                      </tr>
                    );
                  }

                  return (
                    <React.Fragment key={entry.id}>
                      <tr className={entry.is_cover ? "bg-amber-50/50" : "hover:bg-slate-50/30"}>
                        <td className="px-4 py-3 text-xs font-semibold text-gray-800 whitespace-nowrap">
                          {fmtDate(entry.shift_date)}
                        </td>
                        <td className="px-4 py-3 text-xs max-w-[220px] truncate text-gray-800">
                          <span className="flex items-center gap-1">
                            <MapPin size={11} className="text-gray-400 shrink-0" />
                            {entry.surgery_name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-800 whitespace-nowrap">
                          {Number(entry.expected_hours || 0).toFixed(2)}h
                        </td>
                        <td className="px-4 py-3">
                          {editable ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                inputMode="decimal"
                                step="0.25"
                                min="0"
                                value={entry.actual_hours ?? ""}
                                onChange={(e) => setRow(entry.id, "actual_hours", e.target.value)}
                                placeholder="e.g. 7.5"
                                className="rounded-lg border border-slate-200 px-2 py-2 text-xs w-[110px] min-h-11 sm:min-h-0"
                              />
                              <span className="text-[11px] text-gray-500 whitespace-nowrap">hours</span>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-gray-800">
                              {actual != null ? `${Number(actual).toFixed(2)}h` : "—"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <RowStatusBadge entry={entry} monthlyStatus={monthlyStatus} editable={editable} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {editable && (
                              <button
                                type="button"
                                onClick={() => saveRow(entry)}
                                disabled={savingId === entry.id}
                                className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-2 text-[11px] font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-50 min-h-11 sm:min-h-0"
                                title="Save actual hours for this shift"
                              >
                                <Save size={11} />
                                {savingId === entry.id ? "Saving…" : "Save"}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setRow(entry.id, "expanded", !expanded)}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50 min-h-11 sm:min-h-0"
                            >
                              {expanded ? "Hide" : "Details"}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expanded && (
                        <tr className="bg-white">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
                                  Start time (optional)
                                </p>
                                <input
                                  type="time"
                                  value={entry.start_time || ""}
                                  onChange={(e) => setRow(entry.id, "start_time", e.target.value)}
                                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono min-h-11 sm:min-h-0"
                                  disabled={!editable}
                                />
                              </div>
                              <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
                                  End time (optional)
                                </p>
                                <input
                                  type="time"
                                  value={entry.end_time || ""}
                                  onChange={(e) => setRow(entry.id, "end_time", e.target.value)}
                                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono min-h-11 sm:min-h-0"
                                  disabled={!editable}
                                />
                              </div>
                              <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
                                  Notes (optional)
                                </p>
                                <input
                                  value={entry.notes || ""}
                                  onChange={(e) => setRow(entry.id, "notes", e.target.value)}
                                  placeholder="Note…"
                                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs min-h-11 sm:min-h-0"
                                  disabled={!editable}
                                />
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-3">
                              Expected: {Number(entry.expected_hours || 0).toFixed(2)}h
                              {entry.hourly_rate ? ` · Rate: £${entry.hourly_rate}/hr` : ""}
                              {entry.clinical_system ? ` · System: ${entry.clinical_system}` : ""}
                            </p>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
            </tbody>

            {viewMode === "month" && !isLoading && rows.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200">
                  <td colSpan={2} className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Month total
                  </td>
                  <td className="px-4 py-3 font-bold text-xs">{totalExpected.toFixed(2)}h</td>
                  <td className="px-4 py-3 font-black">{totalActual.toFixed(2)}h</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {viewMode === "all" && (
        <p className="text-center text-sm text-slate-500">
          This page is read-only for assigned shifts. Enter worked time from <strong>Enter My Hours</strong>.
        </p>
      )}

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">Submit hours to Super Admin?</h2>
            <p className="mt-2 text-sm text-slate-600">
              Your <strong>{monthLabel}</strong> timesheet ({rows.length} shifts, {totalActual.toFixed(2)}h actual)
              will be sent for review. Status will show as <strong>Under review</strong> until approved or rejected.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirming(false)}>Cancel</Button>
              <Button onClick={handleSubmit} isLoading={submit.isLoading}>
                <Send size={14} /> Confirm submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


