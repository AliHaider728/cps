import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useClinicianLeave } from "../../../../hooks/useClinicianLeave";
import { useClinicianRota } from "../../../../hooks/useRota";
import { usePractices } from "../../../../hooks/usePractice";
import { useTimeEntries, useActiveTimeEntry } from "../../../../hooks/useTimeEntry";
import { apiClient } from "../../../../services/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ShiftDetailModal from "../../../super-admin/RotaManagement/ShiftDetailModal";
import {
  ChevronLeft, ChevronRight, Calendar, List,
  Clock, MapPin, AlertTriangle,
  Briefcase, Umbrella, Thermometer, BookOpen,
  UserPlus, XCircle, BarChart2, Timer, Activity,
  Zap, FileText, CheckCircle2, X, TrendingUp,
} from "lucide-react";

/* ── Status configs ─────────────────────────────────── */
const STATUS_CONFIG = {
  working:      { bg: "bg-blue-500",   light: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   label: "Working",      Icon: Briefcase     },
  annual_leave: { bg: "bg-yellow-400", light: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", label: "Annual Leave", Icon: Umbrella      },
  sick:         { bg: "bg-orange-500", light: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", label: "Sick",         Icon: Thermometer   },
  cppe:         { bg: "bg-green-500",  light: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  label: "CPPE",         Icon: BookOpen      },
  cover:        { bg: "bg-purple-500", light: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", label: "Cover",        Icon: UserPlus      },
  gap:          { bg: "bg-red-500",    light: "bg-red-50",    text: "text-red-700",    border: "border-red-200",    label: "Gap",          Icon: AlertTriangle },
  cancelled:    { bg: "bg-slate-400",  light: "bg-slate-50",  text: "text-slate-500",  border: "border-slate-200",  label: "Cancelled",    Icon: XCircle       },
};

const TIMESHEET_STATUS = {
  draft:     { cls: "bg-slate-100 text-slate-600 border-slate-200",      label: "Draft"     },
  submitted: { cls: "bg-blue-50 text-blue-700 border-blue-200",          label: "Submitted" },
  approved:  { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Approved"  },
  rejected:  { cls: "bg-rose-50 text-rose-700 border-rose-200",          label: "Rejected"  },
};

const getStatus        = (s) => STATUS_CONFIG[s] || STATUS_CONFIG.cancelled;
const MONTHS           = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS             = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const fmtTime          = (t) => { if (!t) return ""; return String(t).slice(0, 5); };
const fmtHours         = (start, end) => {
  if (!start || !end) return null;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = ((eh * 60 + em) - (sh * 60 + sm)) / 60;
  return diff > 0 ? Math.round(diff * 100) / 100 : null;
};
const formatLiveDuration = (startIso) => {
  if (!startIso) return "00:00:00";
  const diffMs = Date.now() - new Date(startIso).getTime();
  const h = Math.floor(diffMs / 3_600_000);
  const m = Math.floor((diffMs % 3_600_000) / 60_000);
  const s = Math.floor((diffMs % 60_000) / 1_000);
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
};
const deriveStats = (shifts) => {
  let working = 0, leave = 0, sick = 0, cppe = 0, cover = 0, gaps = 0, totalHours = 0;
  shifts.forEach((s) => {
    const h = fmtHours(s.start_time, s.end_time) ?? s.hours ?? 0;
    switch (s.status) {
      case "working":      working++;   totalHours += h; break;
      case "annual_leave": leave++;     break;
      case "sick":         sick++;      break;
      case "cppe":         cppe++;      break;
      case "cover":        cover++;     totalHours += h; break;
      case "gap":          gaps++;      break;
      default: break;
    }
  });
  return { working, leave, sick, cppe, cover, gaps, totalHours: Math.round(totalHours * 10) / 10 };
};

const usePracticeMap = () => {
  const { data } = usePractices?.() ?? {};
  return useMemo(() => {
    const list = data?.data || data?.practices || data || [];
    const map  = new Map();
    if (Array.isArray(list)) {
      list.forEach((p) => {
        if (p?.id)       map.set(String(p.id),       p.name || p.practiceName || p.practice_name || "");
        if (p?._id)      map.set(String(p._id),      p.name || p.practiceName || p.practice_name || "");
        if (p?.ods_code) map.set(String(p.ods_code), p.name || "");
      });
    }
    return map;
  }, [data]);
};

const shortId = (id) => {
  if (!id) return "—";
  const s = String(id);
  if (/^[A-Z][0-9]{5}$/.test(s)) return s;
  return s.length > 12 ? `…${s.slice(-8)}` : s;
};

/* ── Hooks ─────────────────────────────────────────── */
function useClinicianTimeEntriesAdmin(clinicianId) {
  return useQuery({
    queryKey: ["time-entries", "admin", clinicianId],
    queryFn:  () =>
      apiClient
        .get(`/time-entries/admin/clinician/${clinicianId}`)
        .then((r) => r.data?.data ?? { entries: [], is_clocked_in: false, active_since: null }),
    enabled:         !!clinicianId,
    refetchInterval: 30_000,
  });
}

function useClinicianTimesheetAdmin(clinicianId, month, year) {
  return useQuery({
    queryKey: ["timesheet", "admin", clinicianId, month, year],
    queryFn:  () =>
      apiClient
        .get(`/timesheets/clinician/${clinicianId}`, { params: { month, year } })
        .then((r) => r.data?.data ?? r.data ?? null),
    enabled: !!clinicianId && !!month && !!year,
  });
}

function useApproveTimesheet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.post(`/timesheets/${id}/approve`).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["timesheet"] }),
  });
}

