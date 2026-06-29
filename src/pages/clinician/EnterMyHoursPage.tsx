import React, { useMemo, useState } from "react";
import { useAppSelector } from "../../hooks/redux";
import { useMyRota } from "../../hooks/useRota";
import { usePractice } from "../../hooks/usePractice";
import { useEnterMyHours, useSubmitEnterMyHours, useUpsertEnterMyHours } from "../../hooks/useEnterMyHours";
import { buildPracticeNameMap, isWorkingShift, resolvePracticeName } from "../../lib/practiceNames";
import {
  CalendarDays, Send, Save,
  Building2, ClipboardList, Loader2, ChevronRight
} from "lucide-react";

const now = new Date();
const defaultMonth = now.getMonth() + 1;
const defaultYear  = now.getFullYear();

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const toTime  = (v: any) => String(v || "").slice(0, 5);
const fmtDate = (v: any) => (v ? new Date(v).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—");

const calcHours = (startTime: any, endTime: any, breakMinutes: any) => {
  if (!startTime || !endTime) return "";
  const [sh, sm] = String(startTime).slice(0, 5).split(":").map(Number);
  const [eh, em] = String(endTime).slice(0, 5).split(":").map(Number);
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return "";
  const mins = eh * 60 + em - (sh * 60 + sm) - Number(breakMinutes || 0);
  if (mins < 0) return "";
  return (Math.round((mins / 60) * 100) / 100).toFixed(2);
};

const STATUS_STYLES: Record<string, string> = {
  draft:     "bg-gray-100 text-gray-600 border border-gray-200",
  approved:  "bg-green-50 text-green-700 border border-green-200",
  pending:   "bg-amber-50 text-amber-700 border border-amber-200",
  rejected:  "bg-red-50 text-red-700 border border-red-200",
  submitted: "bg-blue-50 text-blue-700 border border-blue-200",
};

interface StatusPillProps {
  value?: string;
}

const StatusPill: React.FC<StatusPillProps> = ({ value }) => {
  const key = String(value || "draft").toLowerCase();
  const cls = STATUS_STYLES[key] || STATUS_STYLES.draft;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${cls}`}>
      {String(value || "draft")}
    </span>
  );
};

export default function EnterMyHoursPage() {
  const user = useAppSelector((s: any) => s.auth.user);
  const [month, setMonth] = useState(defaultMonth);
  const [year,  setYear]  = useState(defaultYear);
  const [editing, setEditing]         = useState<Record<string, any>>({});
  const [savingShiftId, setSavingShiftId] = useState<string | null>(null);

  const { data: rotaData,      isLoading: rotaLoading } = useMyRota(month, year);
  // @ts-ignore
  const { data: practicesData }                          = usePractice();
  const { data: enteredRows = [], isLoading: rowsLoading } = useEnterMyHours(month, year);
  const upsertM = useUpsertEnterMyHours();
  const submitM = useSubmitEnterMyHours();

  // @ts-ignore
  const practiceMap = useMemo(() => buildPracticeNameMap(practicesData), [practicesData]);
  const rowsByShift = useMemo(() => {
    const map = new Map<string, any>();
    enteredRows.forEach((r: any) => { if (r?.shiftId) map.set(String(r.shiftId), r); });
    return map;
  }, [enteredRows]);

  const shifts = useMemo(() => {
    const raw = rotaData?.shifts || rotaData?.data?.shifts || (Array.isArray(rotaData) ? rotaData : []);
    return (Array.isArray(raw) ? raw : []).filter(isWorkingShift);
  }, [rotaData]);

  const onField = (shiftId: string, key: string, value: any) =>
    setEditing((prev) => ({ ...prev, [shiftId]: { ...(prev[shiftId] || {}), [key]: value } }));

  const onSave = async (shift: any) => {
    const sid      = String(shift.id || shift._id);
    const existing = rowsByShift.get(sid);
    const draft    = editing[sid] || {};
    const startTime            = toTime(draft.startTime           ?? existing?.startTime           ?? "");
    const endTime              = toTime(draft.endTime             ?? existing?.endTime             ?? "");
    const breakDurationMinutes = Number(draft.breakDurationMinutes ?? existing?.breakDurationMinutes ?? 0);
    const notes                = String(draft.notes               ?? existing?.notes               ?? "");

    setSavingShiftId(sid);
    try {
      await upsertM.mutateAsync({
        entryId: existing?._id,
        month, year, shiftId: sid,
        assignedShiftRef: sid,
        practiceId:   shift.practice_id || shift.surgery_id || "",
        practiceName: resolvePracticeName(shift, practiceMap),
        pcn:          shift.pcn_name || shift.pcn || "—",
        dateWorked:   String(shift.shift_date || shift.date || "").slice(0, 10),
        startTime, endTime, breakDurationMinutes, notes,
      });
      setEditing((prev) => ({ ...prev, [sid]: {} }));
    } finally {
      setSavingShiftId(null);
    }
  };

  const onSubmitMonth = async () => { await submitM.mutateAsync({ month, year }); };

  const isLoading = rotaLoading || rowsLoading;

  return (
    <div className="space-y-5 pb-12 px-1 animate-fade-up">

      {/* ── Page header ── */}
      <div
        className="card p-5 flex flex-wrap items-start justify-between gap-4"
        style={{ borderLeft: "4px solid #3b82f6" }}
      >
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
              }}
            >
              <ClipboardList size={16} className="text-white" />
            </div>
            <h1 className="page-title">Enter My Hours</h1>
          </div>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 ml-[2.875rem]">
            Record actual worked hours against your assigned shifts
          </p>
        </div>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            color: "#2563eb",
          }}
        >
          <CalendarDays size={13} />
          {MONTH_NAMES[month - 1]} {year}
        </div>
      </div>

      {/* ── Filters + Submit ── */}
      <div className="card p-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="field-label">Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="input w-36"
          >
            {MONTH_NAMES.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">Year</label>
          <input
            type="number" min="2020" max="2100"
            className="input w-28"
            value={year}
            onChange={(e) => setYear(Number(e.target.value || defaultYear))}
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="text-right">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Shifts loaded</p>
            <p className="text-lg font-black text-slate-800 dark:text-slate-200 leading-tight">{shifts.length}</p>
          </div>
          <button
            type="button"
            onClick={onSubmitMonth}
            disabled={submitM.isPending || shifts.length === 0}
            className="btn btn-primary"
          >
            {submitM.isPending
              ? <><Loader2 size={14} className="spin-arc" /> Submitting…</>
              : <><Send size={14} /> Submit Month for Approval</>}
          </button>
        </div>
      </div>

      {/* ── Mobile cards ── */}
      <div className="space-y-3 lg:hidden">
        {isLoading && (
          <div className="flex items-center justify-center py-12 gap-3">
            <Loader2 size={20} className="spin-arc text-blue-500" />
            <span className="text-sm text-slate-400 font-medium">Loading shifts…</span>
          </div>
        )}
        {!isLoading && shifts.length === 0 && (
          <div className="card p-8 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <CalendarDays size={22} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No shifts for this period</p>
            <p className="text-xs text-slate-400 dark:text-slate-600">Try a different month or year</p>
          </div>
        )}
        {!isLoading && shifts.map((shift: any) => {
          const sid       = String(shift.id || shift._id);
          const existing  = rowsByShift.get(sid);
          const draft     = editing[sid] || {};
          const startTime = toTime(draft.startTime ?? existing?.startTime ?? "");
          const endTime   = toTime(draft.endTime   ?? existing?.endTime   ?? "");
          const breakMins = Number(draft.breakDurationMinutes ?? existing?.breakDurationMinutes ?? 0);
          const total     = calcHours(startTime, endTime, breakMins) || Number(existing?.totalWorkedHours || 0).toFixed(2);
          const isSaving  = savingShiftId === sid;

          return (
            <div key={sid} className="card p-4 space-y-3 animate-scale-in">
              {/* Header row */}
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "#eff6ff" }}
                >
                  <Building2 size={15} style={{ color: "#2563eb" }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate">
                    {resolvePracticeName(shift, practiceMap)}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <ChevronRight size={10} />
                    {shift.pcn_name || shift.pcn || "—"}
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                    {fmtDate(shift.shift_date || shift.date)}
                  </p>
                </div>
                {total && (
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-black leading-tight" style={{ color: "#2563eb" }}>{total}</p>
                    <p className="text-[10px] font-semibold text-slate-400">hrs</p>
                  </div>
                )}
              </div>

              {/* Time inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="field-label">Start</label>
                  <input type="time" value={startTime}
                    onChange={(e) => onField(sid, "startTime", e.target.value)}
                    className="input" />
                </div>
                <div>
                  <label className="field-label">End</label>
                  <input type="time" value={endTime}
                    onChange={(e) => onField(sid, "endTime", e.target.value)}
                    className="input" />
                </div>
                <div>
                  <label className="field-label">Break (min)</label>
                  <input type="number" min="0" step="5" value={breakMins}
                    onChange={(e) => onField(sid, "breakDurationMinutes", e.target.value)}
                    className="input" />
                </div>
                <div>
                  <label className="field-label">Total</label>
                  <div
                    className="input font-bold"
                    style={{
                      color: "#2563eb",
                      background: "#eff6ff",
                      borderColor: "#bfdbfe",
                    }}
                  >
                    {total || "—"} h
                  </div>
                </div>
              </div>

              {/* Notes */}
              <input type="text"
                value={draft.notes ?? existing?.notes ?? ""}
                onChange={(e) => onField(sid, "notes", e.target.value)}
                className="input" placeholder="Notes (optional)" />

              {/* Status row */}
              <div className="flex items-center gap-2 flex-wrap">
                <StatusPill value={existing?.submissionStatus || "draft"} />
                <StatusPill value={existing?.managerApprovalStatus || "pending"} />
                <button
                  type="button"
                  onClick={() => onSave(shift)}
                  disabled={isSaving || upsertM.isPending}
                  className="btn btn-primary ml-auto text-xs px-3 py-1.5"
                >
                  {isSaving
                    ? <><Loader2 size={12} className="spin-arc" /> Saving…</>
                    : <><Save size={12} /> Save</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop table ── */}
      <div className="card hidden lg:block overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-pro">
            <thead>
              <tr>
                {["Practice / Surgery","PCN","Shift Ref","Date","Start","End","Break (min)","Total Hours","Notes","Submission","Approval",""].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={12} className="py-10 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <Loader2 size={18} className="spin-arc text-blue-500" />
                      <span className="text-sm font-medium">Loading…</span>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && shifts.length === 0 && (
                <tr>
                  <td colSpan={12} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <CalendarDays size={18} className="text-slate-300 dark:text-slate-600" />
                      </div>
                      <p className="text-sm font-semibold text-slate-400">No shifts for this period</p>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && shifts.map((shift: any) => {
                const sid       = String(shift.id || shift._id);
                const existing  = rowsByShift.get(sid);
                const draft     = editing[sid] || {};
                const startTime = toTime(draft.startTime ?? existing?.startTime ?? "");
                const endTime   = toTime(draft.endTime   ?? existing?.endTime   ?? "");
                const breakMins = Number(draft.breakDurationMinutes ?? existing?.breakDurationMinutes ?? 0);
                const total     = calcHours(startTime, endTime, breakMins) || Number(existing?.totalWorkedHours || 0).toFixed(2);
                const isSaving  = savingShiftId === sid;

                return (
                  <tr key={sid}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: "#eff6ff" }}
                        >
                          <Building2 size={12} style={{ color: "#3b82f6" }} />
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                          {resolvePracticeName(shift, practiceMap)}
                        </span>
                      </div>
                    </td>
                    <td className="text-slate-500 dark:text-slate-400">{shift.pcn_name || shift.pcn || "—"}</td>
                    <td>
                      <code className="text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-600 dark:text-slate-400">
                        {sid.slice(0, 8)}
                      </code>
                    </td>
                    <td className="whitespace-nowrap text-slate-600 dark:text-slate-400">{fmtDate(shift.shift_date || shift.date)}</td>
                    <td>
                      <input type="time" value={startTime}
                        onChange={(e) => onField(sid, "startTime", e.target.value)}
                        className="input w-[7.5rem]" />
                    </td>
                    <td>
                      <input type="time" value={endTime}
                        onChange={(e) => onField(sid, "endTime", e.target.value)}
                        className="input w-[7.5rem]" />
                    </td>
                    <td>
                      <input type="number" min="0" step="5" value={breakMins}
                        onChange={(e) => onField(sid, "breakDurationMinutes", e.target.value)}
                        className="input w-20" />
                    </td>
                    <td>
                      <span className="font-black" style={{ color: "#2563eb" }}>
                        {total || "—"}{total ? " h" : ""}
                      </span>
                    </td>
                    <td>
                      <input type="text"
                        value={draft.notes ?? existing?.notes ?? ""}
                        onChange={(e) => onField(sid, "notes", e.target.value)}
                        className="input w-44" placeholder="Notes…" />
                    </td>
                    <td><StatusPill value={existing?.submissionStatus || "draft"} /></td>
                    <td><StatusPill value={existing?.managerApprovalStatus || "pending"} /></td>
                    <td>
                      <button
                        type="button"
                        onClick={() => onSave(shift)}
                        disabled={isSaving || upsertM.isPending}
                        className="btn btn-primary text-xs px-3 py-1.5 whitespace-nowrap"
                      >
                        {isSaving
                          ? <><Loader2 size={12} className="spin-arc" /> Saving…</>
                          : <><Save size={12} /> Save</>}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

