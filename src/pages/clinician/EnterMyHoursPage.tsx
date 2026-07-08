import React, { useMemo, useState } from "react";
import { useAppSelector } from "../../hooks/redux";
import { useMyRota } from "../../hooks/useRota";
import { usePractices } from "../../hooks/usePractice";
import { useEnterMyHours, useSubmitEnterMyHours, useUpsertEnterMyHours } from "../../hooks/useEnterMyHours";
import { buildPracticeNameMap, isWorkingShift, resolvePracticeName } from "../../lib/practiceNames";
import {
  CalendarClock, Send, Save, Users, CheckCircle2, PencilLine,
  Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight,
  Loader2, Pencil, Clock,
} from "lucide-react";
import { toast } from "sonner";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const toTime  = (v: any) => String(v || "").slice(0, 5);
const fmtDate = (v: any) => (v ? new Date(v).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—");

// break time is not tracked by the backend, so total hours = end - start only
const calcHours = (startTime: any, endTime: any) => {
  if (!startTime || !endTime) return "";
  const [sh, sm] = String(startTime).slice(0, 5).split(":").map(Number);
  const [eh, em] = String(endTime).slice(0, 5).split(":").map(Number);
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return "";
  const mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) return "";
  return (Math.round((mins / 60) * 100) / 100).toFixed(2);
};

function getRowStatus(existing: any, total: string) {
  if (existing?.submissionStatus === "submitted") return { label: "Submitted", cls: "bg-violet-50 text-violet-600 border border-violet-200" };
  if (existing?.submissionStatus === "approved")  return { label: "Approved",  cls: "bg-emerald-50 text-emerald-600 border border-emerald-200" };
  if (existing?.submissionStatus === "rejected")  return { label: "Rejected",  cls: "bg-red-50 text-red-600 border border-red-200" };
  return Number(total) > 0
    ? { label: "Ready", cls: "bg-emerald-50 text-emerald-600 border border-emerald-200" }
    : { label: "Draft", cls: "bg-amber-50 text-amber-600 border border-amber-200" };
}

function TimeField({
  value, disabled, onChange, onBlur, locked,
}: { value: string; disabled?: boolean; onChange: (v: string) => void; onBlur?: () => void; locked?: boolean; }) {
  return (
    <div
      className={`group relative flex items-center rounded-lg border transition-colors ${
        locked
          ? "border-slate-200 bg-slate-50"
          : "border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 hover:border-slate-300"
      }`}
    >
      <Clock
        size={13}
        className={`absolute left-2.5 pointer-events-none ${locked ? "text-slate-300" : "text-slate-400 group-focus-within:text-blue-500"}`}
      />
      <input
        type="time"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`w-full pl-8 pr-2 py-1.5 text-sm bg-transparent rounded-lg outline-none disabled:cursor-not-allowed ${
          locked ? "text-slate-500" : "text-slate-700 font-medium"
        }`}
      />
    </div>
  );
}