function useRejectTimesheet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) =>
      apiClient.post(`/timesheets/${id}/reject`, { rejection_reason: reason }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["timesheet"] }),
  });
}

/* ── DiffBadge ──────────────────────────────────────── */
function DiffBadge({ expected, actual }) {
  if (actual == null || expected == null) return <span className="text-slate-300 text-xs">—</span>;
  const diff = Math.round((parseFloat(actual) - parseFloat(expected)) * 100) / 100;
  const abs  = Math.abs(diff);
  const cls  = abs < 0.01
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : abs <= 1
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-rose-50 text-rose-700 border-rose-200";
  const sign = diff >= 0 ? "+" : "";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-[11px] font-bold ${cls}`}>
      {sign}{diff.toFixed(2)}h
    </span>
  );
}

/* ════════════════════════════════════════════════════
   TIMESHEET VIEW
   Shows expected vs actual hours per shift.
   Admin can Approve or Reject submitted timesheets.
   ════════════════════════════════════════════════════ */
function TimesheetView({ clinicianId, month, year, canManage }) {
  const { data, isLoading, isError } = useClinicianTimesheetAdmin(clinicianId, month, year);
  const approveMut   = useApproveTimesheet();
  const rejectMut    = useRejectTimesheet();
  const [rejectModal, setRejectModal] = useState(false);
  const [reason, setReason]           = useState("");
  const [actionMsg, setActionMsg]     = useState("");

  const timesheet = data?.timesheet ?? data;
  const entries   = data?.entries   ?? [];

  const status    = timesheet?.status || "draft";
  const statusCfg = TIMESHEET_STATUS[status] || TIMESHEET_STATUS.draft;
  const canAct    = canManage && status === "submitted";

  const totalExpected = entries.reduce((s, e) => s + parseFloat(e.expected_hours || 0), 0);
  const totalActual   = entries.reduce((s, e) => s + parseFloat(e.actual_hours   || 0), 0);
  const fte           = (totalActual / 37.5).toFixed(2);

  const handleApprove = async () => {
    if (!window.confirm("Approve this timesheet?")) return;
    try {
      await approveMut.mutateAsync(timesheet.id);
      setActionMsg("✅ Timesheet approved successfully.");
    } catch {
      setActionMsg("❌ Approval failed. Please try again.");
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) return;
    try {
      await rejectMut.mutateAsync({ id: timesheet.id, reason });
      setRejectModal(false);
      setReason("");
      setActionMsg("Timesheet rejected and clinician notified.");
    } catch {
      setActionMsg("❌ Rejection failed. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-sm text-slate-400">
        <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-blue-500 animate-spin" />
        Loading timesheet…
      </div>
    );
  }

  if (isError || !timesheet) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm">
        <FileText size={32} className="mx-auto mb-2 opacity-30" />
        No timesheet found for {MONTHS[month - 1]} {year}.
        <p className="text-xs mt-1 opacity-60">
          Clinician hasn't submitted a timesheet yet, or no rota shifts exist this month.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Status banner */}
      <div className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${statusCfg.cls}`}>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${statusCfg.cls}`}>
            {statusCfg.label}
          </span>
          {timesheet.submitted_at && (
            <span className="text-xs font-normal opacity-70">
              Submitted {new Date(timesheet.submitted_at).toLocaleDateString("en-GB")}
            </span>
          )}
        </div>
        {timesheet.approved_at && (
          <span className="text-xs opacity-70">
            Approved {new Date(timesheet.approved_at).toLocaleDateString("en-GB")}
          </span>
        )}
      </div>

      {/* Rejection reason */}
      {status === "rejected" && timesheet.rejection_reason && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span><strong>Rejection reason:</strong> {timesheet.rejection_reason}</span>
        </div>
      )}

      {/* Action message */}
      {actionMsg && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-medium">
          {actionMsg}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Expected",   value: `${totalExpected.toFixed(2)}h`, icon: Clock        },
          { label: "Actual",     value: `${totalActual.toFixed(2)}h`,   icon: CheckCircle2 },
          { label: "Difference", value: `${(totalActual - totalExpected).toFixed(2)}h`, icon: TrendingUp },
          { label: "FTE",        value: fte,                             icon: BarChart2    },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-3 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Icon size={11} className="text-slate-400" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            </div>
            <p className="text-lg font-black text-slate-800">{value}</p>
          </div>
        ))}
      </div>

      {/* Entries table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Date","Surgery","Expected","Start","End","Actual","Difference","Notes","Cover"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {entries.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-slate-400 text-sm italic">
                  No shift entries found. Make sure shifts are seeded and rota is set up for this month.
                </td>
              </tr>
            )}
            {entries.map((entry) => (
              <tr
                key={entry.id}
                className={`transition-colors ${entry.is_cover ? "bg-amber-50/60" : "hover:bg-slate-50/40"}`}
              >
                <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap text-xs">
                  {new Date(entry.shift_date + "T00:00:00").toLocaleDateString("en-GB", {
                    weekday: "short", day: "numeric", month: "short",
                  })}
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">
                  {entry.surgery_name || "—"}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs font-medium">
                  {Number(entry.expected_hours || 0).toFixed(2)}h
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs font-mono">
                  {fmtTime(entry.start_time) || <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs font-mono">
                  {fmtTime(entry.end_time) || <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-3 text-sm font-black text-slate-900 whitespace-nowrap">
                  {entry.actual_hours != null
                    ? `${Number(entry.actual_hours).toFixed(2)}h`
                    : <span className="text-slate-300 font-normal text-xs">—</span>}
                </td>
                <td className="px-4 py-3">
                  <DiffBadge expected={entry.expected_hours} actual={entry.actual_hours} />
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 max-w-[140px] truncate">
                  {entry.notes || <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  {entry.is_cover && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-amber-50 text-amber-700 border-amber-200">
                      Cover
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          {entries.length > 0 && (
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
                  {totalActual.toFixed(2)}h
                </td>
                <td className="px-4 py-3">
                  <DiffBadge expected={totalExpected} actual={totalActual} />
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Approve / Reject buttons */}
      {canAct && (
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => setRejectModal(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-100 transition-all active:scale-[0.98]"
          >
            <X size={14} /> Reject
          </button>
          <button
            onClick={handleApprove}
            disabled={approveMut.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-100 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            <CheckCircle2 size={14} />
            {approveMut.isPending ? "Approving…" : "Approve"}
          </button>
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-base font-bold text-slate-900 mb-1">Reject Timesheet</h2>
            <p className="text-sm text-slate-500 mb-4">
              Provide a reason — clinician will see this and can re-submit.
            </p>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason is required…"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 resize-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { setRejectModal(false); setReason(""); }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!reason.trim() || rejectMut.isPending}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {rejectMut.isPending ? "Rejecting…" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── ActiveShiftCard ────────────────────────────────── */
function ActiveShiftCard({ clinicianId, isOwnDashboard }) {
  const intervalRef = useRef(null);
  const [liveDisplay, setLiveDisplay] = useState("00:00:00");

  const adminQ = useClinicianTimeEntriesAdmin(isOwnDashboard ? null : clinicianId);
  const selfQ  = useActiveTimeEntry();

  const isClockedIn = isOwnDashboard ? !!selfQ.data : (adminQ.data?.is_clocked_in ?? false);
  const activeSince = isOwnDashboard ? selfQ.data?.clock_in : adminQ.data?.active_since;
  const rawEntries  = isOwnDashboard ? [] : (adminQ.data?.entries ?? []);

  const selfEntriesQ = useTimeEntries({ limit: 50 });
  const selfEntries  = useMemo(() => {
    const d = selfEntriesQ.data;
    return Array.isArray(d) ? d : (d?.entries ?? []);
  }, [selfEntriesQ.data]);

  const entries = isOwnDashboard ? selfEntries : rawEntries;
  const now     = new Date();

  const monthlyHours = useMemo(() =>
    entries
      .filter((e) => {
        if (e.status !== "completed") return false;
        const d = new Date(e.clock_in);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((sum, e) => sum + Number(e.actual_hours || 0), 0)
      .toFixed(1),
    [entries]
  );

  const completedThisMonth = entries.filter((e) => {
    if (e.status !== "completed") return false;
    const d = new Date(e.clock_in);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  useEffect(() => {
    if (activeSince) {
      setLiveDisplay(formatLiveDuration(activeSince));
      intervalRef.current = setInterval(() => setLiveDisplay(formatLiveDuration(activeSince)), 1000);
    } else {
      clearInterval(intervalRef.current);
      setLiveDisplay("00:00:00");
    }
    return () => clearInterval(intervalRef.current);
  }, [activeSince]);

  if (!isClockedIn && monthlyHours === "0.0" && completedThisMonth === 0) return null;

  return (
    <div className={`rounded-2xl border overflow-hidden ${isClockedIn ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
      <div className={`px-4 py-3 flex items-center justify-between border-b ${isClockedIn ? "border-emerald-200 bg-emerald-100/50" : "border-slate-100 bg-slate-50"}`}>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isClockedIn ? "bg-emerald-600" : "bg-slate-400"}`}>
            <Timer size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{isClockedIn ? "Shift In Progress" : "Shift Activity"}</p>
            <p className="text-xs text-slate-400">Time tracking overview</p>
          </div>
        </div>
        {isClockedIn && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live
          </div>
        )}
      </div>
      <div className="p-4">
        {isClockedIn && (
          <div className="mb-4 p-4 rounded-xl bg-white border border-emerald-200 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Current Session</p>
            <p className="font-mono text-4xl font-black text-slate-900 tracking-tight tabular-nums">{liveDisplay}</p>
            {activeSince && (
              <p className="text-xs text-slate-400 mt-2">
                Started at <span className="font-bold text-slate-600">
                  {new Date(activeSince).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </p>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Activity size={12} className="text-blue-500" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">This Month</p>
            </div>
            <p className="text-2xl font-black text-slate-800">{monthlyHours}<span className="text-xs font-normal text-slate-400 ml-1">hrs</span></p>
            <p className="text-[10px] text-slate-400 mt-0.5">{completedThisMonth} sessions</p>
          </div>
          <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Zap size={12} className="text-amber-500" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</p>
            </div>
            <p className={`text-sm font-black mt-1 ${isClockedIn ? "text-emerald-600" : "text-slate-400"}`}>
              {isClockedIn ? "Clocked In" : "Not Clocked In"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── LeaveCard ──────────────────────────────────────── */
function LeaveCard({ contract, data }) {
  const total     = Number(data?.total     ?? data?.totalDays     ?? 0);
  const used      = Number(data?.used      ?? data?.takenDays     ?? data?.taken ?? 0);
  const remaining = Number(data?.remaining ?? data?.remainingDays ?? (total - used));
  const pct       = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const isLow     = remaining <= 5 && total > 0;
  const COLORS    = {
    ARRS:   { bar: "bg-blue-500",    ring: "ring-blue-200",    accent: "text-blue-600"    },
    EA:     { bar: "bg-violet-500",  ring: "ring-violet-200",  accent: "text-violet-600"  },
    Direct: { bar: "bg-emerald-500", ring: "ring-emerald-200", accent: "text-emerald-600" },
  };
  const c = COLORS[contract] || COLORS.ARRS;
  return (
    <div className={`rounded-2xl border bg-white p-4 ring-1 ${c.ring} shadow-sm`}>
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
        <span className={`text-3xl font-black ${c.accent}`}>{remaining}</span>
        <span className="text-sm text-slate-400 mb-1">/ {total} days</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
        <div className={`h-full rounded-full transition-all duration-700 ${c.bar}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>Taken <strong className="text-slate-600">{used}d</strong></span>
        <span>Remaining <strong className="text-slate-600">{remaining}d</strong></span>
      </div>
    </div>
  );
}