export default function EnterMyHoursPage() {
  const user = useAppSelector((s: any) => s.auth.user);
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year,  setYear]  = useState(today.getFullYear());
  const [editing, setEditing]             = useState<Record<string, any>>({});
  const [savingShiftId, setSavingShiftId] = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | ready | draft
  const [showFilters, setShowFilters]   = useState(false);
  const [page, setPage]         = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [unlockedSids, setUnlockedSids] = useState<Set<string>>(new Set());

  const { data: rotaData,      isLoading: rotaLoading } = useMyRota(month, year);
  const { data: practicesData }                          = usePractices();
  const { data: enteredRows = [], isLoading: rowsLoading } = useEnterMyHours(month, year);
  const upsertM = useUpsertEnterMyHours();
  const submitM = useSubmitEnterMyHours();

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

  // derive display rows (with computed hours + status) once, reused for stats/filter/table
  const derived = useMemo(() => {
    return shifts.map((shift: any) => {
      const sid       = String(shift.id || shift._id);
      const existing  = rowsByShift.get(sid);
      const draft     = editing[sid] || {};
      const startTime = toTime(draft.startTime ?? existing?.startTime ?? "");
      const endTime   = toTime(draft.endTime   ?? existing?.endTime   ?? "");
      const notes     = draft.notes ?? existing?.notes ?? "";
      const total     = calcHours(startTime, endTime) || Number(existing?.totalWorkedHours || 0).toFixed(2);
      const status    = getRowStatus(existing, total);
      const practiceName = resolvePracticeName(shift, practiceMap);
      return { shift, sid, existing, startTime, endTime, notes, total, status, practiceName };
    });
  }, [shifts, rowsByShift, editing, practiceMap]);

  const stats = useMemo(() => ({
    all:       derived.length,
    ready:     derived.filter((d) => d.status.label === "Ready").length,
    draft:     derived.filter((d) => d.status.label === "Draft").length,
    submitted: derived.filter((d) => d.status.label === "Submitted").length,
  }), [derived]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return derived.filter((d) => {
      if (statusFilter === "ready" && d.status.label !== "Ready") return false;
      if (statusFilter === "draft" && d.status.label !== "Draft") return false;
      if (!q) return true;
      return (
        d.practiceName.toLowerCase().includes(q) ||
        d.sid.toLowerCase().includes(q) ||
        String(d.notes || "").toLowerCase().includes(q)
      );
    });
  }, [derived, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageSafe   = Math.min(page, totalPages);
  const pageRows   = filtered.slice((pageSafe - 1) * rowsPerPage, pageSafe * rowsPerPage);

  const onField = (shiftId: string, key: string, value: any) =>
    setEditing((prev) => ({ ...prev, [shiftId]: { ...(prev[shiftId] || {}), [key]: value } }));

  const onSave = async (shift: any) => {
    const sid      = String(shift.id || shift._id);
    const existing = rowsByShift.get(sid);
    const draft    = editing[sid] || {};
    const startTime = toTime(draft.startTime ?? existing?.startTime ?? "");
    const endTime   = toTime(draft.endTime   ?? existing?.endTime   ?? "");
    const notes     = String(draft.notes     ?? existing?.notes     ?? "");

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
        startTime, endTime, notes,
      });
      toast.success("Hours saved successfully");
      setEditing((prev) => ({ ...prev, [sid]: {} }));
      // lock the row again after a successful save — clinician can tap "Edit" to change it later
      setUnlockedSids((prev) => {
        const next = new Set(prev);
        next.delete(sid);
        return next;
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save hours. Please try again.");
    } finally {
      setSavingShiftId(null);
    }
  };

  // auto-save only once BOTH start and end time are filled in
  const onFieldBlur = (shift: any) => {
    const sid = String(shift.id || shift._id);
    const hasChanges = editing[sid] && Object.keys(editing[sid]).length > 0;
    if (!hasChanges) return;

    const existing  = rowsByShift.get(sid);
    const draft     = editing[sid] || {};
    const startTime = toTime(draft.startTime ?? existing?.startTime ?? "");
    const endTime   = toTime(draft.endTime   ?? existing?.endTime   ?? "");

    if (startTime && endTime) {
      onSave(shift);
    }
  };

  const onSaveAllDrafts = async () => {
    const dirtyShiftIds = Object.keys(editing).filter((sid) => editing[sid] && Object.keys(editing[sid]).length > 0);
    if (dirtyShiftIds.length === 0) {
      toast.info("No unsaved changes to save");
      return;
    }
    for (const sid of dirtyShiftIds) {
      const shift = shifts.find((s: any) => String(s.id || s._id) === sid);
      if (shift) await onSave(shift);
    }
  };

  const onSubmitMonth = async () => {
    try {
      await submitM.mutateAsync({ month, year });
      toast.success("Month submitted successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit month. Please try again.");
    }
  };

  const isLoading = rotaLoading || rowsLoading;

  const inputCls  = "w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const cardCls   = "rounded-2xl border border-slate-200 bg-white shadow-sm";
  const primaryBtnCls  = "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors";
  const outlineBtnCls  = "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold transition-colors";

  return (
    <div className="min-h-full bg-slate-50 space-y-5 pb-10">

      {/* ── Page header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-blue-50">
            <CalendarClock size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">Log My Hours</h1>
            <p className="text-sm text-slate-500">Record actual worked hours against your assigned shifts.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={onSaveAllDrafts} className={outlineBtnCls}>
            <Save size={15} /> Save Drafts
          </button>
          <button
            type="button"
            onClick={onSubmitMonth}
            disabled={submitM.isPending || shifts.length === 0}
            className={primaryBtnCls}
          >
            {submitM.isPending
              ? <><Loader2 size={15} className="animate-spin" /> Submitting…</>
              : <><Send size={15} /> Submit Month to Admin</>}
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${cardCls} p-4 flex items-center gap-3`}>
          <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 bg-blue-50">
            <Users size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">All Shifts</p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">{stats.all}</p>
            <p className="text-xs text-slate-400">Total shifts this month</p>
          </div>
        </div>
        <div className={`${cardCls} p-4 flex items-center gap-3`}>
          <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 bg-emerald-50">
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Ready to Submit</p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">{stats.ready}</p>
            <p className="text-xs text-slate-400">Entries ready for submission</p>
          </div>
        </div>
        <div className={`${cardCls} p-4 flex items-center gap-3`}>
          <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 bg-amber-50">
            <PencilLine size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Draft Entries</p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">{stats.draft}</p>
            <p className="text-xs text-slate-400">Entries saved as drafts</p>
          </div>
        </div>
        <div className={`${cardCls} p-4 flex items-center gap-3`}>
          <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 bg-violet-50">
            <Send size={18} className="text-violet-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Submitted</p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">{stats.submitted}</p>
            <p className="text-xs text-slate-400">Entries submitted to admin</p>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className={`${cardCls} p-3 flex flex-wrap items-center gap-2.5`}>
        <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
          {[
            { key: "all",   label: "All Shifts" },
            { key: "ready", label: "Ready" },
            { key: "draft", label: "Draft" },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => { setStatusFilter(opt.key); setPage(1); }}
              className={`px-3 py-1.5 text-sm font-semibold flex items-center gap-1.5 ${
                statusFilter === opt.key ? "bg-blue-50 text-blue-600" : "bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              {opt.key === "all" && <Users size={14} />}
              {opt.label}
            </button>
          ))}
        </div>

        <select
          value={month}
          onChange={(e) => { setMonth(Number(e.target.value)); setPage(1); }}
          className={`${inputCls} w-40`}
        >
          {MONTH_NAMES.map((m, i) => (<option key={i} value={i + 1}>{m}</option>))}
        </select>

        <input
          type="number" min="2020" max="2100"
          value={year}
          onChange={(e) => { setYear(Number(e.target.value || today.getFullYear())); setPage(1); }}
          placeholder="Year"
          className={`${inputCls} w-36`}
        />

        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by surgery, ref, or notes..."
            className={`${inputCls} pl-9`}
          />
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className={outlineBtnCls}
        >
          <SlidersHorizontal size={15} /> Filters
        </button>
      </div>

      {showFilters && (
        <div className={`${cardCls} p-4 flex flex-wrap items-center gap-3 text-sm text-slate-500`}>
          Additional filters can go here (e.g. min hours, PCN, shift type).
        </div>
      )}

      {/* ── Table ── */}
      <div className={`${cardCls} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">Practice / Surgery</th>
                <th className="text-left px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  <span className="inline-flex items-center gap-1">Date <ArrowUpDown size={11} /></span>
                </th>
                <th className="text-left px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">Start</th>
                <th className="text-left px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">End</th>
                <th className="text-left px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">Total Hours</th>
                <th className="text-left px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">Notes</th>
                <th className="text-left px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">Status</th>
                <th className="text-left px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td colSpan={8} className="py-10 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <Loader2 size={18} className="animate-spin text-blue-500" />
                      <span className="text-sm font-medium">Loading…</span>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && pageRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <CalendarClock size={26} className="text-blue-500" />
                      </div>
                      <p className="text-[15px] font-bold text-slate-700">No shifts match your filters</p>
                      <p className="text-sm text-slate-500">Try adjusting the month, year, or search terms.</p>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && pageRows.map((row) => {
                const { shift, sid, startTime, endTime, total, status, practiceName, existing } = row;
                const draft     = editing[sid] || {};
                const isSaving  = savingShiftId === sid;
                // locked = already saved and clinician hasn't tapped "Edit" yet -> fields are read-only
                const isLocked  = !!existing?._id && !unlockedSids.has(sid);
                const readOnlyCls = "text-slate-600 bg-slate-50";

                return (
                  <tr key={sid} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-semibold text-slate-800">{practiceName}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-slate-600">{fmtDate(shift.shift_date || shift.date)}</td>
                    <td className="px-3 py-2">
                      <TimeField
                        value={startTime}
                        disabled={isLocked}
                        locked={isLocked}
                        onChange={(v) => onField(sid, "startTime", v)}
                        onBlur={() => onFieldBlur(shift)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <TimeField
                        value={endTime}
                        disabled={isLocked}
                        locked={isLocked}
                        onChange={(v) => onField(sid, "endTime", v)}
                        onBlur={() => onFieldBlur(shift)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-bold text-blue-600">{total || "0.00"} h</span>
                    </td>
                    <td className="px-3 py-2">
                      <input type="text"
                        value={draft.notes ?? row.notes ?? ""}
                        disabled={isLocked}
                        onChange={(e) => onField(sid, "notes", e.target.value)}
                        onBlur={() => onFieldBlur(shift)}
                        className={`${inputCls} w-40 ${isLocked ? readOnlyCls : ""}`} placeholder="—" />
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {isSaving ? (
                        <span className="text-slate-400 text-xs inline-flex items-center gap-1">
                          <Loader2 size={12} className="animate-spin" /> Saving…
                        </span>
                      ) : isLocked ? (
                        <button
                          type="button"
                          onClick={() => setUnlockedSids((prev) => new Set(prev).add(sid))}
                          className="text-blue-600 hover:text-blue-700 font-semibold text-xs inline-flex items-center gap-1"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                      ) : (
                        <span className="text-emerald-500 text-xs font-semibold">Auto-saves on change</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <p>
          Showing {filtered.length === 0 ? 0 : (pageSafe - 1) * rowsPerPage + 1} to{" "}
          {Math.min(pageSafe * rowsPerPage, filtered.length)} of {filtered.length} shifts
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={pageSafe <= 1}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm font-semibold flex items-center justify-center ${
                p === pageSafe ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={pageSafe >= totalPages}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
            className={`${inputCls} w-20`}
          >
            {[10, 20, 50].map((n) => (<option key={n} value={n}>{n}</option>))}
          </select>
        </div>
      </div>
    </div>
  );
}