function StatPill({ label, value, color = "bg-slate-100 text-slate-700" }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${color}`}>
      <span className="text-base font-black">{value}</span>
      <span className="opacity-70">{label}</span>
    </div>
  );
}

function DayCell({ day, isCurrentMonth, isToday, shifts = [], onClick }) {
  const primary = shifts[0];
  const cfg     = primary ? getStatus(primary.status) : null;
  const extra   = shifts.length - 1;
  return (
    <div
      onClick={() => primary && onClick(primary)}
      className={`relative min-h-[72px] rounded-xl border p-2 transition-all duration-150
        ${!isCurrentMonth ? "opacity-30 bg-slate-50/50 border-slate-100" : "bg-white border-slate-150"}
        ${isToday ? "ring-2 ring-blue-400 ring-offset-1 border-blue-300" : ""}
        ${primary ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""}
        ${cfg ? cfg.border : "border-slate-100"}`}
    >
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${isToday ? "bg-blue-500 text-white" : "text-slate-500"}`}>
        {day}
      </div>
      {primary && (
        <div className={`rounded-lg px-1.5 py-1 text-[10px] font-semibold leading-tight ${cfg.light} ${cfg.text}`}>
          <div className="flex items-center gap-1">{cfg.Icon && <cfg.Icon size={8} />}<span>{cfg.label}</span></div>
          {primary.start_time && <div className="opacity-70 mt-0.5">{fmtTime(primary.start_time)}–{fmtTime(primary.end_time)}</div>}
        </div>
      )}
      {extra > 0 && (
        <div className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full bg-slate-700 text-white text-[9px] font-bold flex items-center justify-center">
          +{extra}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   MAIN — CalendarPanel
   Props: clinicianId, canManage, userRole
   ════════════════════════════════════════════════════ */
export default function CalendarPanel({ clinicianId, canManage, userRole = "clinician" }) {
  const now      = useMemo(() => new Date(), []);
  const [month,  setMonth]   = useState(now.getMonth() + 1);
  const [year,   setYear]    = useState(now.getFullYear());
  const [view,   setView]    = useState("timesheet"); // default to timesheet tab
  const [selected, setSelected] = useState(null);

  const leaveQ      = useClinicianLeave(clinicianId);
  const rotaQ       = useClinicianRota(clinicianId, month, year);
  const practiceMap = usePracticeMap();

  const shifts    = rotaQ?.data?.data?.shifts ?? rotaQ?.data?.shifts ?? [];
  const balances  = leaveQ?.data?.balances    ?? leaveQ?.data?.data?.balances ?? [];
  const isLoading = rotaQ?.isLoading || leaveQ?.isLoading;

  const isOwnDashboard = userRole === "clinician";
  const readOnly       = isOwnDashboard || !canManage;

  const byContract = useMemo(() => {
    const map = { ARRS: {}, EA: {}, Direct: {} };
    (Array.isArray(balances) ? balances : []).forEach((b) => {
      const key = b?.contract || b?.contract_type;
      if (map[key]) map[key] = b;
    });
    return map;
  }, [balances]);

  const stats = useMemo(() => deriveStats(shifts), [shifts]);

  const shiftsByDate = useMemo(() => {
    const map = {};
    shifts.forEach((s) => {
      const key = String(s.date || "").slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return map;
  }, [shifts]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay  = new Date(year, month, 0);
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;
    const days = [];
    for (let i = startDow - 1; i >= 0; i--) days.push({ date: new Date(year, month - 1, -i), isCurrentMonth: false });
    for (let d = 1; d <= lastDay.getDate(); d++) days.push({ date: new Date(year, month - 1, d), isCurrentMonth: true });
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) days.push({ date: new Date(year, month, d), isCurrentMonth: false });
    return days;
  }, [month, year]);

  const getPracticeName = useCallback((shift) => {
    const id = shift?.practice_id;
    if (!id) return "—";
    const fromMap = practiceMap.get(String(id));
    if (fromMap) return fromMap;
    if (shift?.practice_name) return shift.practice_name;
    return shortId(id);
  }, [practiceMap]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };
  const isToday   = (d) => {
    const t = new Date();
    return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
  };

  const monthLabel = `${MONTHS[month - 1]} ${year}`;

  return (
    <div className="space-y-5">

      {/* ✅ FIX: Only render for clinician's own dashboard.
           Admin viewing someone else → skip (avoids 403 on /time-entries/active & /time-entries?limit=50) */}
      {isOwnDashboard && <ActiveShiftCard clinicianId={clinicianId} isOwnDashboard={isOwnDashboard} />}

      {/* Leave Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {["ARRS", "EA", "Direct"].map((c) => (
          <LeaveCard key={c} contract={c} data={byContract[c]} />
        ))}
      </div>

      {/* Main panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
              <ChevronLeft size={14} className="text-slate-600" />
            </button>
            <h2 className="text-base font-bold text-slate-800 min-w-[160px] text-center">{monthLabel}</h2>
            <button onClick={nextMonth} className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
              <ChevronRight size={14} className="text-slate-600" />
            </button>
            <button
              onClick={() => { setMonth(now.getMonth() + 1); setYear(now.getFullYear()); }}
              className="text-xs font-semibold text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors border border-blue-200"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-3">
            {view !== "timesheet" && (
              <div className="hidden md:flex items-center gap-1.5">
                {stats.working > 0    && <StatPill label="working" value={stats.working}    color="bg-blue-50 text-blue-700"     />}
                {stats.leave > 0      && <StatPill label="leave"   value={stats.leave}      color="bg-yellow-50 text-yellow-700" />}
                {stats.gaps > 0       && <StatPill label="gaps"    value={stats.gaps}       color="bg-red-50 text-red-700"       />}
                {stats.totalHours > 0 && <StatPill label="hrs"     value={stats.totalHours} color="bg-slate-100 text-slate-700"  />}
              </div>
            )}

            {/* View toggle — Calendar | List | Timesheet */}
            <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setView("calendar")}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${view === "calendar" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                <Calendar size={12} /> Calendar
              </button>
              <button
                onClick={() => setView("list")}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors border-x border-slate-200 ${view === "list" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                <List size={12} /> List
              </button>
              <button
                onClick={() => setView("timesheet")}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${view === "timesheet" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                <FileText size={12} /> Timesheet
              </button>
            </div>
          </div>
        </div>

        {/* ── TIMESHEET VIEW ── */}
        {view === "timesheet" && (
          <div className="p-5">
            <TimesheetView
              clinicianId={clinicianId}
              month={month}
              year={year}
              canManage={canManage}
            />
          </div>
        )}

        {/* ── LOADING (calendar/list) ── */}
        {view !== "timesheet" && isLoading && (
          <div className="flex items-center justify-center h-32 gap-2 text-sm text-slate-400">
            <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-blue-500 animate-spin" />
            Loading shifts…
          </div>
        )}

        {/* ── CALENDAR VIEW ── */}
        {!isLoading && view === "calendar" && (
          <div className="p-4">
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map((d) => (
                <div key={d} className={`text-center text-[11px] font-bold uppercase tracking-wider py-2 ${d === "Sat" || d === "Sun" ? "text-slate-400" : "text-slate-500"}`}>
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map(({ date, isCurrentMonth }, idx) => {
                const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
                return (
                  <DayCell
                    key={idx}
                    day={date.getDate()}
                    isCurrentMonth={isCurrentMonth}
                    isToday={isToday(date)}
                    shifts={shiftsByDate[key] || []}
                    onClick={setSelected}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-100">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <div className={`w-2.5 h-2.5 rounded-full ${cfg.bg}`} /> {cfg.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LIST VIEW ── */}
        {!isLoading && view === "list" && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Date","Status","Time","Hours","Practice","System","Rate"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shifts.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm">
                    <Calendar size={28} className="mx-auto mb-2 opacity-30" />
                    No shifts found for {monthLabel}
                  </td></tr>
                )}
                {shifts.map((s, i) => {
                  const cfg   = getStatus(s.status);
                  const h     = fmtHours(s.start_time, s.end_time) ?? s.hours;
                  return (
                    <tr key={s.id || i} onClick={() => setSelected(s)} className="hover:bg-slate-50/70 cursor-pointer transition-colors">
                      <td className="px-5 py-3 text-xs font-bold text-slate-800">{String(s.date || "").slice(0, 10)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.light} ${cfg.text} ${cfg.border}`}>
                          <cfg.Icon size={10} /> {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-600">
                        <div className="flex items-center gap-1"><Clock size={11} className="text-slate-400" />
                          {s.start_time ? `${fmtTime(s.start_time)} – ${fmtTime(s.end_time)}` : "—"}
                        </div>
                      </td>
                      <td className="px-5 py-3">{h ? <span className="text-xs font-bold text-slate-700">{h}h</span> : <span className="text-xs text-slate-300">—</span>}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5 max-w-[180px]">
                          <MapPin size={11} className="text-slate-400 shrink-0" />
                          <span className="text-xs text-slate-700 font-medium truncate">{getPracticeName(s)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {s.clinical_system ? <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{s.clinical_system}</span> : <span className="text-xs text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3">
                        {s.hourly_rate ? <span className="text-xs font-semibold text-emerald-700">£{s.hourly_rate}/hr</span> : <span className="text-xs text-slate-300">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {shifts.length > 0 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
                <span className="text-xs text-slate-500">{shifts.length} shift{shifts.length !== 1 ? "s" : ""} · {monthLabel}</span>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {stats.totalHours > 0 && <span className="flex items-center gap-1"><BarChart2 size={11} /><strong className="text-slate-700">{stats.totalHours}h</strong> total</span>}
                  {stats.gaps > 0 && <span className="flex items-center gap-1 text-red-600 font-semibold"><AlertTriangle size={11} />{stats.gaps} gap{stats.gaps !== 1 ? "s" : ""}</span>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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